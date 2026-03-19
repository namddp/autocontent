# AutoContent Pro - Project Overview & PDR

## Executive Summary
AutoContent Pro is a cross-platform desktop application (Windows + macOS) that automates AI video creation using Google's VEO3 API. The application enables users to generate, upscale, subtitle, and distribute videos in batch with multi-account support and cloud integration.

**Status:** Phase 1-2 Complete | **Version:** 0.1.0 | **ETA Completion:** 2026-04-15

## Product Definition

### Target Users
- Content creators automating video production
- Marketing teams managing batch video campaigns
- Video editors using AI for upscaling/enhancement
- Multi-channel distributors managing accounts

### Core Problem
Manual video creation and upscaling is time-intensive; users need automated, batch-capable solution integrated with Google Drive.

### Solution Overview
Desktop app combining VEO3 (AI video generation), RealESRGAN (upscaling), Whisper (subtitles), and batch processing with account management and Google Drive sync.

## Project Scope

### In Scope (10 Phases)
- Desktop UI with dark theme & collapsible sidebar
- VEO3 API integration for video generation
- Multi-account management (Gemini + Google Drive OAuth2)
- Video processing pipeline (generate → upscale → subtitle)
- Batch queue processing
- Google Drive integration
- Browser automation (Antidetect for proxy testing)
- Comprehensive testing & packaging

### Out of Scope
- Mobile client
- Web version
- Real-time collaboration
- Custom AI model training

## Functional Requirements

### FR-01: Video Generation
- User specifies prompt → VEO3 generates video (6-120s)
- Progress tracking with status updates
- Error handling for API failures
- Support for multiple video formats (MP4, WebM)

### FR-02: Account Management
- Store multiple Gemini API keys with account labels
- Google Drive OAuth2 authentication per account
- Account switching without restart
- Secure credential storage (encrypted)

### FR-03: Batch Processing
- Queue multiple video jobs
- Priority-based scheduling
- Pause/resume queue
- Batch status monitoring
- Export queue to CSV

### FR-04: Google Drive Integration
- Auto-upload completed videos to designated folder
- Organize by date/account
- Share settings per batch
- Folder structure templating

### FR-05: Video Enhancement
- RealESRGAN upscaling (GPU-accelerated)
- Whisper subtitle generation (multi-language)
- FFmpeg post-processing (trim, concat, format)

### FR-06: Settings & Logs
- App theme (dark/light), language, quality presets
- Error logging with export
- Audit trail for videos created

## Non-Functional Requirements

### Performance
- App startup: < 5s (cold), < 1s (warm)
- Video generation request: < 30s to queue
- Upscaling: real-time GPU feedback
- Queue operations: < 500ms response
- Binary size: < 15MB (core app, excludes sidecars)
- Idle RAM: < 50MB

### Reliability
- 99.9% uptime (local processing only)
- Graceful degradation if API fails
- Auto-recover from network errors
- Persistent state across crashes (recovery mode)

### Security
- CSP enabled with hash-based scripts
- No hardcoded credentials
- OAuth2 refresh token rotation
- Encrypted storage for API keys
- Audit logging for sensitive operations

### Scalability
- Support 100+ accounts
- Process 1000+ videos in queue
- DB queries < 100ms on 10K video records

## Tech Stack

### Frontend
- **Framework:** React 19 + React Router 7
- **Build:** Vite 6 (HMR < 100ms)
- **UI:** shadcn/ui + TailwindCSS 4
- **Icons:** Lucide React
- **Language:** TypeScript 5 (strict mode)
- **State:** Built-in hooks + context API
- **Target Size:** < 86KB gzipped (achieved in Phase 2)

### Backend (Desktop)
- **Framework:** Tauri 2
- **Runtime:** Rust (tokio async)
- **Plugins:** store, sql, shell, fs, dialog, notification
- **Architecture:** IPC commands + async services

### Data & APIs
- **Local DB:** SQLite (tauri-plugin-sql)
- **Video AI:** Gemini API (veo-3.1-generate)
- **Upscale:** RealESRGAN NCNN Vulkan (sidecar)
- **Subtitles:** whisper-rs (whisper.cpp binding)
- **Media:** ffmpeg-sidecar
- **Cloud:** google-drive3 + yup-oauth2 (Rust)
- **Browser:** chromiumoxide/spider_chrome (CDP)

### Development
- **OS:** Windows 10+, macOS 11+
- **Node:** v24+ (LTS)
- **Rust:** 1.80+
- **Package Managers:** npm, cargo

## Phased Roadmap

| Phase | Name | Status | Effort | Dependencies |
|-------|------|--------|--------|--------------|
| 1 | Project Setup | ✅ Complete | 4h | - |
| 2 | Core UI Layout | ✅ Complete | 8h | P1 |
| 3 | VEO3 API Integration | Pending | 10h | P1 |
| 4 | Account Management | Pending | 10h | P1,P3 |
| 5 | Video Processing | Pending | 10h | P1,P3 |
| 6 | Subtitle Generation | Pending | 6h | P1,P5 |
| 7 | Google Drive Integration | Pending | 8h | P4 |
| 8 | Batch Processing & Queue | Pending | 10h | P3-7 |
| 9 | Browser Automation | Pending | 8h | P4 |
| 10 | Testing & Packaging | Pending | 6h | All |

**Total Effort:** 80h | **Phase 1-2 Complete:** 12h (15% done)

## Success Metrics

### Phase 1-2 Completion (ACHIEVED)
- ✅ Tauri v2 project with Rust backend
- ✅ React 19 + 7 routes, dark theme
- ✅ Sidebar collapsible (64px / 240px)
- ✅ Dashboard with 4 stat cards + 2 panels
- ✅ TypeScript strict mode enabled
- ✅ Vite build 86KB gzipped
- ✅ CSP & security capabilities enabled

### End-to-End Completion
- Video generated from prompt in < 60s (API + processing)
- Batch of 10 videos queued and processed
- Google Drive integration working (upload + folder structure)
- 95%+ unit test coverage
- Windows + macOS builds functional
- Installer < 50MB

## Risk Assessment

### Technical Risks
- **Gemini API Rate Limits:** May need queuing strategy; Mitigation: implement exponential backoff
- **Whisper Model Size:** ~500MB for full model; Mitigation: use tiny model (~40MB) as default
- **RealESRGAN GPU Memory:** Peaks at 6GB; Mitigation: add fallback CPU upscaling
- **Tauri Plugin Compatibility:** Breaking changes in v2; Mitigation: lock versions in Cargo.toml

### Market Risks
- **API Cost Escalation:** Gemini billing changes; Mitigation: implement cost calculator in UI
- **Alternative Solutions:** Competing AI tools; Mitigation: focus on multi-account batch processing UX

## Success Definition
AutoContent Pro v0.1.0 launch: production-ready desktop app with VEO3 generation, upscaling, subtitling, batch processing, and Google Drive integration for Windows/macOS.

## Key Dependencies
- Google AI Studio: Gemini API key
- Google Cloud: OAuth2 credentials for Drive
- External Binaries: FFmpeg, RealESRGAN, Whisper models (auto-managed)

## Approval & Stakeholders
- **Product:** Video creation workflow
- **Engineering:** Cross-platform desktop architecture
- **QA:** Test matrix (Windows 10/11, macOS 12+)
