# GoMorph

A full-stack file conversion platform built with Go and React. Upload files in one format, convert them to another, and download the result. Supports images, videos, audio, documents, and archives.

## Tech Stack

**Backend:** Go, Gin, GORM, PostgreSQL, Redis, AWS S3  
**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui  
**Infrastructure:** Docker Compose, FFmpeg, Pandoc

## Features

- User authentication (register, login, JWT-based sessions)
- Drag-and-drop file upload with format validation
- Asynchronous conversion via Redis job queue and background workers
- File storage on AWS S3 with presigned download URLs
- Conversion history with stats and filtering
- Supports 25 formats across 5 categories:
  - **Image:** png, jpg, webp, gif, svg
  - **Video:** mp4, avi, mov, mkv, webm
  - **Audio:** mp3, wav, flac, aac, ogg
  - **Document:** pdf, docx, txt, rtf, odt
  - **Archive:** zip, rar, 7z, tar, gzip

## Screenshots

**Landing Page**

![Landing Page](docs/screenshots/landing-page.png)

![Landing Page - Scrolled](docs/screenshots/landing-page-scroll.png)

**Conversion Workspace**

![Conversion Workspace](docs/screenshots/conversion-workspace.png)

**Conversion History**

![Conversion History](docs/screenshots/conversion-history.png)

**Signup**

![Signup](docs/screenshots/signup-window.png)

## Project Structure

```
goMorph/
├── backend/
│   ├── cmd/server/          # Entry point
│   ├── internal/
│   │   ├── config/          # Environment config loader
│   │   ├── database/        # PostgreSQL connection and migrations
│   │   ├── handlers/        # HTTP handlers (auth, upload, download, history)
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── models/          # GORM models (User, Job, ConversionHistory)
│   │   ├── routes/          # Gin router setup
│   │   ├── services/        # Business logic (auth, jobs, conversion)
│   │   ├── storage/         # AWS S3 operations
│   │   └── worker/          # Background job processor
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (dashboard, auth, layout)
│   │   ├── contexts/        # Auth context provider
│   │   ├── lib/             # API client and utilities
│   │   └── pages/           # Route pages
│   └── package.json
└── docker-compose.yml       # PostgreSQL and Redis services
```

## Prerequisites

- Go 1.21+
- Node.js 18+
- Docker and Docker Compose
- FFmpeg (for image/video/audio conversion)
- Pandoc (for document conversion)
- AWS account with S3 bucket configured

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/AR10129/GoMorph.git
cd GoMorph
```

### 2. Start infrastructure services

```bash
docker compose up -d
```

This starts PostgreSQL and Redis containers.

### 3. Configure environment variables

Create `backend/.env`:

```
PORT=8000
DATABASE_URL=postgresql://gomorph_user:gomorph_password@localhost:5432/gomorph_db?sslmode=disable
REDIS_URL=localhost:6379
JWT_SECRET=<your-secret-key>
AWS_REGION=<your-region>
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_S3_BUCKET=<your-bucket-name>
MAX_FILE_SIZE_MB=30
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Run the backend

```bash
cd backend
go run ./cmd/server/main.go
```

The server starts on `http://localhost:8000`.

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev -- --port 8080
```

The app opens at `http://localhost:8080`.

## API Endpoints

| Method | Endpoint             | Description                  | Auth |
|--------|----------------------|------------------------------|------|
| POST   | /api/auth/register   | Register a new user          | No   |
| POST   | /api/auth/login      | Login and receive JWT        | No   |
| GET    | /api/auth/profile    | Get current user profile     | Yes  |
| POST   | /api/upload          | Upload file for conversion   | Yes  |
| GET    | /api/jobs            | List user's conversion jobs  | Yes  |
| GET    | /api/jobs/:id        | Get specific job status      | Yes  |
| GET    | /api/download/:id    | Get presigned download URL   | Yes  |
| GET    | /api/history         | Get conversion history       | Yes  |
| GET    | /api/history/stats   | Get conversion statistics    | Yes  |
| DELETE | /api/history/:id     | Delete a history entry       | Yes  |
| GET    | /health              | Health check                 | No   |

## License

MIT
