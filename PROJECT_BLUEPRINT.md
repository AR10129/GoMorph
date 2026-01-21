# goMorph - Complete Project Blueprint

## 🎯 Project Overview
**Purpose**: Full-stack file conversion platform for portfolio/resume
**Target**: Showcase technical complexity and modern architecture
**Scale**: Personal/low-traffic deployment

---

## 📋 FEATURE SET

### Core Features (from Qoal)
✅ User authentication with JWT
✅ Multi-format file conversion (20+ formats, 5 categories)
✅ Real-time conversion status tracking
✅ Cloud storage integration (AWS S3)
✅ Background job processing (Redis queue)
✅ Responsive modern UI

### Additional Features (Your Enhancements)
🆕 **Conversion History Dashboard**
   - View past conversions with filters (date, format, status)
   - Statistics (total conversions, popular formats)
   - Re-download previous conversions
   - Delete history entries

🆕 **Watermarking System**
   - Text watermark on images
   - Position control (corners, center)
   - Opacity adjustment
   - Logo/image watermark upload
   - Video watermarking (overlay)

---

## 🏗️ BUILD FLOWCHART

### PHASE 1: SETUP & INFRASTRUCTURE (Week 1)

```
┌─────────────────────────────────────────────────┐
│  1.1 Project Initialization                     │
├─────────────────────────────────────────────────┤
│  □ Create GitHub repository                     │
│  □ Setup project directory structure            │
│  □ Initialize Go module (backend)               │
│  □ Initialize React + Vite (frontend)           │
│  □ Create .gitignore, README.md                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  1.2 Docker Environment Setup                   │
├─────────────────────────────────────────────────┤
│  □ Create docker-compose.yml                    │
│     - PostgreSQL container                      │
│     - Redis container                           │
│     - Backend container (development)           │
│  □ Create backend Dockerfile                    │
│  □ Setup environment variables (.env.example)   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  1.3 AWS S3 Configuration                       │
├─────────────────────────────────────────────────┤
│  □ Create AWS account (if not exists)           │
│  □ Create S3 bucket (e.g., gomorph-files)       │
│  □ Configure IAM user with S3 permissions       │
│  □ Generate access keys                         │
│  □ Setup CORS for frontend access               │
│  □ Configure lifecycle policies (auto-delete)   │
└─────────────────────────────────────────────────┘
```

---

### PHASE 2: BACKEND FOUNDATION (Week 2-3)

```
┌─────────────────────────────────────────────────┐
│  2.1 Database Layer                             │
├─────────────────────────────────────────────────┤
│  □ Setup GORM connection                        │
│  □ Create database models:                      │
│     - User (id, email, password, created_at)    │
│     - Job (id, user_id, status, input_format,   │
│            output_format, s3_key, etc.)         │
│     - History (id, user_id, job_id, metadata)   │
│     - WatermarkConfig (id, user_id, settings)   │
│  □ Create migrations                            │
│  □ Implement database connection pooling        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2.2 Authentication System                      │
├─────────────────────────────────────────────────┤
│  □ Implement user registration:                 │
│     - Email validation                          │
│     - Password hashing (bcrypt)                 │
│     - Create user record                        │
│  □ Implement login:                             │
│     - Credential verification                   │
│     - JWT token generation                      │
│     - Return user profile + token               │
│  □ Create JWT middleware                        │
│  □ Implement token refresh (optional)           │
│  □ Add password reset flow (optional)           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2.3 File Storage Integration                   │
├─────────────────────────────────────────────────┤
│  □ Create S3 client wrapper                     │
│  □ Implement upload function:                   │
│     - Generate unique S3 keys                   │
│     - Upload to bucket                          │
│     - Return S3 URL                             │
│  □ Implement download function:                 │
│     - Generate presigned URLs (secure)          │
│     - Set expiration time                       │
│  □ Implement delete function                    │
│  □ Add local storage fallback (development)     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2.4 API Routes & Handlers                      │
├─────────────────────────────────────────────────┤
│  □ Setup Gin router                             │
│  □ Create route groups:                         │
│     - /api/auth/* (public)                      │
│     - /api/upload (protected)                   │
│     - /api/jobs/* (protected)                   │
│     - /api/history/* (protected)                │
│     - /api/download/* (protected)               │
│  □ Implement handlers:                          │
│     - POST /auth/register                       │
│     - POST /auth/login                          │
│     - GET  /auth/profile                        │
│     - POST /upload (multipart form)             │
│     - GET  /jobs (list user jobs)               │
│     - GET  /jobs/:id (job status)               │
│     - GET  /download/:id (presigned URL)        │
│     - GET  /history (conversion history)        │
│     - DELETE /history/:id                       │
│  □ Add CORS middleware                          │
│  □ Add request logging middleware               │
│  □ Add rate limiting middleware                 │
└─────────────────────────────────────────────────┘
```

