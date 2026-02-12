package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ConversionHistory struct {
	ID                    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID                uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	JobID                 uuid.UUID `gorm:"type:uuid;not null" json:"job_id"`
	InputFormat           string    `gorm:"type:varchar(10)" json:"input_format"`
	OutputFormat          string    `gorm:"type:varchar(10)" json:"output_format"`
	OriginalS3Key         string    `gorm:"type:text" json:"original_s3_key"`
	ConvertedS3Key        string    `gorm:"type:text" json:"converted_s3_key"`
	FileSizeBytes         int64     `json:"file_size_bytes"`
	ConversionTimeSeconds float64   `json:"conversion_time_seconds"`
	Status                JobStatus `gorm:"type:varchar(20);default:'completed'" json:"status"`
	ConvertedAt           time.Time `json:"converted_at"`
	CreatedAt             time.Time `gorm:"index" json:"created_at"`

	// Relations
	User User `gorm:"foreignKey:UserID" json:"-"`
	Job  Job  `gorm:"foreignKey:JobID" json:"-"`
}

func (h *ConversionHistory) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}
