# goMorph - System Architecture & Flowcharts

## 🏛️ HIGH-LEVEL ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         React Frontend (Vercel/Netlify)                  │    │
│  │  - User Interface                                        │    │
│  │  - File Upload UI                                        │    │
│  │  - Conversion Dashboard                                  │    │
│  │  - History View                                          │    │
│  └───────────────────┬──────────────────────────────────────┘    │
│                      │ HTTPS/REST API                            │
└──────────────────────┼───────────────────────────────────────────┘
                       │
┌──────────────────────┼───────────────────────────────────────────┐
│                      │        API LAYER                           │
├──────────────────────┼───────────────────────────────────────────┤
│                      ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      Go Backend API Server (Render)                       │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Gin HTTP Router                                    │  │   │
│  │  │  - Auth Routes (/api/auth/*)                        │  │   │
│  │  │  - Upload Routes (/api/upload)                      │  │   │
│  │  │  - Job Routes (/api/jobs/*)                         │  │   │
│  │  │  - History Routes (/api/history/*)                  │  │   │
│  │  │  - Download Routes (/api/download/*)                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Middleware Layer                                   │  │   │
│  │  │  - JWT Authentication                               │  │   │
│  │  │  - CORS Handler                                     │  │   │
│  │  │  - Rate Limiter                                     │  │   │
│  │  │  - Request Logger                                   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────┬──────────────────┬──────────────────┬─────────┘   │
│             │                  │                  │              │
└─────────────┼──────────────────┼──────────────────┼──────────────┘
              │                  │                  │
              │                  │                  │
┌─────────────┼──────────────────┼──────────────────┼──────────────┐
│             │   SERVICE LAYER  │                  │              │
├─────────────┼──────────────────┼──────────────────┼──────────────┤
│             ↓                  ↓                  ↓              │
│  ┌─────────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Auth Service    │ │ File Service │ │ Conversion Service   │ │
│  │ - Register      │ │ - Upload     │ │ - Create Job         │ │
│  │ - Login         │ │ - Download   │ │ - Update Status      │ │
│  │ - JWT Gen       │ │ - Delete     │ │ - Queue Task         │ │
│  └─────────────────┘ └──────────────┘ └──────────────────────┘ │
│                                                                  │
│  ┌─────────────────┐ ┌──────────────────────────────────────┐  │
│  │ History Service │ │ Watermark Service (NEW)              │  │
│  │ - Log Convert   │ │ - Apply Text Watermark               │  │
│  │ - Get History   │ │ - Apply Logo Watermark               │  │
│  │ - Statistics    │ │ - Position Control                   │  │
│  └─────────────────┘ └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
              │                  │                  │
              │                  │                  │
┌─────────────┼──────────────────┼──────────────────┼──────────────┐
│             │   DATA LAYER     │                  │              │
├─────────────┼──────────────────┼──────────────────┼──────────────┤
│             ↓                  ↓                  ↓              │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   PostgreSQL       │  │   Redis      │  │   AWS S3        │ │
│  │   (Render)         │  │   (Render)   │  │                 │ │
│  │  - Users           │  │  - Job Queue │  │  - Original     │ │
│  │  - Jobs            │  │  - Cache     │  │    Files        │ │
│  │  - History         │  │  - Locks     │  │  - Converted    │ │
│  │  - Watermarks      │  └──────────────┘  │    Files        │ │
│  └────────────────────┘                    └─────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
              │
              │
┌─────────────┼────────────────────────────────────────────────────┐
│             │   WORKER LAYER                                      │
├─────────────┼────────────────────────────────────────────────────┤
│             ↓                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      Background Worker Process (Render)                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Asynq Worker Server                                │  │   │
│  │  │  - Consume tasks from Redis queue                   │  │   │
│  │  │  - Process conversions asynchronously               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Conversion Handlers                                │  │   │
│  │  │  - ImageConverter (ffmpeg, ImageMagick)             │  │   │
│  │  │  - VideoConverter (ffmpeg)                          │  │   │
│  │  │  - AudioConverter (ffmpeg)                          │  │   │
│  │  │  - DocumentConverter (pandoc)                       │  │   │
│  │  │  - ArchiveHandler (7zip)                            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DETAILED CONVERSION FLOW

### Complete User Journey: Upload → Convert → Download

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER AUTHENTICATION                                         │
└─────────────────────────────────────────────────────────────────────┘

[User] 
  │
  ├─→ Visits homepage
  ├─→ Clicks "Login"
  ├─→ Enters email + password
  │
  ↓
[Frontend - LoginForm.tsx]
  │
  ├─→ Validates form (Zod schema)
  ├─→ POST /api/auth/login { email, password }
  │
  ↓
[Backend - auth_handler.go]
  │
  ├─→ Find user by email in PostgreSQL
  ├─→ Compare bcrypt hashed password
  ├─→ Generate JWT token (24h expiry)
  ├─→ Return { token, user_profile }
  │
  ↓
[Frontend]
  │
  ├─→ Store JWT in localStorage
  ├─→ Set Authorization header for future requests
  ├─→ Redirect to /dashboard
  │
  ✓ User authenticated


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: FILE UPLOAD & JOB CREATION                                  │
└─────────────────────────────────────────────────────────────────────┘

[User on Dashboard]
  │
  ├─→ Drags file into upload zone (e.g., photo.jpg)
  ├─→ Selects output format (e.g., PNG)
  ├─→ (Optional) Enables watermark
  │     └─→ Enters text: "My Portfolio"
  │     └─→ Selects position: "Bottom Right"
  │     └─→ Sets opacity: 50%
  ├─→ Clicks "Convert"
  │
  ↓
[Frontend - FileUploader.tsx]
  │
  ├─→ Client-side validation:
  │     - File size < 30MB ✓
  │     - File type allowed ✓
  │     - Format compatibility ✓
  │
  ├─→ Create FormData:
  │     {
  │       file: <photo.jpg>,
  │       output_format: "png",
  │       watermark_enabled: true,
  │       watermark_config: {
  │         text: "My Portfolio",
  │         position: "bottom-right",
  │         opacity: 0.5
  │       }
  │     }
  │
  ├─→ POST /api/upload (multipart/form-data)
  │     Headers: { Authorization: Bearer <JWT> }
  │
  ↓
[Backend - upload_handler.go]
  │
  ├─→ JWT middleware validates token
  ├─→ Extract user_id from JWT claims
  ├─→ Parse multipart form
  ├─→ Server-side validation:
  │     - File type (magic bytes check)
  │     - File size limit
  │     - Rate limit check
  │
  ├─→ Generate unique filename: 
  │     user_123/original/2026-01-21_abc123.jpg
  │
  ├─→ Upload original file to S3:
  │     bucket: gomorph-files
  │     key: user_123/original/2026-01-21_abc123.jpg
  │
  ├─→ Create Job record in PostgreSQL:
  │     {
  │       id: uuid-456,
  │       user_id: 123,
  │       status: "queued",
  │       input_format: "jpg",
  │       output_format: "png",
  │       original_s3_key: "user_123/original/...",
  │       watermark_enabled: true,
  │       watermark_config: {...}
  │     }
  │
  ├─→ Enqueue task in Redis (Asynq):
  │     Task: ConvertImageTask
  │     Payload: { job_id: uuid-456 }
  │     Priority: normal
  │
  ├─→ Return response:
  │     {
  │       job_id: "uuid-456",
  │       status: "queued",
  │       message: "Conversion started"
  │     }
  │
  ↓
[Frontend]
  │
  ├─→ Receive job_id
  ├─→ Navigate to /jobs/uuid-456
  ├─→ Start polling for status
  │
  ✓ Job created and queued


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: BACKGROUND PROCESSING                                       │
└─────────────────────────────────────────────────────────────────────┘

[Asynq Worker Server - Running 24/7]
  │
  ├─→ Polls Redis queue for new tasks
  │
  ↓ Task received: ConvertImageTask
  │
[worker/processor.go - ProcessImageConversion()]
  │
  ├─→ 1. Fetch job from PostgreSQL (job_id: uuid-456)
  │
  ├─→ 2. Update job status:
  │       status: "processing"
  │       updated_at: NOW()
  │
  ├─→ 3. Download original file from S3:
  │       Download: user_123/original/2026-01-21_abc123.jpg
  │       Save to temp: /tmp/input-abc123.jpg
  │
  ├─→ 4. Execute conversion (ffmpeg):
  │       Command:
  │       ffmpeg -i /tmp/input-abc123.jpg \
  │              -f image2 \
  │              /tmp/output-abc123.png
  │
  │     ✓ Conversion successful
  │
  ├─→ 5. Apply watermark (if enabled):
  │       [watermark_service.go]
  │       │
  │       ├─→ Create text overlay using ImageMagick:
  │       │     convert /tmp/output-abc123.png \
  │       │       -gravity SouthEast \
  │       │       -pointsize 24 \
  │       │       -fill "rgba(255,255,255,0.5)" \
  │       │       -annotate +10+10 "My Portfolio" \
  │       │       /tmp/watermarked-abc123.png
  │       │
  │       ✓ Watermark applied
  │
  ├─→ 6. Upload converted file to S3:
  │       Upload: /tmp/watermarked-abc123.png
  │       To: user_123/converted/2026-01-21_abc123.png
  │
  ├─→ 7. Update job record:
  │       status: "completed"
  │       converted_s3_key: "user_123/converted/..."
  │       completed_at: NOW()
  │
  ├─→ 8. Create history entry:
  │       INSERT INTO conversion_history (
  │         user_id: 123,
  │         job_id: uuid-456,
  │         input_format: "jpg",
  │         output_format: "png",
  │         conversion_time_seconds: 2.5
  │       )
  │
  ├─→ 9. Cleanup temp files:
  │       rm /tmp/input-abc123.jpg
  │       rm /tmp/output-abc123.png
  │       rm /tmp/watermarked-abc123.png
  │
  ✓ Conversion complete


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: STATUS POLLING & DOWNLOAD                                   │
└─────────────────────────────────────────────────────────────────────┘

[Frontend - JobStatus.tsx]
  │
  ├─→ useEffect(() => {
  │     setInterval(() => {
  │       fetch(`/api/jobs/uuid-456`)
  │     }, 2000) // Poll every 2 seconds
  │   })
  │
  ↓ (After ~5 polls)
  │
[Backend Response]
  │
  └─→ {
        job_id: "uuid-456",
        status: "completed", ← Changed!
        input_format: "jpg",
        output_format: "png",
        created_at: "2026-01-21T10:30:00Z",
        completed_at: "2026-01-21T10:30:03Z"
      }
  │
  ↓
[Frontend]
  │
  ├─→ Detect status change
  ├─→ Stop polling
  ├─→ Show success notification: "✓ Conversion complete!"
  ├─→ Display download button
  │
[User clicks "Download"]
  │
  ↓
[Frontend]
  │
  ├─→ GET /api/download/uuid-456
  │
  ↓
[Backend - download_handler.go]
  │
  ├─→ Verify user owns this job
  ├─→ Generate S3 presigned URL:
  │     URL: https://gomorph-files.s3.amazonaws.com/...
  │     Expiry: 1 hour
  │     Signature: AWS-signed
  │
  ├─→ Return: { download_url: "https://..." }
  │
  ↓
[Frontend]
  │
  ├─→ Redirect browser to presigned URL
  │
  ↓
[User's Browser]
  │
  ├─→ Downloads file directly from S3
  ├─→ File saved: photo_converted.png
  │
  ✓ Download complete!


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: VIEW CONVERSION HISTORY                                     │
└─────────────────────────────────────────────────────────────────────┘

[User navigates to /history]
  │
  ↓
[Frontend - History.tsx]
  │
  ├─→ GET /api/history?page=1&limit=20
  │
  ↓
[Backend - history_handler.go]
  │
  ├─→ Query PostgreSQL:
  │     SELECT * FROM conversion_history
  │     WHERE user_id = 123
  │     ORDER BY created_at DESC
  │     LIMIT 20 OFFSET 0
  │
  ├─→ Calculate statistics:
  │     - Total conversions: 47
  │     - Most used format: JPG → PNG (15 times)
  │     - Total data processed: 245 MB
  │
  ├─→ Return:
  │     {
  │       history: [
  │         {
  │           id: 1,
  │           input_format: "jpg",
  │           output_format: "png",
  │           created_at: "2026-01-21T10:30:00Z",
  │           conversion_time: 2.5
  │         },
  │         ...
  │       ],
  │       stats: { total: 47, most_used: "JPG→PNG" },
  │       pagination: { page: 1, total_pages: 3 }
  │     }
  │
  ↓
[Frontend]
  │
  ├─→ Render HistoryTable with data
  ├─→ Show statistics cards
  ├─→ Enable filters (date range, format)
  │
  ✓ History displayed
```

---

## 🔐 SECURITY FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ JWT AUTHENTICATION FLOW                                              │
└─────────────────────────────────────────────────────────────────────┘

[User Login]
  │
  ↓
[POST /api/auth/login]
  │
  ├─→ Verify credentials (bcrypt compare)
  ├─→ Generate JWT:
  │     Header: { alg: "HS256", typ: "JWT" }
  │     Payload: {
  │       user_id: 123,
  │       email: "user@example.com",
  │       exp: 1738123456 (24h from now)
  │     }
  │     Signature: HMAC-SHA256(header + payload, SECRET_KEY)
  │
  └─→ Return token to client
  │
[Client stores in localStorage]
  │
[Subsequent requests]
  │
  ├─→ Include header: Authorization: Bearer <JWT>
  │
  ↓
[Backend Middleware - auth.go]
  │
  ├─→ Extract token from header
  ├─→ Verify signature with SECRET_KEY
  ├─→ Check expiration time
  ├─→ Extract user_id from claims
  ├─→ Attach user_id to request context
  │
  ↓ [If valid]
  │
[Request proceeds to handler]
```

---

## 📊 DATABASE INTERACTION FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ GORM ORM PATTERN                                                     │
└─────────────────────────────────────────────────────────────────────┘

[Application Code - handlers/upload.go]
  │
  ├─→ Create Job struct:
  │     job := models.Job{
  │       UserID: userID,
  │       Status: "queued",
  │       InputFormat: "jpg",
  │       OutputFormat: "png",
  │       OriginalS3Key: s3Key,
  │     }
  │
  ├─→ Insert into database:
  │     db.Create(&job)
  │
  ↓
[GORM ORM Layer]
  │
  ├─→ Auto-generate SQL:
  │     INSERT INTO jobs (
  │       id, user_id, status, input_format,
  │       output_format, original_s3_key, created_at
  │     ) VALUES (
  │       gen_random_uuid(), $1, $2, $3, $4, $5, NOW()
  │     )
  │
  ↓
[PostgreSQL]
  │
  ├─→ Execute query
  ├─→ Return inserted row with generated ID
  │
  ↓
[GORM]
  │
  ├─→ Populate job.ID with returned UUID
  │
  ↓
[Application Code]
  │
  └─→ Use job.ID for response
```

---

## 📦 REDIS QUEUE FLOW (Asynq)

```
┌─────────────────────────────────────────────────────────────────────┐
│ JOB QUEUE MECHANISM                                                  │
└─────────────────────────────────────────────────────────────────────┘

[API Server - Enqueue Task]
  │
  ├─→ Create task:
  │     task := asynq.NewTask(
  │       "convert:image",
  │       payload: { job_id: "uuid-456" }
  │     )
  │
  ├─→ Enqueue to Redis:
  │     client.Enqueue(task, asynq.MaxRetry(3))
  │
  ↓
[Redis]
  │
  ├─→ Store in queue:
  │     LPUSH asynq:queues:default <serialized_task>
  │     SET asynq:task:uuid-789 <task_metadata>
  │
[Worker Server - Consume Tasks]
  │
  ├─→ Poll Redis queue:
  │     BRPOP asynq:queues:default 5 (blocking)
  │
  ├─→ Receive task
  ├─→ Deserialize payload
  ├─→ Call handler: ProcessImageConversion(job_id)
  │
  ↓ [If successful]
  │
  ├─→ Delete task from Redis:
  │     DEL asynq:task:uuid-789
  │
  ↓ [If failed]
  │
  ├─→ Increment retry count
  ├─→ Re-queue with exponential backoff:
  │     LPUSH asynq:queues:default <task> (after delay)
  │
  ↓ [After 3 retries]
  │
  └─→ Move to dead letter queue:
        LPUSH asynq:queues:dead <task>
```

---

## 🎨 FRONTEND STATE MANAGEMENT

```
┌─────────────────────────────────────────────────────────────────────┐
│ REACT QUERY PATTERN (Server State)                                  │
└─────────────────────────────────────────────────────────────────────┘

[Component - JobStatus.tsx]
  │
  ├─→ Use React Query hook:
  │     const { data, isLoading, error } = useQuery({
  │       queryKey: ['job', jobId],
  │       queryFn: () => fetchJobStatus(jobId),
  │       refetchInterval: 2000, // Auto-poll every 2s
  │       enabled: status !== 'completed'
  │     })
  │
  ↓
[React Query Library]
  │
  ├─→ Manages cache automatically
  ├─→ Handles polling lifecycle
  ├─→ Deduplicates requests
  ├─→ Auto-retries on failure
  │
  ↓ [On data change]
  │
[Component re-renders with new data]
  │
  └─→ UI updates (progress bar, status text)


┌─────────────────────────────────────────────────────────────────────┐
│ CONTEXT API PATTERN (Global Auth State)                             │
└─────────────────────────────────────────────────────────────────────┘

[AuthContext.tsx]
  │
  ├─→ Create context:
  │     const AuthContext = createContext({
  │       user: null,
  │       login: (token) => {...},
  │       logout: () => {...}
  │     })
  │
[App.tsx]
  │
  ├─→ Wrap app with provider:
  │     <AuthContext.Provider value={authState}>
  │       <Router>...</Router>
  │     </AuthContext.Provider>
  │
[Any Component]
  │
  └─→ Access auth state:
        const { user, logout } = useContext(AuthContext)
        if (!user) return <Navigate to="/login" />
```

---

## 🚀 DEPLOYMENT FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ CI/CD PIPELINE (GitHub Actions)                                      │
└─────────────────────────────────────────────────────────────────────┘

[Developer pushes to GitHub]
  │
  ↓
[GitHub Actions Trigger]
  │
  ├─→ Backend Pipeline (.github/workflows/backend.yml):
  │   │
  │   ├─→ Checkout code
  │   ├─→ Setup Go 1.24
  │   ├─→ Run tests: go test ./...
  │   ├─→ Build Docker image
  │   ├─→ Push to Docker Hub
  │   ├─→ Trigger Render deployment
  │   │
  │   ↓
  │   [Render receives webhook]
  │   │
  │   ├─→ Pull latest Docker image
  │   ├─→ Run database migrations
  │   ├─→ Deploy API server (zero-downtime)
  │   ├─→ Deploy worker server
  │   └─→ Health check: GET /health
  │
  ├─→ Frontend Pipeline (.github/workflows/frontend.yml):
  │   │
  │   ├─→ Checkout code
  │   ├─→ Setup Node.js 18
  │   ├─→ Install dependencies: npm ci
  │   ├─→ Run tests: npm test
  │   ├─→ Build: npm run build
  │   ├─→ Deploy to Vercel
  │   │
  │   ↓
  │   [Vercel receives deployment]
  │   │
  │   ├─→ Upload dist/ to CDN
  │   ├─→ Invalidate cache
  │   └─→ Generate preview URL
  │
  ✓ Deployment complete
```

---

## 🎯 KEY INTEGRATION POINTS

### 1. Frontend ↔ Backend
- **Protocol**: HTTPS/REST
- **Auth**: JWT in Authorization header
- **Data Format**: JSON
- **Error Handling**: Standard HTTP status codes

### 2. Backend ↔ PostgreSQL
- **ORM**: GORM
- **Connection**: Connection pool (max 25 connections)
- **Migrations**: Versioned SQL files

### 3. Backend ↔ Redis
- **Library**: Asynq (job queue)
- **Use Cases**: 
  - Job queue
  - Rate limiting
  - Session cache (optional)

### 4. Backend ↔ AWS S3
- **SDK**: AWS SDK for Go v2
- **Operations**:
  - PutObject (upload)
  - GetObject (download)
  - DeleteObject (cleanup)
  - Presigned URLs (secure downloads)

### 5. Worker ↔ Conversion Tools
- **ffmpeg**: Video/audio/image conversion
- **ImageMagick**: Advanced image manipulation
- **pandoc**: Document conversion
- **Execution**: os/exec package (command line)

---

This architecture provides:
✅ **Scalability**: Async processing, horizontal scaling
✅ **Reliability**: Queue-based jobs, retries, error handling
✅ **Security**: JWT auth, presigned URLs, file validation
✅ **Performance**: Caching, optimized queries, CDN delivery
✅ **Maintainability**: Clean architecture, typed interfaces, documentation