---

### PHASE 3: CONVERSION ENGINE (Week 3-4)

```
┌─────────────────────────────────────────────────┐
│  3.1 Redis Queue Setup                          │
├─────────────────────────────────────────────────┤
│  □ Install Asynq (Redis-based queue)            │
│  □ Create queue client                          │
│  □ Define task types:                           │
│     - ConvertImageTask                          │
│     - ConvertVideoTask                          │
│     - ConvertAudioTask                          │
│     - ConvertDocumentTask                       │
│     - ConvertArchiveTask                        │
│  □ Implement task serialization                 │
│  □ Setup retry logic                            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3.2 Worker Process                             │
├─────────────────────────────────────────────────┤
│  □ Create worker server (separate process)      │
│  □ Register task handlers                       │
│  □ Implement job lifecycle:                     │
│     1. Receive task from queue                  │
│     2. Update job status → "processing"         │
│     3. Download file from S3                    │
│     4. Execute conversion                       │
│     5. Upload converted file to S3              │
│     6. Update job status → "completed"          │
│     7. Save to history                          │
│  □ Add error handling & status updates          │
│  □ Implement cleanup (delete temp files)        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3.3 Format Converters                          │
├─────────────────────────────────────────────────┤
│  □ Install conversion tools:                    │
│     - ffmpeg (images, video, audio)             │
│     - ImageMagick (advanced image ops)          │
│     - pandoc (documents)                        │
│  □ Implement image converter:                   │
│     PNG ↔ JPG ↔ WEBP ↔ GIF ↔ BMP ↔ TIFF        │
│     ↔ SVG ↔ ICO ↔ HEIC                          │
│  □ Implement video converter:                   │
│     MP4 ↔ AVI ↔ MOV ↔ MKV ↔ WEBM ↔ FLV         │
│  □ Implement audio converter:                   │
│     MP3 ↔ WAV ↔ AAC ↔ FLAC ↔ OGG               │
│  □ Implement document converter:                │
│     PDF ↔ DOCX ↔ TXT ↔ HTML ↔ MD                │
│  □ Implement archive handler:                   │
│     ZIP ↔ TAR ↔ GZ ↔ 7Z                         │
│  □ Add file validation (size, format)           │
│  □ Add conversion quality settings              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3.4 Watermarking System (NEW)                  │
├─────────────────────────────────────────────────┤
│  □ Create watermark service                     │
│  □ Image watermarking:                          │
│     - Text overlay (ffmpeg/ImageMagick)         │
│     - Position: corners, center, custom         │
│     - Font, size, color, opacity                │
│     - Logo image overlay                        │
│  □ Video watermarking:                          │
│     - FFmpeg overlay filter                     │
│     - Persistent watermark throughout           │
│  □ Watermark configuration storage              │
│  □ Apply watermark before upload to S3          │
└─────────────────────────────────────────────────┘
```

---

### PHASE 4: FRONTEND DEVELOPMENT (Week 4-6)

