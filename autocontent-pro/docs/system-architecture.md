# System Architecture - AutoContent Pro

**Version:** 0.1.0
**Status:** MVP Complete (All 10 Phases)
**Last Updated:** March 19, 2026

## Overview

AutoContent Pro is a Tauri v2 + Rust + React 19 desktop application for AI-powered video generation, processing, and distribution. The system integrates multiple external APIs and handles complex video workflows with batch processing, quality upscaling, subtitle generation, and cloud storage management.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                 Frontend (React 19 + UI)                │
│  (7 Pages: Dashboard, Generate, Accounts, Drive, etc.)  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│          Tauri Command Bridge (IPC Layer)               │
│  (Type-safe command handlers for all operations)        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│       Backend Services Layer (Rust)                     │
│  (Business logic, API clients, system operations)       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│         External Services & System APIs                 │
│  (Google APIs, Gemini, FFmpeg, Whisper, Browser)       │
└─────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Frontend Layer (React 19)

**Location:** `src/`

#### Pages
- **Dashboard Page** (`dashboard-page.tsx`) - Overview of videos, queue status, stats
- **Video Generate Page** (`video-generate-page.tsx`) - AI prompt input, generation
- **Accounts Page** (`accounts-page.tsx`) - Multi-account management (API keys, OAuth)
- **Google Drive Page** (`google-drive-page.tsx`) - File upload, management, sync
- **Batch Processing Page** (`batch-processing-page.tsx`) - Queue management, scheduling
- **Settings Page** (`settings-page.tsx`) - Browser automation, proxy, preferences
- **Logs Page** (`logs-page.tsx`) - System events and debugging

#### Component Structure
- `components/layout/` - App shell, sidebar, header
- `components/ui/` - Reusable shadcn components (Button, Card, Select, etc.)
- `components/shared/` - Empty states, loading spinners, containers
- `components/video/` - Video generation, subtitles, preview, processing
- `components/accounts/` - Account form, list, API key input
- `components/drive/` - Drive file browser, upload status
- `components/batch/` - Batch creation form, queue table
- `components/dashboard/` - Statistics, panels, video history
- `components/settings/` - Browser and proxy configuration

### 2. Tauri Command Bridge

**Location:** `src-tauri/src/commands/`

All commands are type-safe Rust handlers exposed to the frontend:

```
commands::
├── veo3::{veo3_generate_video, veo3_list_history}
├── accounts::{add_account_oauth, list_accounts, remove_account, set_api_key, get_active_account}
├── video::{process_video, get_video_info}
├── drive::{drive_upload, drive_list_files, drive_delete_file}
├── subtitle::{transcribe_video, save_srt, burn_subtitles}
├── batch::{batch_create, batch_start, batch_pause, batch_resume, batch_cancel_job, batch_cancel_batch, batch_retry_job, batch_get_status, batch_get_jobs, batch_get_all_jobs}
└── browser::{browser_launch_capture, browser_screenshot, browser_test_proxy}
```

### 3. Backend Services Layer

**Location:** `src-tauri/src/services/`

#### VEO3 API Integration (`gemini_client.rs`)
- Sends video generation prompts to Google Gemini API
- Streams video URLs from generation pipeline
- Handles retries and error recovery

#### Video Processing (`ffmpeg.rs`, `upscaler.rs`)
- **FFmpeg Service** - Encodes, converts, merges videos and audio
- **RealESRGAN Upscaler** - Upscales video resolution (SD → 4K potential)
- Chain: Original → FFmpeg Processing → RealESRGAN → Final Output

#### Subtitle Generation (`whisper.rs`)
- **Whisper.cpp Sidecar** - Local speech-to-text transcription
- Outputs SRT subtitle files
- Supports multiple audio formats

#### Google Drive Integration (`drive_client.rs`)
- OAuth authentication and token refresh
- Resumable upload for large files
- File listing, deletion, metadata management

#### Account Management (`oauth.rs`, `crypto.rs`)
- OAuth 2.0 flow for Google accounts
- Encrypted storage of API keys and tokens (AES-256-GCM)
- Multi-account support with active account selection

#### Batch Processing (`job_dispatcher.rs`, `batch_manager.rs`)
- **JobDispatcher** - Async background task runner using `mpsc` channels
- **BatchManager** - Manages job queues, retries, state transitions
- Handles pausing, resuming, canceling jobs
- Persistence of job state

#### Browser Automation (`browser_manager.rs`, `proxy.rs`)
- **chromiumoxide CDP** - Remote debugging protocol for browser control
- **Anti-detect Browser Setup** - Stealth mode, header spoofing, timezone randomization
- **Proxy Pool Management** - Rotating proxy support for distributed testing
- Screenshot capture, interaction automation

### 4. Data Models

**Location:** `src-tauri/src/models/`

