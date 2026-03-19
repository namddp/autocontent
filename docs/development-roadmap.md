# AutoContent Pro - Development Roadmap

## Project Timeline

**Project Start:** 2026-03-19
**Estimated Completion:** 2026-04-15
**Total Duration:** 4 weeks (80 hours)
**Current Progress:** Phase 1-2 Complete (12/80 hours = 15%)

## Phase Breakdown

### Phase 1: Project Setup (4h) - ✅ COMPLETE
**Dates:** 2026-03-19
**Status:** 100% Complete

#### Deliverables
- Tauri v2 project scaffold with React 19
- Rust backend module structure (commands, services, models, db)
- Frontend directory setup (components, pages, hooks, lib)
- shadcn/ui initialization with core components
- Vite configuration with TailwindCSS v4
- TypeScript strict mode enabled
- All base npm + cargo dependencies installed
- Tauri capabilities configured (5 plugins)
- Development environment verified (`npm run tauri dev` works)

#### Key Achievements
- ✅ Cross-platform Tauri project (Windows + macOS ready)
- ✅ React 19 HMR working (< 100ms refresh)
- ✅ Rust backend compiles without warnings
- ✅ IPC infrastructure ready for commands

---

### Phase 2: Core UI Layout (8h) - ✅ COMPLETE
**Dates:** 2026-03-19
**Status:** 100% Complete

#### Deliverables
- App router with 7 main routes (React Router v7)
- Collapsible sidebar (64px collapsed / 240px expanded)
- Header with breadcrumb navigation
- Dashboard page with 4 stat cards + 2 content panels
- 6 placeholder pages (Video Generate, Accounts, Batch, Drive, Settings, Logs)
- Dark theme as default (CSS variables)
- Theme toggle button in sidebar
- Page transitions smooth (< 100ms, no layout shift)
- Responsive layout (min 1024x600 tested)
- All UI components from shadcn/ui integrated

#### Key Achievements
- ✅ Complete UI skeleton responsive and functional
- ✅ Dark theme convention for video editing
- ✅ Build size optimized (86KB gzipped)
- ✅ Navigation patterns established
- ✅ Component organization standards in place

#### Tech Stack Verified
- React 19 + React Router 7
- TailwindCSS v4 + shadcn/ui
- Lucide icons integrated
- TypeScript strict mode working

---

### Phase 3: VEO3 API Integration (10h) - ⏳ NEXT
**Estimated Dates:** 2026-03-20 to 2026-03-21
**Dependencies:** Phase 1
**Blocking:** Phase 4, 5, 8

#### Overview
Integrate Google's VEO3 (via Gemini API) for AI video generation. Create backend service for API calls, frontend form for prompt input, and real-time status tracking.

#### Key Tasks
1. **Backend (Rust)**
   - Create `GeminiService` (API client, retry logic, rate limiting)
   - Implement `video_generate` command (async, queued)
   - Implement `video_status` command (polling)
   - Add database schema for videos (id, prompt, status, url, created_at)
   - Error handling for API failures

2. **Frontend (React)**
   - Create `VideoGeneratePage` with prompt form
   - Build prompt input validation (max 5000 chars)
   - Implement real-time status polling (2s interval)
   - Video preview on completion
   - Error toast notifications

#### Success Criteria
- [ ] Prompt generates video in < 60s (API + processing)
- [ ] Status updates show in real-time
- [ ] API errors handled gracefully
- [ ] Video list persists across restarts

---

### Phase 4: Account Management (10h) - ⏳ PENDING
**Estimated Dates:** 2026-03-22 to 2026-03-23
**Dependencies:** Phase 1, Phase 3
**Blocking:** Phase 7, 8, 9

#### Overview
Enable users to manage multiple Gemini API keys and Google Drive accounts with secure credential storage and account switching.

#### Key Tasks
1. **Backend (Rust)**
   - Encrypted credential storage (AES-256-GCM)
   - Account CRUD commands (add, list, remove, switch, verify)
   - OAuth2 Google Drive authentication flow
   - Token refresh logic
   - Master encryption key derivation

2. **Frontend (React)**
   - Accounts page with list/add/remove UI
   - API key input form (masked display)
   - Google Drive OAuth2 login flow
   - Account switching dropdown
   - Credential validation feedback

#### Success Criteria
- [ ] Add 3+ accounts without interference
- [ ] Switch accounts without app restart
- [ ] Credentials encrypted in SQLite
- [ ] OAuth2 tokens auto-refresh
- [ ] Invalid accounts show error state

