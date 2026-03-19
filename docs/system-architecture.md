# AutoContent Pro - System Architecture

## Architecture Overview

AutoContent Pro follows a **two-layer desktop architecture**: a Rust backend (event-driven async) communicating with React frontend via IPC.

```
┌─────────────────────────────────────────────────────┐
│          React 19 Frontend (TypeScript)              │
│  ┌──────────────┬──────────────┬──────────────┐    │
│  │  Dashboard   │   Generate   │   Accounts   │... │
│  └──────────────┴──────────────┴──────────────┘    │
│         ↕ IPC (tauri::invoke)                      │
│  Sidebar | Pages | Forms | State (hooks/context)   │
└─────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────┐
│       Rust Backend (Tokio Async Runtime)            │
│  ┌──────────────────────────────────────────────┐  │
│  │  Commands (IPC handlers)                     │  │
│  │  ├── video_generate, queue_add, status_get   │  │
│  │  └── ... 65+ total commands                  │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Services Layer                              │  │
│  │  ├── GeminiService (VEO3 API)               │  │
│  │  ├── VideoProcessingService (ffmpeg, etc)   │  │
│  │  ├── GoogleDriveService (OAuth2)            │  │
│  │  ├── QueueService (job scheduling)          │  │
│  │  └── StorageService (encrypted credentials) │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Data Access Layer                           │  │
│  │  ├── SQLite (tauri-plugin-sql)               │  │
│  │  ├── Store (tauri-plugin-store)              │  │
│  │  └── FileSystem (tauri-plugin-fs)            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      ↕
    ┌─────────────────┴─────────────────┐
    ↓                                    ↓
 External APIs                    Sidecar Binaries
 ├── Gemini (VEO3)               ├── FFmpeg
 ├── Google Drive                ├── RealESRGAN NCNN
 ├── Google OAuth2               └── Whisper.cpp
 └── CDN                          (GPU-accelerated)
```

## Frontend Architecture

### Directory Structure
```
src/
├── components/
│   ├── ui/                      # shadcn/ui auto-generated
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── app-layout.tsx      # Main layout wrapper
│   │   ├── sidebar.tsx          # Collapsible nav (64/240px)
│   │   ├── header.tsx           # Breadcrumb + actions
│   │   └── sidebar-nav-item.tsx # Single nav item
│   ├── dashboard/               # Dashboard-specific
│   │   ├── stat-card.tsx        # 4 stat cards
│   │   ├── recent-videos.tsx    # Video list
│   │   └── queue-status.tsx     # Queue overview
│   ├── video-generate/          # Video create form
│   │   ├── prompt-input.tsx
│   │   ├── video-preview.tsx
│   │   └── model-selector.tsx
│   ├── accounts/                # Account management
│   │   ├── account-list.tsx
│   │   ├── account-form.tsx
│   │   └── api-key-input.tsx
│   ├── batch/                   # Batch operations
│   │   ├── batch-queue.tsx
│   │   ├── queue-item.tsx
│   │   └── batch-actions.tsx
│   ├── shared/
│   │   ├── page-container.tsx   # Standard page wrapper
│   │   ├── empty-state.tsx      # No data state
│   │   ├── loading-spinner.tsx  # Loading indicator
│   │   └── error-boundary.tsx   # Error handling
│   └── dialogs/
│       ├── confirm-dialog.tsx
│       └── form-dialogs.tsx
├── pages/
│   ├── dashboard.tsx            # "/" route
│   ├── video-generate.tsx       # "/generate"
│   ├── accounts.tsx             # "/accounts"
│   ├── batch.tsx                # "/batch"
│   ├── drive.tsx                # "/drive"
│   ├── settings.tsx             # "/settings"
│   └── logs.tsx                 # "/logs"
├── hooks/
│   ├── use-tauri.ts             # Generic IPC wrapper
│   ├── use-sidebar.ts           # Sidebar state
│   ├── use-videos.ts            # Video state management
│   ├── use-queue.ts             # Queue operations
│   └── use-accounts.ts          # Account CRUD
├── lib/
│   ├── utils.ts                 # cn() for class merging
│   ├── api.ts                   # Typed IPC wrappers
│   ├── routes.ts                # Route definitions
│   └── constants.ts             # App constants
├── App.tsx                      # Router setup
├── main.tsx                     # React entry + error boundary
└── index.css                    # Tailwind + theme vars
```

