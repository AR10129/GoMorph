package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/AR10129/GoMorph/backend/internal/database"
	"github.com/AR10129/GoMorph/backend/internal/middleware"
	"github.com/AR10129/GoMorph/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type HistoryHandler struct{}

func NewHistoryHandler() *HistoryHandler {
	return &HistoryHandler{}
}

// HistoryStats represents conversion statistics
type HistoryStats struct {
	TotalConversions int64              `json:"total_conversions"`
	TotalDataSizeMB  float64            `json:"total_data_size_mb"`
	FormatBreakdown  map[string]int64   `json:"format_breakdown"`
	RecentActivity   []ConversionSummary `json:"recent_activity"`
}

type ConversionSummary struct {
	ID           uuid.UUID `json:"id"`
	InputFormat  string    `json:"input_format"`
	OutputFormat string    `json:"output_format"`
	ConvertedAt  time.Time `json:"converted_at"`
	Status       string    `json:"status"`
}

// GetHistory godoc
// @Summary Get user's conversion history
// @Tags history
// @Produce json
// @Param status query string false "Filter by status"
// @Param format query string false "Filter by format"
// @Param from_date query string false "Filter from date (RFC3339)"
// @Param to_date query string false "Filter to date (RFC3339)"
// @Param limit query int false "Limit results (default 20)"
// @Param offset query int false "Offset for pagination"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/history [get]
func (h *HistoryHandler) GetHistory(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse query parameters
	status := c.Query("status")
	format := c.Query("format")
	fromDate := c.Query("from_date")
	toDate := c.Query("to_date")
	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")

	// Build query
	query := database.DB.Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if format != "" {
		query = query.Where("input_format = ? OR output_format = ?", format, format)
	}

	if fromDate != "" {
		if parsedDate, err := time.Parse(time.RFC3339, fromDate); err == nil {
			query = query.Where("converted_at >= ?", parsedDate)
		}
	}

	if toDate != "" {
		if parsedDate, err := time.Parse(time.RFC3339, toDate); err == nil {
			query = query.Where("converted_at <= ?", parsedDate)
		}
	}

	// Get total count
	var totalCount int64
	query.Model(&models.ConversionHistory{}).Count(&totalCount)

	// Get paginated results
	var history []models.ConversionHistory
	if err := query.
		Order("converted_at DESC").
		Limit(parseInt(limit)).
		Offset(parseInt(offset)).
		Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"history":     history,
		"total_count": totalCount,
		"limit":       parseInt(limit),
		"offset":      parseInt(offset),
	})
}

// GetHistoryStats godoc
// @Summary Get conversion statistics
// @Tags history
// @Produce json
// @Success 200 {object} HistoryStats
// @Security BearerAuth
// @Router /api/history/stats [get]
func (h *HistoryHandler) GetHistoryStats(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var stats HistoryStats

	// Total conversions
	database.DB.Model(&models.ConversionHistory{}).
		Where("user_id = ?", userID).
		Count(&stats.TotalConversions)

	// Total data size
	var totalSize struct {
		Total float64
	}
	database.DB.Model(&models.ConversionHistory{}).
		Select("COALESCE(SUM(file_size_bytes), 0) / 1024.0 / 1024.0 as total").
		Where("user_id = ?", userID).
		Scan(&totalSize)
	stats.TotalDataSizeMB = totalSize.Total

	// Format breakdown
	type FormatCount struct {
		Format string
		Count  int64
	}
	var formatCounts []FormatCount
	database.DB.Model(&models.ConversionHistory{}).
		Select("output_format as format, COUNT(*) as count").
		Where("user_id = ?", userID).
		Group("output_format").
		Order("count DESC").
		Limit(10).
		Scan(&formatCounts)

	stats.FormatBreakdown = make(map[string]int64)
	for _, fc := range formatCounts {
		stats.FormatBreakdown[fc.Format] = fc.Count
	}

	// Recent activity (last 10)
	var recentHistory []models.ConversionHistory
	database.DB.Where("user_id = ?", userID).
		Order("converted_at DESC").
		Limit(10).
		Find(&recentHistory)

	stats.RecentActivity = make([]ConversionSummary, len(recentHistory))
	for i, h := range recentHistory {
		stats.RecentActivity[i] = ConversionSummary{
			ID:           h.ID,
			InputFormat:  h.InputFormat,
			OutputFormat: h.OutputFormat,
			ConvertedAt:  h.ConvertedAt,
			Status:       string(h.Status),
		}
	}

	c.JSON(http.StatusOK, stats)
}

// DeleteHistory godoc
// @Summary Delete a history entry
// @Tags history
// @Param id path string true "History ID"
// @Success 200 {object} map[string]string
// @Security BearerAuth
// @Router /api/history/{id} [delete]
func (h *HistoryHandler) DeleteHistory(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	historyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid history ID"})
		return
	}

	// Check ownership and delete
	result := database.DB.Where("id = ? AND user_id = ?", historyID, userID).
		Delete(&models.ConversionHistory{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete history"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "History not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "History deleted successfully"})
}

// Helper function to parse int with default
func parseInt(s string) int {
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	if err != nil {
		return 0
	}
	return result
}