```
┌─────────────────────────────────────────────────┐
│  4.1 Project Setup                              │
├─────────────────────────────────────────────────┤
│  □ Create Vite + React + TypeScript project     │
│  □ Install dependencies:                        │
│     - react-router-dom                          │
│     - axios                                     │
│     - @tanstack/react-query                     │
│     - react-hook-form + zod                     │
│     - tailwindcss                               │
│     - framer-motion                             │
│     - lucide-react (icons)                      │
│  □ Configure TailwindCSS                        │
│  □ Setup TypeScript strict mode                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4.2 Authentication Flow                        │
├─────────────────────────────────────────────────┤
│  □ Create AuthContext (JWT storage)             │
│  □ Build LoginForm component:                   │
│     - Email/password inputs                     │
│     - Form validation                           │
│     - API call to /auth/login                   │
│     - Store JWT in localStorage                 │
│  □ Build RegisterForm component                 │
│  □ Create ProtectedRoute wrapper                │
│  □ Implement auto-logout on token expiry        │
│  □ Add loading states & error handling          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4.3 File Upload Interface                      │
├─────────────────────────────────────────────────┤
│  □ Build FileUploader component:                │
│     - Drag & drop zone                          │
│     - File type validation                      │
│     - Size limit check (30MB)                   │
│     - Preview selected file                     │
│  □ Build FormatSelector:                        │
│     - Dropdown/grid of output formats           │
│     - Filter by category (image/video/etc)      │
│  □ Build WatermarkOptions (NEW):                │
│     - Toggle watermark on/off                   │
│     - Text input                                │
│     - Position selector                         │
│     - Opacity slider                            │
│     - Logo upload                               │
│  □ Submit conversion job to backend             │
│  □ Show upload progress                         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4.4 Job Status Tracking                        │
├─────────────────────────────────────────────────┤
│  □ Build JobStatus component:                   │
│     - Poll /jobs/:id every 2 seconds            │
│     - Display status (queued/processing/done)   │
│     - Show progress bar                         │
│  □ Build JobList component:                     │
│     - Display all user jobs                     │
│     - Filter by status                          │
│  □ Add real-time updates (polling/websockets)   │
│  □ Show download button when complete           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4.5 History Dashboard (NEW)                    │
├─────────────────────────────────────────────────┤
│  □ Create History page (/history)               │
│  □ Build HistoryTable component:                │
│     - Columns: date, input→output, size, status │
│     - Sortable columns                          │
│     - Action buttons (download, delete)         │
│  □ Build HistoryFilters:                        │
│     - Date range picker                         │
│     - Format filter (dropdown)                  │
│     - Status filter                             │
│  □ Build HistoryStats:                          │
│     - Total conversions count                   │
│     - Most used format (chart)                  │
│     - Total data processed                      │
│  □ Implement pagination (10-20 items/page)      │
│  □ Add export history (CSV/JSON)                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4.6 UI/UX Polish                               │
├─────────────────────────────────────────────────┤
│  □ Create responsive layout (mobile-first)      │
│  □ Add loading skeletons                        │
│  □ Implement toast notifications (success/error)│
│  □ Add animations (page transitions)            │
│  □ Create dark mode toggle                      │
│  □ Add error boundaries                         │
│  □ Optimize images & assets                     │
└─────────────────────────────────────────────────┘
```

---

### PHASE 5: TESTING & OPTIMIZATION (Week 6-7)

```
┌─────────────────────────────────────────────────┐
│  5.1 Backend Testing                            │
├─────────────────────────────────────────────────┤
│  □ Write unit tests (Go testing package):       │
│     - Auth service tests                        │
│     - Conversion logic tests                    │
│     - S3 integration tests (mocked)             │
│  □ Write integration tests:                     │
│     - API endpoint tests                        │
│     - Database operations                       │
│  □ Test error scenarios                         │
│  □ Load testing (optional)                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  5.2 Frontend Testing                           │
├─────────────────────────────────────────────────┤
│  □ Write component tests (Vitest + RTL):        │
│     - Form validation tests                     │
│     - Upload flow tests                         │
│  □ Add E2E tests (Playwright - optional):       │
│     - Login → Upload → Convert → Download       │
│  □ Test responsive design (mobile/tablet)       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  5.3 Performance Optimization                   │
├─────────────────────────────────────────────────┤
│  □ Backend:                                     │
│     - Add database indexes                      │
│     - Implement query optimization              │
│     - Add Redis caching (job status)            │
│     - Optimize S3 uploads (multipart)           │
│  □ Frontend:                                    │
│     - Code splitting (lazy loading)             │
│     - Image optimization                        │
│     - Bundle size analysis                      │
│     - Add service worker (PWA - optional)       │
└─────────────────────────────────────────────────┘
```

