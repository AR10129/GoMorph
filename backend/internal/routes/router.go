package routes

import (
	"time"

	"github.com/AR10129/GoMorph/backend/internal/handlers"
	"github.com/AR10129/GoMorph/backend/internal/middleware"
	"github.com/AR10129/GoMorph/backend/internal/services"
	"github.com/AR10129/GoMorph/backend/internal/storage"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func SetupRouter(s3Storage *storage.S3Storage, redisClient *redis.Client) *gin.Engine {
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080", "http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Rate limiting middleware (100 requests per minute, burst of 20)
	rateLimiter := middleware.NewRateLimiter(600*time.Millisecond, 20)
	router.Use(rateLimiter.Middleware())

	// Initialize services
	jobService := services.NewJobService(redisClient)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler()
	uploadHandler := handlers.NewUploadHandler(s3Storage, jobService)
	downloadHandler := handlers.NewDownloadHandler(s3Storage)
	historyHandler := handlers.NewHistoryHandler()

	// API routes
	api := router.Group("/api")
	{
		// Public routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Auth
			protected.GET("/auth/profile", authHandler.GetProfile)

			// File operations
			protected.POST("/upload", uploadHandler.Upload)
			protected.GET("/jobs", uploadHandler.GetJobs)
			protected.GET("/jobs/:id", uploadHandler.GetJobByID)
			protected.GET("/download/:id", downloadHandler.Download)

			// History
			protected.GET("/history", historyHandler.GetHistory)
			protected.GET("/history/stats", historyHandler.GetHistoryStats)
			protected.DELETE("/history/:id", historyHandler.DeleteHistory)
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"service": "GoMorph backend", "status": "ok"})
	})

	return router
}
