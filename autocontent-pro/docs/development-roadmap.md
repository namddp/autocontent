# Development Roadmap - AutoContent Pro

**Version:** 0.15.0 SuperVeo Refactor Complete
**Last Updated:** March 19, 2026
**Status:** All 15 phases complete (10 MVP + 5 SuperVeo). Ready for advanced features.

## MVP Completion Summary

| Phase | Milestone | Target | Actual | Status |
|-------|-----------|--------|--------|--------|
| 1 | Project Setup | Mar 10 | Mar 10 | ✅ Complete |
| 2 | Core UI (7 pages) | Mar 11 | Mar 11 | ✅ Complete |
| 3 | VEO3 Integration | Mar 12 | Mar 12 | ✅ Complete |
| 4 | Account Management | Mar 13 | Mar 13 | ✅ Complete |
| 5 | Video Processing | Mar 14 | Mar 14 | ✅ Complete |
| 6 | Subtitle Generation | Mar 15 | Mar 15 | ✅ Complete |
| 7 | Google Drive | Mar 16 | Mar 16 | ✅ Complete |
| 8 | Batch Processing | Mar 17 | Mar 17 | ✅ Complete |
| 9 | Browser Automation | Mar 18 | Mar 18 | ✅ Complete |
| 10 | Testing & CI/CD | Mar 19 | Mar 19 | ✅ Complete |
| 11 | Puppeteer Sidecar + Cookie Auth | Mar 19 | Mar 19 | ✅ Complete |
| 12 | VEO3 Multi-Mode Generation | Mar 19 | Mar 19 | ✅ Complete |
| 13 | Enhanced Anti-Detect | Mar 19 | Mar 19 | ✅ Complete |
| 14 | Rotating Proxy APIs | Mar 19 | Mar 19 | ✅ Complete |
| 15 | Account Management Overhaul | Mar 19 | Mar 19 | ✅ Complete |

**MVP Completion Rate:** 100% (10/10 phases) - Mar 19
**SuperVeo Refactor Rate:** 100% (5/5 phases) - Mar 19
**Overall Test Coverage:** 25+ unit tests, all passing
**Total Compilation:** Clean, zero TypeScript errors
**Release Ready:** Yes (GitHub Actions CI/CD configured)

---

## SuperVeo Integration (v0.11-0.15)

Phases 11-15 implement SuperVeo-style features for cookie-based authentication, multi-mode video generation, enhanced anti-detection, and rotating proxy APIs.

### Phase 11: Puppeteer Sidecar + Cookie Auth (Complete - Mar 19)

**Objective:** Replace chromiumoxide with Node.js Puppeteer sidecar for interactive Google Flow login.

#### Deliverables
- Puppeteer sidecar bundled via `pkg` for all platforms
- stdin/stdout JSON IPC communication layer
- Interactive cookie capture with stealth plugin applied
- Cookie encryption + secure storage
- Tauri `shell` plugin integration with `externalBin` config

#### Key Components
- `puppeteer-sidecar/src/index.js` — IPC entry point
- `puppeteer-sidecar/src/cookie-capture.js` — Interactive browser login
- `src-tauri/src/services/sidecar_client.rs` — Rust sidecar orchestrator
- `src-tauri/src/commands/cookies.rs` — Tauri cookie capture/validation commands
- `src/components/accounts/cookie-capture-dialog.tsx` — UI for login flow

#### Status: COMPLETE ✅
- Sidecar project structure created
- Cookie capture flow implemented and tested
- Cookie validation working with expiry detection
- Binaries built for Windows, macOS, Linux
- Tauri integration complete

---

### Phase 12: VEO3 Multi-Mode Generation (Complete - Mar 19)

**Objective:** Extend VEO3 from text-only to 3 generation modes (T2V, I2V, Clone).

#### Deliverables
- VideoGenerationType enum supporting 3 modes
- Image upload handler with base64 encoding
- Extended Gemini API client methods for I2V and Clone modes
- Image preview components with drag-drop support
- Mode selector UI with conditional image uploads

