package handlers

import (
	"net/http"
	"time"

	"github.com/AR10129/GoMorph/backend/internal/database"
	"github.com/AR10129/GoMorph/backend/internal/middleware"
	"github.com/AR10129/GoMorph/backend/internal/models"
	"github.com/AR10129/GoMorph/backend/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DownloadHandler struct {
	storage *storage.S3Storage
}

func NewDownloadHandler(s3Storage *storage.S3Storage) *DownloadHandler {
	return &DownloadHandler{
		storage: s3Storage,
	}
}

// Download godoc
// @Summary Get download URL for converted file
// @Tags conversion
// @Produce json
// @Param id path string true "Job ID"
// @Success 200 {object} map[string]string
// @Security BearerAuth
// @Router /api/download/{id} [get]
func (h *DownloadHandler) Download(c *gin.Context) {
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

	// Find job
	var job models.Job
	if err := database.DB.Where("id = ? AND user_id = ?", jobID, userID).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	// Check if job is completed
	if job.Status != models.JobStatusCompleted {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Job is not completed yet"})
		return
	}

	// Generate presigned URL (valid for 1 hour)
	downloadURL, err := h.storage.GeneratePresignedURL(c.Request.Context(), job.ConvertedS3Key, 1*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate download URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"download_url": downloadURL,
		"expires_in":   3600, // seconds
	})
}