### Component Hierarchy
- **AppLayout** wraps all routes
  - **Sidebar** (collapsible, 7 nav items)
  - **Header** (breadcrumb, user menu)
  - **Route Outlet** (page content)
    - Each page has **PageContainer** wrapper
    - Pages compose smaller components (cards, forms, lists)

### State Management
- **Local Component State:** `useState` for UI toggle (sidebar collapse, modal open)
- **Context API:** Theme (dark/light), current user
- **Custom Hooks:** `use-tauri()` for IPC, `use-videos()` for video CRUD
- **Server State:** Backend is source of truth; frontend queries via IPC

### Theme System
- **Dark Theme Default:** CSS variables in `index.css`
- **Tailwind Dark Mode:** Supports `.dark` class toggle
- **Color Variables:** `--background`, `--foreground`, `--card`, `--primary`, `--muted`

## Backend Architecture

### Module Structure
```
src-tauri/src/
├── main.rs                  # Entry point
├── lib.rs                   # Tauri builder + plugin init
├── commands/
│   ├── mod.rs               # Module declarations
│   ├── video.rs             # Video-related commands (15+)
│   ├── account.rs           # Account management (10+)
│   ├── queue.rs             # Queue operations (8+)
│   ├── drive.rs             # Google Drive commands (6+)
│   ├── system.rs            # App settings (8+)
│   └── monitoring.rs        # Health/stats (8+)
├── services/
│   ├── mod.rs
│   ├── gemini_service.rs    # VEO3 API integration
│   ├── video_service.rs     # ffmpeg, upscaling pipeline
│   ├── drive_service.rs     # Google Drive OAuth2
│   ├── queue_service.rs     # Job scheduling + persistence
│   ├── storage_service.rs   # Encrypted credential store
│   ├── process_service.rs   # Sidecar management
│   └── webhook_service.rs   # Event callbacks
├── models/
│   ├── mod.rs
│   ├── video.rs             # Video struct + enums
│   ├── account.rs           # Account + credential models
│   ├── queue.rs             # JobQueue + JobItem
│   ├── response.rs          # API response wrappers
│   └── error.rs             # Error types
├── db/
│   ├── mod.rs
│   ├── schema.rs            # SQLite migrations
│   ├── video_repo.rs        # Video CRUD
│   ├── account_repo.rs      # Account CRUD
│   ├── queue_repo.rs        # Queue persistence
│   └── log_repo.rs          # Audit logging
├── security/
│   ├── mod.rs
│   ├── crypto.rs            # Encrypt/decrypt credentials
│   └── auth.rs              # OAuth2 flow helpers
└── error.rs                 # Global error handling
```

### Command Categories (65+ total)

| Category | Count | Examples |
|----------|-------|----------|
| Video | 15 | generate, preview, status, cancel, delete |
| Account | 10 | add, remove, list, verify, switch |
| Queue | 8 | add_job, list_jobs, pause, resume, clear |
| Drive | 6 | authenticate, list_folders, upload, share |
| System | 8 | app_info, get_settings, set_settings, check_updates |
| Monitoring | 8 | get_stats, get_logs, get_health, export_logs |

### Service Layer Design
- **GeminiService:** Wraps Google AI API, handles retries, rate limiting
- **VideoService:** Orchestrates ffmpeg, RealESRGAN, whisper processes
- **DriveService:** OAuth2 token management, file operations
- **QueueService:** Priority scheduling, persistence, recovery on restart
- **StorageService:** Encrypted keychain for credentials (OS-native on macOS, local encrypted on Windows)

### Error Handling
- Custom `AppError` enum with context
- All commands return `Result<T, AppError>`
- Frontend receives error code + message
- Logging via `tracing` crate (structured logs)

### Async Runtime
- Tokio multi-threaded executor
- Blocking operations in `tokio::task::spawn_blocking()`
- Plugins (SQL, shell) integrated into tokio context

## Data Flow Examples