#### Key Components
- `src-tauri/src/services/image-upload-handler.rs` — File reading + validation
- `src-tauri/src/models/video_job.rs` — VideoGenerationType enum
- `src/components/video/image-upload-dropzone.tsx` — Image picker UI
- `src/components/video/generation-mode-selector.tsx` — Mode tabs
- Extended `gemini_client.rs` with `submit_image_to_video()` and `submit_clone_video()`

#### Status: COMPLETE ✅
- All 3 generation modes functional (T2V, I2V, Clone)
- Image validation < 20MB per file
- JPEG, PNG, WebP formats supported
- Base64 encoding in Rust (not frontend)
- UI shows active mode with image previews

---

### Phase 13: Enhanced Anti-Detect & Fingerprinting (Complete - Mar 19)

**Objective:** Implement comprehensive fingerprinting with stealth plugin in Puppeteer sidecar.

#### Deliverables
- Fingerprint generator with deterministic PRNG from seed
- Fingerprint injector for page context (WebGL, Canvas, UA, screen)
- puppeteer-extra stealth plugin integrated with custom overrides
- Per-account fingerprint persistence
- User-Agent rotation with realistic Chrome profiles

#### Key Components
- `puppeteer-sidecar/src/fingerprint-generator.js` — Deterministic fingerprint generation
- `puppeteer-sidecar/src/fingerprint-injector.js` — Page-level overrides
- `src-tauri/src/models/account.rs` — fingerprint_seed field added
- `src-tauri/src/services/sidecar_client.rs` — Fingerprint config in launch IPC

#### Status: COMPLETE ✅
- Stealth plugin active on all sidecar browser instances
- Same account always presents identical fingerprint
- Different accounts show distinct fingerprints
- No `navigator.webdriver` detectable
- WebGL/Canvas spoofing implemented

---

### Phase 14: Rotating Proxy API Integration (Complete - Mar 19)

**Objective:** Replace static proxy list with dynamic API-based rotation (KiotProxy + ProxyXoay).

#### Deliverables
- ProxyManager with TTL tracking and auto-rotation
- KiotProxy REST API client integration
- ProxyXoay fallback provider
- Health check (TCP connect validation)
- Proxy settings UI with provider selection

#### Key Components
- `src-tauri/src/services/proxy_api_client.rs` — API clients
- `src-tauri/src/services/proxy.rs` — ProxyManager with TTL logic
- `src-tauri/src/models/browser.rs` — ProxyProvider enum, ActiveProxy struct
- `src/components/settings/proxy-settings-panel.tsx` — Settings UI

#### Status: COMPLETE ✅
- Proxies fetched on-demand from APIs
- TTL tracking with auto-expiry
- Health check before use (5s timeout)
- Settings allow easy provider switching
- Fallback to direct if no proxy configured

---

### Phase 15: Account Management Overhaul (Complete - Mar 19)

**Objective:** Implement dual-credential model (Gemini API key + Google Flow cookies) with fingerprinting.

#### Deliverables
- Account model updated with cookie storage + fingerprint_seed
- Cookie status tracking (valid/expired/unknown)
- Multi-account rotation in batch processing
- Account card UI with cookie status badges
- Cookie validation commands with auto-refresh prompts

#### Key Components
- `src-tauri/src/services/account_manager.rs` — Account lifecycle management
- `src-tauri/src/models/account.rs` — CookieStatus enum, fingerprint_seed field
- `src/components/accounts/account-card-with-cookie-status.tsx` — Status UI
- Batch processor multi-account round-robin rotation

#### Status: COMPLETE ✅
- Accounts store both API key and cookies
- Cookie status accurately reflects freshness
- Batch processing rotates through valid accounts
- Expired accounts skipped with notification
- All credentials encrypted at rest (AES-256-GCM)

---

## Post-SuperVeo Roadmap (v1.x+)

### Phase 16: Stability & Performance Optimization (Planned Q2 2026)

**Objective:** Production hardening, performance tuning, edge case handling

#### Focus Areas
- **Performance Metrics:**
  - Reduce video generation wait time (target: < 45s for VEO3)
  - Optimize batch processing throughput (target: 10+ jobs/hour)
  - Memory usage optimization for large batch queues
  - Upscaler performance (GPU vs CPU benchmarking)

