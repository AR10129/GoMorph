package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/AR10129/GoMorph/backend/internal/database"
	"github.com/AR10129/GoMorph/backend/internal/models"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const QueueName = "conversion_queue"

type JobService struct {
	redisClient *redis.Client
}

type JobTask struct {
	JobID        uuid.UUID              `json:"job_id"`
	UserID       uuid.UUID              `json:"user_id"`
	InputS3Key   string                 `json:"input_s3_key"`
	InputFormat  string                 `json:"input_format"`
	OutputFormat string                 `json:"output_format"`
	WatermarkEnabled bool `json:"watermark_enabled"`
	WatermarkConfig  string `json:"watermark_config"`
	Settings     map[string]interface{} `json:"settings"`
	CreatedAt    time.Time              `json:"created_at"`
}

func NewJobService(redisClient *redis.Client) *JobService {
	return &JobService{
		redisClient: redisClient,
	}
}

// EnqueueJob adds a job to the Redis queue
func (s *JobService) EnqueueJob(ctx context.Context, job *models.Job) error {
	task := JobTask{
		JobID:            job.ID,
		UserID:           job.UserID,
		InputS3Key:       job.OriginalS3Key,
		InputFormat:      job.InputFormat,
		OutputFormat:     job.OutputFormat,
		WatermarkEnabled: job.WatermarkEnabled,
		WatermarkConfig:  job.WatermarkConfig,
		Settings:         make(map[string]interface{}),
		CreatedAt:        job.CreatedAt,
	}

	taskData, err := json.Marshal(task)
	if err != nil {
		return fmt.Errorf("failed to marshal task: %w", err)
	}

	if err := s.redisClient.LPush(ctx, QueueName, taskData).Err(); err != nil {
		return fmt.Errorf("failed to enqueue job: %w", err)
	}

	return nil
}

// DequeueJob retrieves the next job from the queue (blocking)
func (s *JobService) DequeueJob(ctx context.Context) (*JobTask, error) {
	result, err := s.redisClient.BRPop(ctx, 0, QueueName).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to dequeue job: %w", err)
	}

	if len(result) < 2 {
		return nil, fmt.Errorf("invalid queue result")
	}

	var task JobTask
	if err := json.Unmarshal([]byte(result[1]), &task); err != nil {
		return nil, fmt.Errorf("failed to unmarshal task: %w", err)
	}

	return &task, nil
}

// UpdateJobStatus updates job status in database
func (s *JobService) UpdateJobStatus(ctx context.Context, jobID uuid.UUID, status models.JobStatus, convertedS3Key string, errorMsg string) error {
	updates := map[string]interface{}{
		"status":      status,
		"updated_at":  time.Now(),
	}

	if convertedS3Key != "" {
		updates["converted_s3_key"] = convertedS3Key
	}

	if errorMsg != "" {
		updates["error_message"] = errorMsg
	}

	if status == models.JobStatusCompleted {
		now := time.Now()
		updates["completed_at"] = &now
	}

	if err := database.DB.Model(&models.Job{}).Where("id = ?", jobID).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to update job status: %w", err)
	}

	return nil
}