---

### Phase 5: Video Processing Pipeline (10h) - ⏳ PENDING
**Estimated Dates:** 2026-03-24 to 2026-03-25
**Dependencies:** Phase 1, Phase 3
**Blocking:** Phase 6, 8

#### Overview
Process raw VEO3 videos through ffmpeg (format conversion, trimming) and RealESRGAN (GPU upscaling) with progress tracking.

#### Key Tasks
1. **Backend (Rust)**
   - `VideoService` orchestration (ffmpeg + RealESRGAN)
   - Sidecar binary management (download, cache, execute)
   - Upscaling command with GPU detection
   - FFmpeg format conversion & quality settings
   - Progress callback integration

2. **Frontend (React)**
   - Processing status page with progress bars
   - GPU acceleration toggle
   - Quality preset selector (720p, 1080p, 4K)
   - Cancel operation button

#### Success Criteria
- [ ] Upscale 1080p video to 4K in < 5min (GPU)
- [ ] FFmpeg format conversion works
- [ ] Sidecar binaries auto-download on first run
- [ ] Progress updates real-time
- [ ] Cancel operation gracefully stops process

---

### Phase 6: Subtitle Generation (6h) - ⏳ PENDING
**Estimated Dates:** 2026-03-26
**Dependencies:** Phase 1, Phase 5
**Blocking:** Phase 8

#### Overview
Add subtitle generation using Whisper (whisper.cpp) with multi-language support and subtitle editor.

#### Key Tasks
1. **Backend (Rust)**
   - Whisper model download/cache
   - Subtitle generation command
   - SRT/VTT format output
   - Language detection auto-selection

2. **Frontend (React)**
   - Subtitle preview in video player
   - Language selector (10+ languages)
   - Subtitle editor (edit text, timing)
   - Burn-in subtitle toggle

#### Success Criteria
- [ ] Generate subtitles for 5min video in < 30s
- [ ] Multi-language support working
- [ ] Subtitle timing accurate (< 100ms sync drift)
- [ ] Subtitle editor functional

---

### Phase 7: Google Drive Integration (8h) - ⏳ PENDING
**Estimated Dates:** 2026-03-27 to 2026-03-28
**Dependencies:** Phase 4
**Blocking:** Phase 8

#### Overview
Auto-upload completed videos to Google Drive with folder organization, sharing settings, and drive quota monitoring.

#### Key Tasks
1. **Backend (Rust)**
   - Google Drive API client (google-drive3 crate)
   - Folder creation & organization (by date/account)
   - Video upload command (chunked, resume on fail)
   - Share settings command (public, link, custom)
   - Drive quota check

2. **Frontend (React)**
   - Drive settings page (folder selection, naming template)
   - Upload status per video
   - Public link generation
   - Drive quota status widget

#### Success Criteria
- [ ] Upload 500MB video to Drive in < 10min
- [ ] Folder structure auto-creates (YYYY/MM/DD format)
- [ ] Share link generated and copied
- [ ] Upload resumes on network reconnect
- [ ] Drive quota monitoring accurate

---

### Phase 8: Batch Processing & Queue (10h) - ⏳ PENDING
**Estimated Dates:** 2026-03-29 to 2026-03-30
**Dependencies:** Phase 3-7
**Blocking:** Phase 10

#### Overview
Queue system for processing multiple videos in parallel with priority scheduling, pause/resume, and batch export.

#### Key Tasks
1. **Backend (Rust)**
   - `QueueService` with job scheduling
   - SQLite persistence for queue state
   - Worker thread pool (configurable parallelism)
   - Pause/resume/cancel operations
   - CSV export of completed jobs

2. **Frontend (React)**
   - Batch page with queue visualization
   - Add/remove jobs from queue
   - Priority drag-and-drop reordering
   - Pause/resume buttons
   - Export queue to CSV
   - Real-time queue status updates

#### Success Criteria
- [ ] Queue 100 videos without performance degradation
- [ ] Process 3 videos in parallel (GPU + CPU work)
- [ ] Pause/resume preserves progress
- [ ] Queue persists across restarts
- [ ] CSV export includes all metadata

---

### Phase 9: Browser Automation & Anti-Detect (8h) - ⏳ PENDING
**Estimated Dates:** 2026-03-31
**Dependencies:** Phase 4
**Blocking:** Phase 10

#### Overview
Browser automation for proxy testing, account creation, and multi-account validation using chromiumoxide with anti-detection.

