package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/AR10129/GoMorph/backend/internal/config"
	"github.com/AR10129/GoMorph/backend/internal/database"
	"github.com/AR10129/GoMorph/backend/internal/routes"
	"github.com/AR10129/GoMorph/backend/internal/storage"
	"github.com/AR10129/GoMorph/backend/internal/worker"
	"github.com/redis/go-redis/v9"
)

func main() {
	// Load configuration
	log.Println("Loading configuration...")
	config.Load()

	// Connect to database
	log.Println("Connecting to database...")
	if err := database.Connect(config.AppConfig.DatabaseURL); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize Redis client
	log.Println("Connecting to Redis...")
	var redisClient *redis.Client
	if strings.HasPrefix(config.AppConfig.RedisURL, "redis://") || strings.HasPrefix(config.AppConfig.RedisURL, "rediss://") {
		opt, err := redis.ParseURL(config.AppConfig.RedisURL)
		if err != nil {
			log.Fatal("Failed to parse REDIS_URL:", err)
		}
		redisClient = redis.NewClient(opt)
	} else {
		redisClient = redis.NewClient(&redis.Options{
			Addr:     config.AppConfig.RedisURL,
			Password: config.AppConfig.RedisPassword,
			DB:       0,
		})
	}

	// Test Redis connection
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}
	log.Println("Redis connected successfully")

	// Initialize S3 storage
	log.Println("Initializing S3 storage...")
	s3Storage, err := storage.NewS3Storage()
	if err != nil {
		log.Fatal("Failed to initialize S3 storage:", err)
	}

	// Setup router
	log.Println("Setting up routes...")
	router := routes.SetupRouter(s3Storage, redisClient)

	// Start background worker
	log.Println("Starting background worker...")
	processor := worker.NewProcessor(redisClient, s3Storage, config.AppConfig)
	workerCtx, workerCancel := context.WithCancel(context.Background())

	go processor.Start(workerCtx)
	log.Println("Background worker started")

	// Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Start server in a goroutine
	port := ":" + config.AppConfig.Port
	log.Printf("Server starting on port %s", port)

	go func() {
		if err := router.Run(port); err != nil {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for shutdown signal
	<-sigChan
	log.Println("\n Shutting down gracefully...")

	// Cancel worker context
	workerCancel()

	// Close Redis connection
	if err := redisClient.Close(); err != nil {
		log.Println("Error closing Redis connection:", err)
	}

	log.Println(" Server stopped")
}