```rust
Account {
    id: String,
    email: String,
    oauth_token: String,           // Encrypted
    api_key: Option<String>,       // Encrypted
    is_active: bool,
    created_at: DateTime,
}

VideoJob {
    id: String,
    account_id: String,
    prompt: String,
    veo3_url: Option<String>,
    processed_path: Option<String>,
    subtitle_path: Option<String>,
    status: JobStatus,
    created_at: DateTime,
}

BatchJob {
    id: String,
    batch_id: String,
    video_job_id: String,
    drive_path: Option<String>,
    retry_count: u32,
    status: JobStatus,
}

BrowserProfile {
    user_agent: String,
    timezone: String,
    geolocation: Option<(f64, f64)>,
    proxy: Option<ProxyConfig>,
    stealth_enabled: bool,
}
```

### 5. Database

**Plugin:** `tauri_plugin_sql`

Tables:
- `accounts` - User accounts with OAuth tokens and API keys
- `video_jobs` - Video generation and processing records
- `batch_jobs` - Batch processing job tracking
- `settings` - User preferences, browser configs

## Data Flow

### Video Generation Pipeline

```
User Input (Prompt)
    ↓
[Generate Video Command]
    ↓
VEO3 API (Gemini) → Video Stream
    ↓
Save Temporary Video File
    ↓
[Process Video Command]
    ↓
FFmpeg Encoding → RealESRGAN Upscaling
    ↓
Final Video Output
    ↓
[Optional: Subtitle Generation]
    ↓
Whisper.cpp Transcription → SRT File
    ↓
[Optional: Burn Subtitles]
    ↓
FFmpeg Subtitle Burning → Final Output with Subtitles
```

### Batch Processing Pipeline

```
User Creates Batch
    ↓
[Batch Create Command]
    ↓
BatchManager Queues Jobs (mpsc channel)
    ↓
[Background Task: JobDispatcher]
    ↓
Dequeues Job → Executes Commands in Sequence
    ↓
[For Each Job:]
  1. VEO3 Generation
  2. Video Processing
  3. Subtitle Generation (optional)
  4. Drive Upload (optional)
    ↓
Update Job Status → Store in DB
    ↓
Handle Errors → Retry Logic → Mark Complete/Failed
```

### Drive Upload Pipeline

```
Video Ready
    ↓
[Drive Upload Command]
    ↓
OAuth Token Validation
    ↓
Resumable Upload Session Created
    ↓
File Uploaded in Chunks
    ↓
Verify File Hash
    ↓
Update Job Metadata
    ↓
Complete / Error Handling
```

### Browser Automation Pipeline

```
[Launch Capture Command]
    ↓
Initialize Browser with CDP
    ↓
Apply Anti-detect Profile
    ↓
Apply Proxy Rotation
    ↓
Navigate to Target URL
    ↓
[Screenshot Command] / [Execute Script]
    ↓
Return Data / Error
    ↓
Close Browser Session
```

## Key Features by Phase

| Phase | Feature | Status | Key Components |
|-------|---------|--------|-----------------|
| 1 | Tauri + React + shadcn/ui | Complete | Vite, TypeScript, Tailwind |
| 2 | Core UI (7 pages, nav) | Complete | Pages, Layout, Components |
| 3 | VEO3 API Integration | Complete | gemini_client, veo3_generate |
| 4 | Account Management | Complete | oauth, crypto, accounts |
| 5 | Video Processing | Complete | ffmpeg, upscaler, process_video |
| 6 | Subtitle Generation | Complete | whisper, transcribe, burn |
| 7 | Google Drive | Complete | drive_client, resumable upload |
| 8 | Batch Processing | Complete | job_dispatcher, batch_manager |
| 9 | Browser Automation | Complete | browser_manager, proxy pool |
| 10 | Testing & CI/CD | Complete | 25 unit tests, GH Actions |

## Security & Encryption

- **API Key Storage:** AES-256-GCM encryption at rest
- **OAuth Tokens:** Encrypted and stored in database
- **Network:** HTTPS for all external API calls
- **Browser Stealth:** User-agent spoofing, header injection, timezone randomization
- **Proxy Support:** Rotating proxy pool for distributed testing

## Performance Considerations

- **Video Processing:** Runs on background task (mpsc channels)
- **Batch Operations:** Queued and serialized to avoid resource contention
- **Drive Upload:** Resumable chunks to handle network interruptions
- **Browser CDP:** Single session per operation to minimize memory

## Dependencies

### Frontend
- React 19, React Router, shadcn/ui, Lucide icons
- Tauri API plugins (fs, dialog, notification, shell)

### Backend (Rust)
- tokio (async runtime)
- serde (serialization)
- chrono (datetime)
- reqwest (HTTP client)
- rusqlite (SQL database)
- AES-GCM (encryption)
- chromiumoxide (browser CDP)

### External Services
- Google Gemini API (VEO3 video generation)
- Google Drive API (file storage)
- FFmpeg (video encoding)
- RealESRGAN (upscaling)
- Whisper.cpp (speech-to-text)
- Chromium (browser automation)

## Deployment

- **Packaging:** Tauri build produces native installers (.exe, .dmg, .AppImage)
- **Distribution:** GitHub Actions release workflow
- **Updates:** Managed via Tauri's built-in update system

## Future Enhancements

- Multi-language subtitle support
- Batch export formats (MP4, WebM, HLS)
- Advanced video editing UI
- Real-time collaboration
- Mobile app (React Native)
- Cloud backend synchronization
