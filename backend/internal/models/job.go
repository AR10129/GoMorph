package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type JobStatus string

const (
	JobStatusQueued     JobStatus = "queued"
	JobStatusProcessing JobStatus = "processing"
	JobStatusCompleted  JobStatus = "completed"
	JobStatusFailed     JobStatus = "failed"
)

type Job struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID            uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	Status            JobStatus  `gorm:"type:varchar(50);not null;index" json:"status"`
	InputFormat       string     `gorm:"type:varchar(10);not null" json:"input_format"`
	OutputFormat      string     `gorm:"type:varchar(10);not null" json:"output_format"`
	OriginalFilename  string     `gorm:"type:varchar(255);not null" json:"original_filename"`
	OriginalS3Key     string     `gorm:"type:varchar(500)" json:"original_s3_key"`
	ConvertedS3Key    string     `gorm:"type:varchar(500)" json:"converted_s3_key"`
	FileSizeBytes     int64      `json:"file_size_bytes"`
	ErrorMessage      string     `gorm:"type:text" json:"error_message,omitempty"`
	WatermarkEnabled  bool       `gorm:"default:false" json:"watermark_enabled"`
	WatermarkConfig   string     `gorm:"type:jsonb" json:"watermark_config,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	CompletedAt       *time.Time `json:"completed_at,omitempty"`

	// Relations
	User User `gorm:"foreignKey:UserID" json:"-"`
}

func (j *Job) BeforeCreate(tx *gorm.DB) error {
	if j.ID == uuid.Nil {
		j.ID = uuid.New()
	}
	return nil
}