---

### PHASE 6: DEPLOYMENT (Week 7-8)

```
┌─────────────────────────────────────────────────┐
│  6.1 Backend Deployment (Render)                │
├─────────────────────────────────────────────────┤
│  □ Create Render account                        │
│  □ Setup PostgreSQL database on Render          │
│  □ Setup Redis instance on Render               │
│  □ Create Web Service for API:                  │
│     - Connect GitHub repo                       │
│     - Use Dockerfile                            │
│     - Set environment variables                 │
│  □ Create Background Worker service:            │
│     - Same Docker image                         │
│     - Different start command (worker mode)     │
│  □ Run database migrations                      │
│  □ Test API endpoints                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  6.2 Frontend Deployment (Vercel/Netlify)       │
├─────────────────────────────────────────────────┤
│  □ Build production bundle (npm run build)      │
│  □ Deploy to Vercel:                            │
│     - Connect GitHub repo                       │
│     - Auto-deploy on push                       │
│     - Set VITE_API_URL env variable             │
│  □ Configure custom domain (optional)           │
│  □ Setup HTTPS/SSL                              │
│  □ Test production build                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  6.3 Monitoring & Logging                       │
├─────────────────────────────────────────────────┤
│  □ Setup structured logging (backend)           │
│  □ Add error tracking (Sentry - optional)       │
│  □ Monitor AWS costs (CloudWatch)               │
│  □ Setup uptime monitoring (UptimeRobot)        │
│  □ Create health check endpoint (/health)       │
└─────────────────────────────────────────────────┘
```

---

### PHASE 7: DOCUMENTATION & PORTFOLIO PREP (Week 8)

```
┌─────────────────────────────────────────────────┐
│  7.1 Technical Documentation                    │
├─────────────────────────────────────────────────┤
│  □ Write comprehensive README.md:               │
│     - Project overview                          │
│     - Tech stack breakdown                      │
│     - Architecture diagram                      │
│     - Setup instructions                        │
│     - API documentation                         │
│  □ Add code comments                            │
│  □ Create API documentation (Swagger - optional)│
│  □ Document deployment process                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  7.2 Portfolio Presentation                     │
├─────────────────────────────────────────────────┤
│  □ Create demo video/GIF                        │
│  □ Take high-quality screenshots                │
│  □ Write case study (blog post):                │
│     - Problem statement                         │
│     - Technical challenges solved               │
│     - Architecture decisions                    │
│     - Performance metrics                       │
│  □ Highlight key technical achievements:        │
│     - "Built scalable microservices with Go"    │
│     - "Implemented async job processing"        │
│     - "Integrated AWS S3 for cloud storage"     │
│     - "Real-time UI updates with React Query"   │
│  □ Add to resume & LinkedIn                     │
│  □ Share on GitHub (pin repository)             │
└─────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW DIAGRAM

### User Conversion Flow

```
[User Browser]
     │
     │ 1. Login (POST /auth/login)
     ↓
[Frontend React App]
     │
     │ 2. Upload file + select format + watermark options
     │    (POST /upload with multipart/form-data)
     ↓
[Backend API Server]
     │
     ├─→ 3a. Validate file (type, size)
     ├─→ 3b. Upload original to S3
     ├─→ 3c. Create Job record in PostgreSQL
     └─→ 3d. Enqueue conversion task in Redis
     │
     ↓
[Redis Queue (Asynq)]
     │
     ↓
[Background Worker Process]
     │
     ├─→ 4a. Fetch job from queue
     ├─→ 4b. Update job status → "processing"
     ├─→ 4c. Download file from S3 to temp
     ├─→ 4d. Execute conversion (ffmpeg/ImageMagick)
     ├─→ 4e. Apply watermark (if enabled)
     ├─→ 4f. Upload converted file to S3
     ├─→ 4g. Update job status → "completed"
     ├─→ 4h. Create History record
     └─→ 4i. Clean up temp files
     │
     ↓