#### Key Tasks
1. **Backend (Rust)**
   - chromiumoxide integration (CDP)
   - Proxy rotation & detection bypass
   - Anti-fingerprinting headers
   - Account validation automation
   - Screenshot capture

2. **Frontend (React)**
   - Proxy settings page
   - Browser automation status monitor
   - Test proxy connection button

#### Success Criteria
- [ ] Open browser, navigate, interact via Rust command
- [ ] Proxy rotation working (verify IP changes)
- [ ] Anti-detect headers reduce fingerprinting risk
- [ ] Account validation automation works
- [ ] Performance acceptable (< 5s per test)

---

### Phase 10: Testing, Packaging & CI/CD (6h) - ⏳ PENDING
**Estimated Dates:** 2026-04-01 to 2026-04-02
**Dependencies:** All phases

#### Overview
Comprehensive testing, build optimization, installer creation, and CI/CD pipeline setup.

#### Key Tasks
1. **Testing**
   - Unit tests (React components + Rust services)
   - Integration tests (IPC commands)
   - End-to-end tests (full workflow)
   - Target coverage: 80%+

2. **Packaging**
   - Windows MSI installer
   - macOS DMG + universal binary
   - Code signing (Windows authenticode, macOS)
   - Auto-update mechanism

3. **CI/CD**
   - GitHub Actions workflow
   - Windows build (Visual Studio Build Tools)
   - macOS build (Xcode CLT)
   - Release automation

#### Success Criteria
- [ ] All unit tests pass (> 80% coverage)
- [ ] Windows installer < 50MB
- [ ] macOS DMG functional (arm64 + x86_64)
- [ ] CI/CD builds both platforms automatically
- [ ] Auto-update feature working
- [ ] Code signed (Windows) & notarized (macOS)

---

## Milestone Timeline

| Milestone | Target Date | Status | Progress |
|-----------|------------|--------|----------|
| **Phase 1-2:** UI Foundation | 2026-03-19 | ✅ COMPLETE | 100% |
| **Phase 3:** Video Generation | 2026-03-21 | ⏳ Next | 0% |
| **Phase 4:** Account Management | 2026-03-23 | ⏳ Blocked by P3 | 0% |
| **Phase 5-6:** Video Processing | 2026-03-25 | ⏳ Blocked by P3 | 0% |
| **Phase 7:** Drive Integration | 2026-03-28 | ⏳ Blocked by P4 | 0% |
| **Phase 8:** Batch Queue | 2026-03-30 | ⏳ Blocked by P3-7 | 0% |
| **Phase 9:** Browser Automation | 2026-03-31 | ⏳ Blocked by P4 | 0% |
| **Phase 10:** Testing & Release | 2026-04-02 | ⏳ Blocked by All | 0% |
| **v0.1.0 Release** | 2026-04-15 | ⏳ TBD | 0% |

---

## Known Risks & Mitigation

### Technical Risks
- **Gemini API Rate Limits:** May throttle batch jobs
  - *Mitigation:* Implement exponential backoff + queue throttling
- **Whisper Model Size:** 500MB+ can strain initial download
  - *Mitigation:* Lazy-load tiny model first, offer upgrades
- **GPU Memory Contention:** RealESRGAN + other GPU tasks
  - *Mitigation:* Add CPU fallback + memory monitoring

### Schedule Risks
- **Third-party API Changes:** Gemini or Drive API updates
  - *Mitigation:* Version lock dependencies, test against staging APIs
- **Unforeseen Bugs:** Particularly cross-platform (Windows/macOS)
  - *Mitigation:* Aggressive QA in Phase 10, early smoke tests

## Resource Allocation
- **Total Effort:** 80 hours
- **Frontend (React):** ~32 hours (40%)
- **Backend (Rust):** ~40 hours (50%)
- **DevOps/Testing:** ~8 hours (10%)

## Success Criteria for v0.1.0
1. ✅ All 10 phases complete
2. ✅ Feature parity with specification
3. ✅ > 80% test coverage
4. ✅ Windows + macOS builds functional and signed
5. ✅ Performance within targets (startup < 5s, video gen < 60s)
6. ✅ Security review passed (encryption, auth, CSP)
7. ✅ Documentation complete (API, user guide, deployment)

## Post-Launch Roadmap (v0.2+)
- Web UI companion (read-only dashboard)
- Mobile app (read-only status, notifications)
- Advanced scheduling (recurring batches, webhooks)
- Custom model fine-tuning
- Team collaboration features
