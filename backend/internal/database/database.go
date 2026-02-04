package database

import (
	"log"

	"github.com/AR10129/GoMorph/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(databaseURL string) error {
	var err error
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return err
	}

	log.Println(" Database connected successfully")
	return nil
}

func Migrate() error {
	log.Println("Running database migrations...")
	
	err := DB.AutoMigrate(
		&models.User{},
		&models.Job{},
		&models.ConversionHistory{},
	)
	
	if err != nil {
		return err
	}
	
	log.Println("Migrations completed successfully")
	return nil
}