- **Reliability:**
  - Enhanced error recovery for network interruptions
  - Automatic retry for transient API failures
  - Graceful degradation when services unavailable
  - Dead letter queue for permanently failed jobs

- **Testing:**
  - Integration tests with real APIs (test accounts)
  - Load testing for batch processing (100+ jobs)
  - Stress testing for concurrent uploads
  - End-to-end workflow automation tests

#### Deliverables
- Performance benchmarks document
- Reliability matrix (SLA targets)
- Updated test suite (50+ tests)
- Monitoring/metrics dashboard

---

### Phase 17: Advanced Video Editing (Planned Q2 2026)

**Objective:** In-app video composition and editing capabilities

#### Features
- **Timeline Editor:**
  - Multi-clip editing
  - Trim/split/merge functionality
  - Transition effects (fade, wipe, crossfade)
  - Speed control and time stretching

- **Text & Graphics:**
  - Text overlay with positioning and styling
  - Logo/watermark insertion
  - Motion graphics templates
  - Dynamic subtitle positioning

- **Audio Processing:**
  - Background music mixing
  - Voiceover recording
  - Audio level normalization
  - Multi-track audio support

- **Export Options:**
  - Multiple resolution targets (720p, 1080p, 4K)
  - Format selection (MP4, WebM, HLS)
  - Platform presets (YouTube, TikTok, Instagram)

#### Technical Details
- New FFmpeg-based editing backend
- React component library for timeline UI
- Real-time preview rendering
- Hardware acceleration (GPU rendering)

#### Deliverables
- Timeline editor UI (React components)
- FFmpeg composition filter graphs
- Video composition service (Rust)
- Export profiles and templates

---

### Phase 18: Multi-Language Subtitle Support (Planned Q3 2026)

**Objective:** Generate and manage subtitles in multiple languages

#### Features
- **Language Support:**
  - Transcription in 10+ languages
  - Automatic language detection
  - Subtitle translation via Google Translate API
  - Dual-subtitle support (original + translated)

- **Subtitle Management:**
  - Edit and correct transcriptions
  - Custom subtitle styling (font, color, size)
  - Subtitle synchronization/timing adjustment
  - Batch subtitle operations

- **Quality Control:**
  - Confidence scoring per segment
  - Review workflow for translations
  - Dictionary/glossary for consistent terminology
  - Human review queue

#### Architecture
- Extend Whisper.cpp to support language parameters
- Google Cloud Translation API integration
- Subtitle editing UI in Video Generate page
- Batch subtitle processing

#### Deliverables
- Multi-language transcription service
- Subtitle editor component
- Translation management UI
- Language pack system

---

### Phase 19: Batch Export & Distribution (Planned Q3 2026)

**Objective:** Export batches in multiple formats and platforms

#### Features
- **Export Formats:**
  - MP4 (H.264, H.265, AV1)
  - WebM (VP9)
  - HLS streaming format
  - GIF animation format
  - Custom bitrate/resolution profiles

- **Platform Integration:**
  - YouTube upload with metadata
  - TikTok upload with hashtag generation
  - Instagram Reels format optimization
  - LinkedIn video format
  - Custom SFTP upload

- **Metadata Management:**
  - Title, description, tags per video
  - Thumbnail generation (first frame or custom)
  - Analytics tracking setup (UTM parameters)
  - Social media metadata (OpenGraph, Twitter Card)

- **Scheduling:**
  - Scheduled batch publishing
  - Social media calendar integration
  - Timezone-aware scheduling
  - Multi-platform simultaneous upload

#### Technical Details
- New export service with format plugins
- Platform-specific metadata formatters
- Scheduling service with cron support
- Analytics event tracking

#### Deliverables
- Export profiles and templates
- Platform integration modules
- Scheduling UI component
- Analytics integration

---

### Phase 20: AI Prompt Enhancement (Planned Q4 2026)

**Objective:** Smart prompt suggestion and optimization

