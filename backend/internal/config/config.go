package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DatabaseURL        string
	RedisURL           string
	RedisPassword      string
	JWTSecret          string
	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	AWSS3Bucket        string
	MaxFileSizeMB      int64
	AllowedOrigins     string
	WorkerConcurrency  int
}

var AppConfig *Config

func Load() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	maxSize, _ := strconv.ParseInt(getEnv("MAX_FILE_SIZE_MB", "30"), 10, 64)
	workerConcurrency, _ := strconv.Atoi(getEnv("WORKER_CONCURRENCY", "10"))

	AppConfig = &Config{
		Port:               getEnv("PORT", "8000"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		RedisURL:           getEnv("REDIS_URL", "localhost:6379"),
		RedisPassword:      getEnv("REDIS_PASSWORD", ""),
		JWTSecret:          getEnv("JWT_SECRET", ""),
		AWSRegion:          getEnv("AWS_REGION", "us-east-1"),
		AWSAccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWSS3Bucket:        getEnv("AWS_S3_BUCKET", ""),
		MaxFileSizeMB:      maxSize,
		AllowedOrigins:     getEnv("ALLOWED_ORIGINS", "http://localhost:5173"),
		WorkerConcurrency:  workerConcurrency,
	}

	// Validate required fields
	if AppConfig.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	if AppConfig.JWTSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}
	if AppConfig.AWSS3Bucket == "" {
		log.Fatal("AWS_S3_BUCKET is required")
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