### Video Generation Flow
1. **Frontend:** User fills prompt + selects account, clicks "Generate"
2. **IPC Call:** `video_generate({ account_id, prompt, settings })`
3. **Backend Command Handler:**
   - Validates account + API key
   - Calls `GeminiService::generate_video()`
   - Returns `video_id` + status
4. **GeminiService:**
   - Calls Gemini API with prompt
   - Polls status endpoint every 5s
   - Returns video URL when complete
5. **Backend Command Handler:**
   - Downloads video to `$APPDATA/autocontent/videos/{video_id}.mp4`
   - Creates DB record with metadata
   - Emits `video_generated` event
6. **Frontend:** Listens for IPC event, updates dashboard
7. **User:** Clicks video → preview or queue for upscaling

### Batch Processing Flow
1. **Frontend:** User selects 3 videos, clicks "Add to Queue"
2. **IPC Call:** `queue_add_batch({ video_ids, operations: ["upscale", "subtitle"] })`
3. **Backend:**
   - Creates JobQueue entries in SQLite
   - Starts `QueueService` worker
4. **QueueService Worker (async loop):**
   - Polls for pending jobs every 2s
   - Starts VideoService::upscale_video() for each
   - Updates job status as it progresses
   - On completion, triggers upload to Google Drive
5. **Frontend:** Real-time status updates via polling or events

## Database Schema

### Tables
- **videos** - metadata for generated videos (id, prompt, status, path, created_at)
- **accounts** - user accounts (id, label, api_key_encrypted, drive_folder_id)
- **queue_jobs** - batch processing jobs (id, video_id, operation, status, priority)
- **logs** - audit trail (id, level, message, timestamp)

### Indexes
- `videos(created_at DESC)` - recent videos
- `queue_jobs(status, priority)` - efficient queue polling
- `accounts(label)` - quick account lookup

## Security Architecture

### Credential Management
- API keys stored encrypted in SQLite (AES-256-GCM)
- Master encryption key derived from OS keychain (macOS) or local secret (Windows)
- OAuth2 refresh tokens auto-rotated, never stored plaintext

### Network Security
- All API calls over HTTPS
- CSP enabled: `script-src 'sha256-...'` (hash-based)
- Tauri capabilities locked to minimal permissions (store, sql, fs, shell)

### Access Control
- IPC commands rate-limited (100/min per command)
- API key per account (multi-tenant design)
- Audit logging for sensitive operations (account add, key rotation)

## Performance Characteristics

### Startup Time
- Cold start: ~4s (Tauri init + React render)
- Warm start: ~1s (page routing)
- Dev mode HMR: ~100ms refresh

### Memory Footprint
- Idle: ~45MB (Tauri + React runtime)
- Processing video: ~200MB peak (video in RAM)
- With GPU upscaling: +500MB (GPU VRAM reserved)

### Network
- VEO3 generation request: ~30s (API overhead + processing)
- Google Drive upload: ~5s per 100MB video
- IPC roundtrip: < 10ms

### Database
- Query latency: < 50ms (local SQLite)
- 10K video records: full scan in ~200ms

## Deployment Architecture

### Build Targets
- **Windows:** Installer (.msi) + portable .exe
- **macOS:** DMG + universal binary (arm64 + x86_64)
- **CI/CD:** GitHub Actions (Windows runner for .exe, macOS for .app)

### Dependencies
- Sidecar binaries bundled in installer
- FFmpeg: downloaded on first run (cached)
- Whisper models: lazy-loaded (user selects tiny/small)
- RealESRGAN: bundled NCNN binary (5MB)

### Update Strategy
- Auto-check for updates on startup
- Delta patches via GitHub releases
- User can opt-in to beta channel

## Scalability Considerations

### Horizontal (Multiple Accounts)
- Each account isolated (separate API key, Drive folder)
- Queue multiplexing across accounts
- No shared state except logs

### Vertical (Large Queues)
- SQLite can handle 100K+ jobs (indexed)
- Worker thread pools for parallel processing
- Lazy-load job details (pagination)

### External APIs
- Implement retry with exponential backoff (Gemini rate limits)
- Circuit breaker pattern for Drive API failures
- Graceful degradation if API unavailable
