# goMorph - Quick Start Guide

## 🎯 What We're Building

A **production-ready file conversion platform** that demonstrates:
- Modern full-stack architecture (Go + React + TypeScript)
- Cloud-native design (AWS S3, PostgreSQL, Redis)
- Async job processing (background workers)
- Real-time UI updates
- Advanced features (watermarking, conversion history)

**Perfect for your resume because it shows:**
- Backend: Microservices, REST APIs, database design, queue systems
- Frontend: React hooks, TypeScript, modern UI/UX
- DevOps: Docker, CI/CD, cloud deployment
- System Design: Scalable architecture, security best practices

---

## 📋 Prerequisites Checklist

Before we start coding, let's verify you have:

### Local Development Tools
- [ ] **Go 1.24+** installed ([download](https://go.dev/dl/))
  - Verify: `go version`
- [ ] **Node.js 18+** installed ([download](https://nodejs.org/))
  - Verify: `node --version`
- [ ] **Docker Desktop** installed ([download](https://www.docker.com/products/docker-desktop))
  - Verify: `docker --version`
- [ ] **Git** installed
  - Verify: `git --version`
- [ ] **VS Code** or your preferred editor

### Conversion Tools (Install Later During Development)
- [ ] **ffmpeg** - for video/audio/image conversion
- [ ] **ImageMagick** - for watermarking
- [ ] **pandoc** - for document conversion (optional)

### Cloud Accounts (All Free Tier)
- [ ] **AWS Account** - for S3 storage ([signup](https://aws.amazon.com/free/))
- [ ] **Render Account** - for backend hosting ([signup](https://render.com/))
- [ ] **Vercel Account** - for frontend hosting ([signup](https://vercel.com/))

---

## 🚀 PHASE 1: Project Initialization (Day 1)

### Step 1: Create GitHub Repository

```powershell
# 1. Create a new repository on GitHub (github.com/new)
#    Name: goMorph
#    Description: Full-stack file conversion platform with Go + React
#    Visibility: Public (for portfolio)
#    ✓ Add README
#    ✓ Add .gitignore (Go template)

# 2. Clone to your workspace (already done)
cd C:\Users\mikasa\Desktop\goMorph_final

# 3. Initialize Git (if not done)
git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/goMorph.git
```

### Step 2: Create Project Structure

```powershell
# Create backend structure
mkdir -p backend/cmd/server
mkdir -p backend/internal/api/handlers
mkdir -p backend/internal/api/middleware
mkdir -p backend/internal/api/routes
mkdir -p backend/internal/models
mkdir -p backend/internal/services
mkdir -p backend/internal/storage
mkdir -p backend/internal/worker
mkdir -p backend/internal/worker/converters
mkdir -p backend/internal/database
mkdir -p backend/internal/database/migrations
mkdir -p backend/internal/config
mkdir -p backend/pkg/utils
mkdir -p backend/pkg/logger

# Create frontend structure
mkdir -p frontend/src/components/common
mkdir -p frontend/src/components/auth
mkdir -p frontend/src/components/upload
mkdir -p frontend/src/components/conversion
mkdir -p frontend/src/components/history
mkdir -p frontend/src/components/download
mkdir -p frontend/src/pages
mkdir -p frontend/src/services
mkdir -p frontend/src/hooks
mkdir -p frontend/src/context
mkdir -p frontend/src/types
mkdir -p frontend/src/utils
mkdir -p frontend/public
```

### Step 3: Initialize Backend (Go)

```powershell
cd backend

# Initialize Go module
go mod init github.com/YOUR_USERNAME/goMorph/backend

# Install core dependencies
go get -u github.com/gin-gonic/gin                    # HTTP framework
go get -u gorm.io/gorm                                # ORM
go get -u gorm.io/driver/postgres                     # PostgreSQL driver
go get -u github.com/golang-jwt/jwt/v5                # JWT authentication
go get -u github.com/hibiken/asynq                    # Redis job queue
go get -u github.com/aws/aws-sdk-go-v2                # AWS SDK
go get -u github.com/aws/aws-sdk-go-v2/service/s3
go get -u github.com/joho/godotenv                    # Environment variables
go get -u golang.org/x/crypto/bcrypt                  # Password hashing
go get -u github.com/rs/cors                          # CORS middleware
```

### Step 4: Initialize Frontend (React + TypeScript)

```powershell
cd ../frontend

# Create Vite project with React + TypeScript
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom                          # Routing
npm install axios                                     # HTTP client
npm install @tanstack/react-query                     # Server state
npm install react-hook-form                           # Form handling
npm install zod                                       # Schema validation
npm install @hookform/resolvers                       # Form + Zod integration
npm install lucide-react                              # Icons
npm install framer-motion                             # Animations
npm install react-hot-toast                           # Notifications

# Install TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 5: Setup Docker Compose (Local Development)

Create `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: gomorph_postgres
    environment:
      POSTGRES_USER: gomorph_user
      POSTGRES_PASSWORD: gomorph_password
      POSTGRES_DB: gomorph_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gomorph_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: gomorph_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

**Start the services:**

```powershell
# Start PostgreSQL and Redis
docker-compose up -d

# Verify they're running
docker-compose ps
```

### Step 6: Create Environment Files

**Backend `.env.example`:**

```env
# Server
PORT=8000
GIN_MODE=debug

# Database
DATABASE_URL=postgresql://gomorph_user:gomorph_password@localhost:5432/gomorph_db?sslmode=disable

# Redis
REDIS_URL=localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=gomorph-files

# File Upload
MAX_FILE_SIZE_MB=30

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend `.env.example`:**

```env
VITE_API_URL=http://localhost:8000/api
```

**Copy to actual .env files:**

```powershell
# Backend
cd backend
copy .env.example .env

# Frontend
cd ../frontend
copy .env.example .env
```

---

## 🏗️ PHASE 2: Backend Development (Days 2-7)

### Day 2: Database Models & Migrations

**File: `backend/internal/models/user.go`**

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    Email     string    `gorm:"uniqueIndex;not null" json:"email"`
    Password  string    `gorm:"not null" json:"-"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
    // Auto-generate UUID if not set
    return nil
}
```

**File: `backend/internal/models/job.go`**

```go
package models

import "time"

type JobStatus string

const (
    JobQueued     JobStatus = "queued"
    JobProcessing JobStatus = "processing"
    JobCompleted  JobStatus = "completed"
    JobFailed     JobStatus = "failed"
)

type Job struct {
    ID                string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    UserID            string         `gorm:"type:uuid;not null" json:"user_id"`
    Status            JobStatus      `gorm:"type:varchar(50);not null" json:"status"`
    InputFormat       string         `gorm:"type:varchar(10);not null" json:"input_format"`
    OutputFormat      string         `gorm:"type:varchar(10);not null" json:"output_format"`
    OriginalFilename  string         `gorm:"type:varchar(255);not null" json:"original_filename"`
    OriginalS3Key     string         `gorm:"type:varchar(500)" json:"original_s3_key"`
    ConvertedS3Key    string         `gorm:"type:varchar(500)" json:"converted_s3_key"`
    FileSizeBytes     int64          `json:"file_size_bytes"`
    ErrorMessage      string         `gorm:"type:text" json:"error_message,omitempty"`
    WatermarkEnabled  bool           `gorm:"default:false" json:"watermark_enabled"`
    WatermarkConfig   string         `gorm:"type:jsonb" json:"watermark_config,omitempty"`
    CreatedAt         time.Time      `json:"created_at"`
    UpdatedAt         time.Time      `json:"updated_at"`
    CompletedAt       *time.Time     `json:"completed_at,omitempty"`
    
    // Relations
    User User `gorm:"foreignKey:UserID" json:"-"`
}
```

**File: `backend/internal/models/history.go`**

```go
package models

import "time"

type ConversionHistory struct {
    ID                    string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    UserID                string    `gorm:"type:uuid;not null" json:"user_id"`
    JobID                 string    `gorm:"type:uuid;not null" json:"job_id"`
    InputFormat           string    `gorm:"type:varchar(10)" json:"input_format"`
    OutputFormat          string    `gorm:"type:varchar(10)" json:"output_format"`
    FileSizeBytes         int64     `json:"file_size_bytes"`
    ConversionTimeSeconds float64   `json:"conversion_time_seconds"`
    CreatedAt             time.Time `json:"created_at"`
    
    // Relations
    User User `gorm:"foreignKey:UserID" json:"-"`
    Job  Job  `gorm:"foreignKey:JobID" json:"-"`
}
```

### Day 3: Authentication System

**File: `backend/internal/services/auth_service.go`**

```go
package services

import (
    "errors"
    "time"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
    "github.com/YOUR_USERNAME/goMorph/backend/internal/models"
)

type AuthService struct {
    db        *gorm.DB
    jwtSecret string
}

func NewAuthService(db *gorm.DB, jwtSecret string) *AuthService {
    return &AuthService{db: db, jwtSecret: jwtSecret}
}

func (s *AuthService) Register(email, password string) (*models.User, error) {
    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return nil, err
    }

    user := &models.User{
        Email:    email,
        Password: string(hashedPassword),
    }

    if err := s.db.Create(user).Error; err != nil {
        return nil, err
    }

    return user, nil
}

func (s *AuthService) Login(email, password string) (string, *models.User, error) {
    var user models.User
    if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
        return "", nil, errors.New("invalid credentials")
    }

    // Verify password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
        return "", nil, errors.New("invalid credentials")
    }

    // Generate JWT
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "email":   user.Email,
        "exp":     time.Now().Add(24 * time.Hour).Unix(),
    })

    tokenString, err := token.SignedString([]byte(s.jwtSecret))
    if err != nil {
        return "", nil, err
    }

    return tokenString, &user, nil
}
```

---

## 📝 YOUR ACTION ITEMS

Before we proceed with actual coding, I need you to:

### ✅ Checklist 1: Verify Prerequisites

Run these commands and confirm:

```powershell
# Check Go
go version  # Should show 1.24 or higher

# Check Node.js
node --version  # Should show v18 or higher

# Check Docker
docker --version  # Should work

# Check Docker Compose
docker-compose --version  # Should work
```

### ✅ Checklist 2: AWS S3 Setup

1. **Create AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com/free/
   - Sign up (requires credit card but won't charge for free tier)

2. **Create S3 Bucket**
   - Login to AWS Console
   - Search for "S3"
   - Click "Create bucket"
   - Bucket name: `gomorph-files-YOUR_NAME` (must be globally unique)
   - Region: `us-east-1` (or closest to you)
   - Block all public access: **UNCHECK** (we'll use presigned URLs)
   - Click "Create bucket"

3. **Create IAM User for API Access**
   - Search for "IAM" in AWS Console
   - Users → Add users
   - Username: `gomorph-api`
   - Access type: **Programmatic access**
   - Permissions: Attach existing policy → **AmazonS3FullAccess**
   - Copy **Access Key ID** and **Secret Access Key** (save securely!)

4. **Configure CORS on S3 Bucket**
   - Go to your bucket → Permissions tab → CORS
   - Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:5173", "http://localhost:8000"],
        "ExposeHeaders": []
    }
]
```

5. **Update backend/.env**
   - Add your AWS credentials:

```env
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
AWS_S3_BUCKET=gomorph-files-YOUR_NAME
```

---

## 🎯 Next Steps

**Once you confirm:**
1. ✅ All prerequisites installed
2. ✅ AWS S3 bucket created
3. ✅ Environment files configured
4. ✅ Docker services running (`docker-compose up -d`)

**I will help you:**
1. 🔨 Create the complete backend codebase
2. 🎨 Create the complete frontend codebase
3. 🧪 Set up testing
4. 🚀 Deploy to production

---

## 📚 Learning Resources

While building, you'll learn:
- **Go**: Gin framework, GORM, goroutines, channels
- **React**: Hooks, Context API, React Query, TypeScript
- **PostgreSQL**: Schema design, indexing, migrations
- **Redis**: Job queues, caching
- **AWS**: S3 storage, presigned URLs
- **Docker**: Containerization, docker-compose
- **Architecture**: Microservices, async processing, REST APIs

---

## ❓ Questions?

Before we start coding, let me know:
1. Have you completed the AWS S3 setup?
2. Are Docker services running successfully?
3. Do you want me to start generating the actual code files?
4. Any specific features you want to prioritize first?
5. Do you have ffmpeg installed? (We'll need it for conversions)

**Ready to start building?** 🚀