#### Features
- **Prompt Templates:**
  - Industry-specific templates (marketing, education, entertainment)
  - Style presets (cinematic, documentary, animation, etc.)
  - Trend-based prompts (viral content patterns)
  - User prompt history and favorites

- **Prompt Optimization:**
  - AI suggestion for prompt improvement (via Gemini)
  - Keyword extraction and enhancement
  - Style consistency checking
  - Length and clarity optimization

- **Advanced Generation:**
  - Multi-video scene composition
  - Character consistency across videos
  - Narrative flow optimization
  - Brand voice guidelines injection

#### Architecture
- Gemini API for prompt analysis and suggestions
- Prompt template database
- Prompt optimization pipeline
- A/B testing framework for prompt effectiveness

#### Deliverables
- Prompt suggestion service
- Template library with search
- Prompt editor with AI assistance
- Performance metrics tracking

---

### Phase 21: Cloud Sync & Collaboration (Planned Q4 2026)

**Objective:** Multi-device sync and team collaboration

#### Features
- **Cloud Sync:**
  - Account settings synchronization
  - Video history cross-device
  - Batch processing across devices
  - Conflict resolution for simultaneous edits

- **Collaboration:**
  - Team account management
  - Role-based access (Owner, Editor, Viewer)
  - Comment/feedback on videos
  - Version control for batches
  - Activity log and audit trail

- **Sharing:**
  - Generate shareable links for video previews
  - Batch sharing with expiration
  - Download/offline access control
  - Watermarking for shared previews

#### Architecture
- Backend API (Node.js/Rust)
- Database schema for users, teams, permissions
- Real-time sync using WebSocket
- Encryption for sensitive data

#### Deliverables
- Cloud API endpoints
- Real-time sync service
- Collaboration UI components
- Team management dashboard

---

### Phase 22: Advanced Analytics & Reporting (Planned 2027)

**Objective:** Insights into video performance and usage patterns

#### Features
- **Usage Analytics:**
  - Video generation frequency and trends
  - Average processing times by resolution/format
  - API quota usage and costs
  - Storage usage and quota
  - Batch processing efficiency

- **Performance Reporting:**
  - Video quality metrics (bitrate, codec, resolution)
  - Upscaler effectiveness (before/after comparison)
  - Transcription accuracy scores
  - Drive upload success rates
  - Batch job success rates

- **Business Insights:**
  - Most popular prompts/templates
  - Processing time trends
  - Cost analysis (API spend, storage)
  - Performance dashboards and reports
  - Export to CSV/PDF

#### Architecture
- Analytics event tracking in all services
- Time-series database (InfluxDB or similar)
- Dashboard UI (React + charting library)
- Report generation service

#### Deliverables
- Analytics service
- Dashboard UI
- Report generation API
- Metrics visualization components

---

### Phase 23: Enterprise Features (Planned 2027)

**Objective:** Organization and security enhancements

#### Features
- **Organization Management:**
  - Multiple organizations per user
  - Organization admin controls
  - Department/team hierarchies
  - Resource quotas per organization

- **Security Enhancements:**
  - Single Sign-On (SAML, OAuth)
  - IP whitelisting
  - Audit logging
  - Data encryption at rest and in transit
  - Compliance certifications (SOC2, GDPR)

- **Advanced Controls:**
  - Watermark enforcement
  - Output format restrictions
  - API rate limiting per user/org
  - Usage quotas and billing tiers

#### Architecture
- Enhanced authentication system
- Organization data isolation
- Audit logging service
- Billing and metering system

#### Deliverables
- Organization management UI
- SSO integration
- Audit logging dashboard
- Billing system

---

### Phase 24: Plugin & Extension System (Planned 2027)

**Objective:** Extensibility for custom workflows and integrations

#### Features
- **Plugin Architecture:**
  - Custom command plugins
  - Service integration plugins
  - Video effect plugins
  - Export format plugins

- **Plugin Marketplace:**
  - Community plugin sharing
  - Versioning and updates
  - Plugin reviews and ratings
  - Revenue sharing for premium plugins

- **Developer Tools:**
  - Plugin SDK (Rust + TypeScript)
  - Plugin testing framework
  - Documentation and examples
  - Developer community forum

