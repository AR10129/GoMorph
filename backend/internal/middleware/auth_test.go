package middleware

import (
	"testing"

	"github.com/AR10129/GoMorph/backend/internal/config"
	"github.com/AR10129/GoMorph/backend/internal/services"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"time"
)

func TestJWTTokenGeneration(t *testing.T) {
	// Initialize config
	config.AppConfig = &config.Config{
		JWTSecret: "test-secret-key-for-testing",
	}

	authService := services.NewAuthService()
	
	// Create a test token
	userID := uuid.New()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID.String(),
		"email":   "test@example.com",
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString([]byte(config.AppConfig.JWTSecret))
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Validate the token
	validatedUserID, err := authService.ValidateToken(tokenString)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if validatedUserID != userID {
		t.Errorf("Expected user ID %s, got %s", userID, validatedUserID)
	}
}

func TestJWTTokenExpiration(t *testing.T) {
	// Initialize config
	config.AppConfig = &config.Config{
		JWTSecret: "test-secret-key-for-testing",
	}

	authService := services.NewAuthService()
	
	// Create an expired token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": uuid.New().String(),
		"email":   "test@example.com",
		"exp":     time.Now().Add(-1 * time.Hour).Unix(), // Expired 1 hour ago
	})

	tokenString, _ := token.SignedString([]byte(config.AppConfig.JWTSecret))

	// Try to validate expired token
	_, err := authService.ValidateToken(tokenString)
	if err == nil {
		t.Error("Expected validation to fail for expired token, but it succeeded")
	}
}

func TestJWTTokenInvalidSignature(t *testing.T) {
	// Initialize config
	config.AppConfig = &config.Config{
		JWTSecret: "test-secret-key-for-testing",
	}

	authService := services.NewAuthService()
	
	// Create a token with different secret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": uuid.New().String(),
		"email":   "test@example.com",
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, _ := token.SignedString([]byte("different-secret"))

	// Try to validate token with wrong signature
	_, err := authService.ValidateToken(tokenString)
	if err == nil {
		t.Error("Expected validation to fail for invalid signature, but it succeeded")
	}
}