[Frontend - Polling]
     │
     │ 5. Poll job status (GET /jobs/:id every 2s)
     │
     ↓
[User sees "Completed" + Download button]
     │
     │ 6. Click download (GET /download/:id)
     ↓
[Backend generates S3 presigned URL]
     │
     ↓
[User downloads file from S3]
```

---

## 📊 DATABASE SCHEMA

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- queued, processing, completed, failed
    input_format VARCHAR(10) NOT NULL,
    output_format VARCHAR(10) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    original_s3_key VARCHAR(500),
    converted_s3_key VARCHAR(500),
    file_size_bytes BIGINT,
    error_message TEXT,
    watermark_enabled BOOLEAN DEFAULT FALSE,
    watermark_config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
```

### History Table (NEW)
```sql
CREATE TABLE conversion_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    input_format VARCHAR(10),
    output_format VARCHAR(10),
    file_size_bytes BIGINT,
    conversion_time_seconds INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_user_id ON conversion_history(user_id);
CREATE INDEX idx_history_created_at ON conversion_history(created_at);
```

### Watermark Presets Table (Optional)
```sql
CREATE TABLE watermark_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    config JSONB, -- {text, position, opacity, color, logo_s3_key}
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 KEY TECHNICAL HIGHLIGHTS FOR RESUME

### Backend Skills Demonstrated
- ✅ **Microservices Architecture**: Separated API server and background worker
- ✅ **Async Job Processing**: Redis-based queue with Asynq
- ✅ **Cloud Integration**: AWS S3 SDK for scalable file storage
- ✅ **Database Design**: PostgreSQL with GORM, proper indexing
- ✅ **RESTful API Design**: Clean endpoint structure with JWT auth
- ✅ **Concurrency**: Go goroutines for parallel processing
- ✅ **Error Handling**: Graceful error recovery and retry mechanisms

### Frontend Skills Demonstrated
- ✅ **Modern React Patterns**: Hooks, Context API, custom hooks
- ✅ **TypeScript**: Strong typing for maintainability
- ✅ **State Management**: React Query for server state
- ✅ **Form Handling**: React Hook Form + Zod validation
- ✅ **Responsive Design**: Mobile-first with TailwindCSS
- ✅ **Real-time Updates**: Polling/WebSocket integration
- ✅ **Performance**: Code splitting, lazy loading

### DevOps Skills Demonstrated
- ✅ **Containerization**: Docker + Docker Compose
- ✅ **Cloud Deployment**: Render, Vercel/Netlify
- ✅ **CI/CD**: GitHub Actions automation
- ✅ **Database Migration**: Schema versioning
- ✅ **Monitoring**: Logging, error tracking, uptime monitoring

---

## 💰 COST BREAKDOWN (INR/Month)

### Year 1 (Free Tier)
| Service | Cost |
|---------|------|
| AWS S3 (5GB) | ₹0 |
| Render PostgreSQL | ₹0 (free tier) |
| Render Redis | ₹0 (free tier) |
| Render Web Service | ₹0 (free tier, 750hrs) |
| Vercel Frontend | ₹0 |
| **Total** | **₹0** |

### After Year 1 (Estimated)
| Service | Cost |
|---------|------|
| AWS S3 (10GB + requests) | ₹30-50 |
| Render PostgreSQL | ₹0 (if low usage) |
| Render Redis | ₹0 (if low usage) |
| Render Web Service | ₹0-500 (pay-as-you-go) |
| Vercel Frontend | ₹0 |
| **Total** | **₹30-550/month** |

**💡 Cost Optimization Tips:**
- Use AWS Free Tier aggressively (12 months)
- Implement S3 lifecycle policies (auto-delete after 30 days)
- Use Render free tier for low traffic
- Consider self-hosted MinIO instead of S3 (₹0 cost)

---

## 📝 NEXT STEPS

1. **Ask any clarifying questions** about the architecture
2. **Review the flowchart** and suggest modifications
3. **Approve the tech stack** or propose alternatives
4. **Start with Phase 1** when ready

Would you like me to:
- Create the initial project structure?
- Generate starter code for any component?
- Explain any technical decision in detail?
- Modify any part of the plan?
