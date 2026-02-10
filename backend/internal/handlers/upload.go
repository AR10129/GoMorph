package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/AR10129/GoMorph/backend/internal/config"
	"github.com/AR10129/GoMorph/backend/internal/database"
	"github.com/AR10129/GoMorph/backend/internal/middleware"
	"github.com/AR10129/GoMorph/backend/internal/models"
	"github.com/AR10129/GoMorph/backend/internal/services"
	"github.com/AR10129/GoMorph/backend/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct {
	storage    *storage.S3Storage
	jobService *services.JobService
}

func NewUploadHandler(s3Storage *storage.S3Storage, jobService *services.JobService) *UploadHandler {
	return &UploadHandler{
		storage:    s3Storage,
		jobService: jobService,
	}
}

var AllowedFormats = map[string][]string{
	"image":    {"png", "jpg", "webp", "gif", "svg"},
	"video":    {"mp4", "avi", "mov", "mkv", "webm"},
	"audio":    {"mp3", "wav", "flac", "aac", "ogg"},
	"document": {"pdf", "docx", "txt", "rtf", "odt"},
	"archive":  {"zip", "rar", "7z", "tar", "gzip"},
}

// Upload godoc
// @Summary Upload a file for conversion
// @Tags conversion
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to convert"
// @Param output_format formData string true "Output format"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/upload [post]
func (h *UploadHandler) Upload(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided"})
		return
	}

	// Check file size (convert MB to bytes)
	maxSize := config.AppConfig.MaxFileSizeMB * 1024 * 1024
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("File size exceeds maximum limit of %dMB", config.AppConfig.MaxFileSizeMB),
		})
		return
	}

	// Get output format
	outputFormat := c.PostForm("output_format")
	if outputFormat == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Output format is required"})
		return
	}

	// Extract input format from filename
	ext := strings.ToLower(strings.TrimPrefix(filepath.Ext(file.Filename), "."))
	if ext == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file format"})
		return
	}

	// Validate format
	if !isValidFormat(ext) || !isValidFormat(outputFormat) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported file format"})
		return
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}
	defer src.Close()

	// Upload to S3
	s3Key, err := h.storage.Upload(c.Request.Context(), src, file.Filename, file.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
		return
	}

	// Create job record
	job := &models.Job{
		UserID:           userID,
		Status:           models.JobStatusQueued,
		InputFormat:      ext,
		OutputFormat:     outputFormat,
		OriginalFilename: file.Filename,
		OriginalS3Key:    s3Key,
		FileSizeBytes:    file.Size,
	}

	if err := database.DB.Create(job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job"})
		return
	}

	// Enqueue job to Redis for processing
	if err := h.jobService.EnqueueJob(c.Request.Context(), job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enqueue job"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully and queued for conversion",
		"job":     job,
	})
}

func isValidFormat(format string) bool {
	for _, formats := range AllowedFormats {
		for _, f := range formats {
			if f == format {
				return true
			}
		}
	}
	return false
}

// GetJobs godoc
// @Summary Get all jobs for the authenticated user
// @Tags conversion
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/jobs [get]
func (h *UploadHandler) GetJobs(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var jobs []models.Job
	if err := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch jobs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

// GetJobByID godoc
// @Summary Get job status by ID
// @Tags conversion
// @Produce json
// @Param id path string true "Job ID"
// @Success 200 {object} models.Job
// @Security BearerAuth
// @Router /api/jobs/{id} [get]
func (h *UploadHandler) GetJobByID(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	jobID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	var job models.Job
	if err := database.DB.Where("id = ? AND user_id = ?", jobID, userID).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, job)
}
