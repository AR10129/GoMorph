package worker

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/AR10129/GoMorph/backend/internal/config"
	"github.com/AR10129/GoMorph/backend/internal/database"
	"github.com/AR10129/GoMorph/backend/internal/models"
	"github.com/AR10129/GoMorph/backend/internal/services"
	"github.com/AR10129/GoMorph/backend/internal/storage"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Processor struct {
	jobService        *services.JobService
	conversionService *services.ConversionService
	s3Storage         *storage.S3Storage
	redisClient       *redis.Client
	cfg               *config.Config
}

func NewProcessor(redisClient *redis.Client, s3Storage *storage.S3Storage, cfg *config.Config) *Processor {
	return &Processor{
		jobService:        services.NewJobService(redisClient),
		conversionService: services.NewConversionService(),
		s3Storage:         s3Storage,
		redisClient:       redisClient,
		cfg:               cfg,
	}
}

// Start begins processing jobs from the queue
func (p *Processor) Start(ctx context.Context) {
	log.Println("Worker processor started. Waiting for jobs...")

	for {
		select {
		case <-ctx.Done():
			log.Println("Worker processor shutting down...")
			return
		default:
			if err := p.processNextJob(ctx); err != nil {
				log.Printf("Error processing job: %v", err)
				time.Sleep(1 * time.Second) // Brief pause on error
			}
		}
	}
}

// processNextJob dequeues and processes a single job
func (p *Processor) processNextJob(ctx context.Context) error {
	// Dequeue job from Redis (blocking)
	task, err := p.jobService.DequeueJob(ctx)
	if err != nil {
		return fmt.Errorf("failed to dequeue job: %w", err)
	}

	log.Printf("Processing job: %s (User: %s, %s -> %s)",
		task.JobID, task.UserID, task.InputFormat, task.OutputFormat)

	// Update status to processing
	if err := p.jobService.UpdateJobStatus(ctx, task.JobID, models.JobStatusProcessing, "", ""); err != nil {
		log.Printf("Failed to update job status to processing: %v", err)
	}

	// Process the conversion
	outputS3Key, err := p.convertFile(ctx, task)
	if err != nil {
		log.Printf("Job %s failed: %v", task.JobID, err)
		p.jobService.UpdateJobStatus(ctx, task.JobID, models.JobStatusFailed, "", err.Error())
		if historyErr := p.saveConversionHistory(ctx, task, "", models.JobStatusFailed); historyErr != nil {
			log.Printf("Failed to save failed conversion history: %v", historyErr)
		}
		return err
	}

	// Update status to completed
	if err := p.jobService.UpdateJobStatus(ctx, task.JobID, models.JobStatusCompleted, outputS3Key, ""); err != nil {
		log.Printf("Failed to update job status to completed: %v", err)
		return err
	}

	// Save to conversion history
	if err := p.saveConversionHistory(ctx, task, outputS3Key, models.JobStatusCompleted); err != nil {
		log.Printf("Failed to save conversion history: %v", err)
	}

	log.Printf("Job %s completed successfully", task.JobID)
	return nil
}

// convertFile performs the actual file conversion
func (p *Processor) convertFile(ctx context.Context, task *services.JobTask) (string, error) {
	// Create temporary directory for processing
	tempDir, err := os.MkdirTemp("", "conversion-*")
	if err != nil {
		return "", fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Download input file from S3
	inputPath := filepath.Join(tempDir, fmt.Sprintf("input.%s", task.InputFormat))
	if err := p.s3Storage.Download(ctx, task.InputS3Key, inputPath); err != nil {
		return "", fmt.Errorf("failed to download input file: %w", err)
	}

	// Determine output path
	outputPath := filepath.Join(tempDir, fmt.Sprintf("output.%s", task.OutputFormat))

	// Convert based on file category
	category := services.GetFileCategory(task.InputFormat)

	switch category {
	case "image":
		if err := p.conversionService.ConvertImage(ctx, inputPath, outputPath, task.OutputFormat); err != nil {
			return "", err
		}
	case "video":
		if err := p.conversionService.ConvertVideo(ctx, inputPath, outputPath, task.OutputFormat); err != nil {
			return "", err
		}
	case "audio":
		if err := p.conversionService.ConvertAudio(ctx, inputPath, outputPath, task.OutputFormat); err != nil {
			return "", err
		}
	case "document":
		if err := p.conversionService.ConvertDocument(ctx, inputPath, outputPath, task.OutputFormat); err != nil {
			return "", err
		}
	case "archive":
		if err := p.conversionService.ConvertArchive(ctx, inputPath, outputPath, task.OutputFormat); err != nil {
			return "", err
		}
	default:
		return "", fmt.Errorf("unsupported file category: %s", category)
	}

	// Upload converted file to S3
	outputS3Key := fmt.Sprintf("converted/%s/%s.%s", task.UserID, uuid.New(), task.OutputFormat)
	if err := p.s3Storage.UploadFile(ctx, outputPath, outputS3Key); err != nil {
		return "", fmt.Errorf("failed to upload converted file: %w", err)
	}

	return outputS3Key, nil
}

// saveConversionHistory saves the conversion to history table
func (p *Processor) saveConversionHistory(ctx context.Context, task *services.JobTask, outputS3Key string, status models.JobStatus) error {
	var job models.Job
	if err := database.DB.Where("id = ?", task.JobID).First(&job).Error; err != nil {
		return fmt.Errorf("failed to load job for history: %w", err)
	}

	convertedAt := time.Now()
	if status == models.JobStatusCompleted && job.CompletedAt != nil {
		convertedAt = *job.CompletedAt
	}

	conversionSeconds := convertedAt.Sub(job.CreatedAt).Seconds()
	if conversionSeconds < 0 {
		conversionSeconds = 0
	}

	history := &models.ConversionHistory{
		ID:                    uuid.New(),
		UserID:                task.UserID,
		JobID:                 task.JobID,
		InputFormat:           task.InputFormat,
		OutputFormat:          task.OutputFormat,
		OriginalS3Key:         task.InputS3Key,
		ConvertedS3Key:        outputS3Key,
		FileSizeBytes:         job.FileSizeBytes,
		ConversionTimeSeconds: conversionSeconds,
		Status:                status,
		ConvertedAt:           convertedAt,
	}

	if err := database.DB.Create(history).Error; err != nil {
		return fmt.Errorf("failed to create history record: %w", err)
	}

	return nil
}