#### Architecture
- Plugin loader and registry
- Sandbox environment for plugin execution
- Plugin API contracts
- Plugin update service

#### Deliverables
- Plugin SDK and templates
- Plugin marketplace
- Developer documentation
- Plugin examples

---

## Release Timeline

```
2026 Q1: MVP Complete (v0.10.0) ✅ [Mar 19]
  - Phases 1-10: Core platform, video generation, batch processing

2026 Q1: SuperVeo Refactor (v0.15.0) ✅ [Mar 19]
  - Phase 11: Puppeteer Sidecar + Cookie Auth
  - Phase 12: VEO3 Multi-Mode Generation (T2V/I2V/Clone)
  - Phase 13: Enhanced Anti-Detect & Fingerprinting
  - Phase 14: Rotating Proxy API Integration (KiotProxy/ProxyXoay)
  - Phase 15: Account Management Overhaul (Dual Credentials)

2026 Q2: Stability & Advanced Features (v1.0-1.2)
  - Phase 16: Performance Optimization
  - Phase 17: Advanced Video Editing
  - Phase 18: Multi-Language Subtitles

2026 Q3: Distribution & Enhancement (v1.3-1.5)
  - Phase 19: Batch Export & Distribution
  - Phase 20: AI Prompt Optimization

2026 Q4: Cloud & Collaboration (v2.0)
  - Phase 21: Cloud Sync & Team Collaboration

2027 H1: Analytics & Enterprise (v2.1-2.3)
  - Phase 22: Analytics & Reporting
  - Phase 23: Enterprise Features

2027 H2: Ecosystem (v3.0+)
  - Phase 24: Plugin System
```

---

## Success Metrics

### MVP (v0.10.0)
- ✅ All 10 phases complete on schedule
- ✅ 25+ unit tests passing
- ✅ CI/CD pipeline operational
- ✅ Desktop installers working (Windows, macOS, Linux)
- ✅ Core workflows tested end-to-end

### v1.0 (Q2 2026)
- Target: < 30s average video generation time
- Target: 50+ passing tests
- Target: Zero critical security vulnerabilities
- Target: Batch processing 10+ jobs/hour
- Target: 99% uptime on external API calls

### v2.0+ (2027+)
- Desktop adoption (Windows + macOS)
- Team collaboration features
- Enterprise customer acquisition
- Plugin ecosystem growth

---

## Known Limitations & Technical Debt

### Current Limitations
- Desktop only (Windows + macOS), no mobile planned
- No cloud synchronization (local device only)
- Single-device operation
- Limited video editing capabilities
- No team collaboration features
- No analytics/reporting

### Technical Debt
- Browser automation tested on Windows only (needs macOS/Linux validation)
- Whisper.cpp binary size large (~1GB) - potential distribution issue
- RealESRGAN model (~350MB) - lazy loading but still significant
- Limited error messages for end users (needs UX improvement)
- No comprehensive logging (affects debugging)

### Planned Debt Reduction
- Phase 11: Performance optimization and refactoring
- Phase 12: UI/UX overhaul
- Ongoing: Security audits and dependency updates

---

## Dependencies & Constraints

### External Service Constraints
- **Google Gemini API:** Rate limiting (depends on quota)
- **Google Drive API:** Storage quota limits, API quota
- **FFmpeg:** Performance depends on system CPU/GPU
- **Whisper.cpp:** Performance depends on system resources
- **RealESRGAN:** GPU optional but recommended

### Hardware Requirements (Minimum)
- CPU: Intel i5 or equivalent
- RAM: 8GB (16GB recommended for batch processing)
- GPU: Optional (NVIDIA/AMD for upscaling acceleration)
- Storage: 10GB free (for models and temp files)

### Operating Systems
- Windows 10+ (primary)
- macOS 10.15+ (secondary)
- Linux (AppImage) (tertiary)

---

## Community Feedback & Requests

Open issues tracked in GitHub Issues:
- Advanced subtitle editing
- Batch export to multiple platforms
- Plugin system
- Team collaboration

Refer to `./docs/system-architecture.md` for current implementation details and `./docs/project-changelog.md` for version history.
