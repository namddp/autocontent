# AutoContent Pro - Code Standards & Conventions

## Overview
This document defines coding standards for AutoContent Pro (React 19 frontend + Rust backend). Adherence ensures consistency, maintainability, and cross-team collaboration.

## General Principles
- **DRY (Don't Repeat Yourself):** Extract reusable functions, components, utilities
- **KISS (Keep It Simple, Stupid):** Prefer clarity over cleverness
- **YAGNI (You Aren't Gonna Need It):** Implement only what's needed now
- **Type Safety:** Strict TypeScript; prefer explicit over implicit
- **Testing First:** Write tests alongside features, not after

## Frontend (React 19 + TypeScript)

### File Organization

#### File Naming
- **Components:** PascalCase (e.g., `StatCard.tsx`, `SidebarNavItem.tsx`)
- **Pages:** PascalCase (e.g., `Dashboard.tsx`, `VideoGenerate.tsx`)
- **Hooks:** `use-` prefix, kebab-case (e.g., `use-tauri.ts`, `use-sidebar.ts`)
- **Utils/Lib:** kebab-case (e.g., `api.ts`, `routes.ts`, `error-handler.ts`)
- **Styles:** kebab-case (e.g., `card-styles.css`)

#### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui (auto-generated)
│   ├── layout/          # Layout wrappers (sidebar, header)
│   ├── dashboard/       # Dashboard-specific components
│   ├── video-generate/  # Feature-specific components
│   ├── accounts/
│   ├── batch/
│   ├── shared/          # Cross-feature components
│   └── dialogs/
├── pages/               # Page components (route handlers)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities (non-hook)
├── App.tsx              # Root router
├── main.tsx             # React entry
└── index.css            # Global styles
```

### Component Standards

#### Functional Components Only
```typescript
// ✅ Good
export function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// ❌ Bad - class components
class StatCard extends React.Component { ... }
```

#### Props Interface Pattern
```typescript
interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;  // Optional marked with ?
  onUpdate?: (newValue: string) => void;
}

export function StatCard(props: StatCardProps) { ... }
// OR destructure:
export function StatCard({ title, value, icon: Icon, description }: StatCardProps) { ... }
```

#### Hooks Usage
```typescript
// ✅ Good - hooks at top level
function VideoList() {
  const videos = useFetchVideos();
  const [filter, setFilter] = useState("");

  return <div>{videos.map(v => ...)}</div>;
}

// ❌ Bad - conditional hooks
if (shouldFetch) {
  const videos = useFetchVideos();  // VIOLATION
}
```

#### Component Composition
```typescript
// ✅ Good - small, focused components
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("flex flex-col", collapsed ? "w-16" : "w-60")}>
      <Logo />
      <Navigation collapsed={collapsed} />
      <CollapseToggle onClick={() => setCollapsed(!collapsed)} />
    </aside>
  );
}

// ❌ Bad - monolithic component (>200 lines)
export function Sidebar() {
  // 300+ lines of HTML + logic
}
```

#### Error Handling
```typescript
// ✅ Good - explicit error boundaries
function VideoGeneratePage() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <VideoForm />
    </ErrorBoundary>
  );
}

// Try-catch for async operations
async function handleGenerate(prompt: string) {
  try {
    const result = await invoke<string>("video_generate", { prompt });
    return result;
  } catch (error) {
    console.error("Generation failed:", error);
    toast.error("Failed to generate video");
    throw error;  // Re-throw if caller needs to handle
  }
}
```

### Styling Standards

#### TailwindCSS + shadcn/ui
```typescript
// ✅ Good - Tailwind classes
<div className="flex items-center gap-3 px-4 py-2 rounded-md bg-card hover:bg-muted transition-colors">
  <Icon className="h-5 w-5" />
  <span className="text-sm font-medium">{label}</span>
</div>

// ✅ Good - cn() utility for conditional classes
<button className={cn(
  "px-4 py-2 rounded-md transition-colors",
  isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
)}>
  Click me
</button>

// ❌ Bad - inline styles
<div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>

// ❌ Bad - CSS modules (shadcn/ui uses Tailwind)
import styles from './card.module.css';
```

#### Dark Theme Variables
```css
/* index.css - CSS variables for theme */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --primary: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
  }
}

/* Usage in components */
className="bg-background text-foreground border-muted"
```

### State Management

#### Local State (useState)
```typescript
// ✅ Good - simple local state
function VideoList() {
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  const filtered = videos.filter(v => v.title.includes(filter));

  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <VideoGrid videos={filtered} />
    </>
  );
}
```

#### Custom Hooks
```typescript
// ✅ Good - extract reusable logic
function useFetchVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos()
      .then(setVideos)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { videos, loading, error };
}

// Usage
function VideoList() {
  const { videos, loading, error } = useFetchVideos();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  return <VideoGrid videos={videos} />;
}
```

#### Context API (Global State)
```typescript
// ✅ Good - theme context
interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

### API Integration (IPC)

#### Type-Safe IPC Wrappers
```typescript
// lib/api.ts
import { invoke } from "@tauri-apps/api/core";

export const api = {
  // Video commands
  videoGenerate: (prompt: string, accountId: string) =>
    invoke<{ videoId: string }>("video_generate", { prompt, account_id: accountId }),

  videoStatus: (videoId: string) =>
    invoke<VideoStatusResponse>("video_status", { video_id: videoId }),

  // Account commands
  accountList: () =>
    invoke<Account[]>("account_list", {}),

  accountAdd: (label: string, apiKey: string) =>
    invoke<Account>("account_add", { label, api_key: apiKey }),
};

// Usage in components
async function handleGenerate(prompt: string, accountId: string) {
  try {
    const { videoId } = await api.videoGenerate(prompt, accountId);
    // Type-safe: videoId is string
  } catch (error) {
    // Handle error
  }
}
```

### Testing Standards

#### Unit Tests (React Components)
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { StatCard } from "./stat-card";
import { Video } from "lucide-react";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Videos" value="42" icon={Video} />);

    expect(screen.getByText("Videos")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    render(
      <StatCard title="Queue" value="5" icon={Video} description="pending" />
    );

    expect(screen.getByText("pending")).toBeInTheDocument();
  });
});
```

## Backend (Rust)

### File Organization

#### File Naming
- Modules: snake_case (e.g., `gemini_service.rs`, `video_repo.rs`)
- Types: PascalCase (e.g., `struct Video`, `enum JobStatus`)
- Functions: snake_case (e.g., `generate_video()`, `add_account()`)

#### Directory Structure (Phase 2)
```
src-tauri/src/
├── main.rs                  # Entry, minimal code
├── lib.rs                   # Tauri builder, plugin init
├── commands/
│   ├── mod.rs               # Module exports
│   ├── video.rs             # Video commands (generate, status, etc)
│   ├── account.rs           # Account commands (add, list, etc)
│   └── queue.rs             # Queue commands
├── services/
│   ├── mod.rs
│   ├── gemini_service.rs    # VEO3 API integration
│   └── queue_service.rs     # Job scheduling
├── models/
│   ├── mod.rs
│   ├── video.rs             # Video struct + enums
│   └── response.rs          # API response types
└── error.rs                 # Error handling
```

### Command Standards

#### IPC Command Pattern
```rust
// ✅ Good - clear, type-safe, documented
/// Generate a new video using VEO3.
///
/// # Arguments
/// * `prompt` - Description of the video to generate
/// * `account_id` - ID of the account to use
///
/// # Returns
/// Video ID and initial status
#[tauri::command]
pub async fn video_generate(
    prompt: String,
    account_id: String,
    state: tauri::State<'_, AppState>,
) -> Result<VideoGenerateResponse, AppError> {
    let account = state.accounts.get(&account_id)
        .ok_or(AppError::AccountNotFound)?;

    let video_id = state.video_service.generate(prompt, account).await?;

    Ok(VideoGenerateResponse { video_id })
}

// ❌ Bad - unclear, partial implementation
#[tauri::command]
pub fn video_gen(p: String, a: String) -> String {
    // ... incomplete
}
```

#### Error Handling
```rust
// ✅ Good - custom error enum
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    #[error("Account not found: {0}")]
    AccountNotFound(String),

    #[error("API error: {0}")]
    ApiError(String),

    #[error("Database error: {0}")]
    DatabaseError(#[from] rusqlite::Error),
}

// ✅ Good - convert AppError to frontend
impl From<AppError> for tauri::InvokeError {
    fn from(error: AppError) -> Self {
        tauri::InvokeError::from(error.to_string())
    }
}

// Usage
#[tauri::command]
pub async fn account_get(id: String) -> Result<Account, AppError> {
    db::get_account(&id).map_err(|e| AppError::DatabaseError(e))
}
```

### Async/Await Standards

#### Tokio Tasks
```rust
// ✅ Good - use tokio::spawn for concurrent work
pub async fn process_queue(state: AppState) {
    tokio::spawn(async move {
        loop {
            match state.queue_service.process_next().await {
                Ok(_) => {},
                Err(e) => eprintln!("Queue error: {}", e),
            }
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    });
}

// ✅ Good - use tokio::task::spawn_blocking for CPU-bound work
pub async fn upscale_video(video_path: PathBuf) -> Result<PathBuf> {
    tokio::task::spawn_blocking(move || {
        // CPU-intensive RealESRGAN operation
        process_realesrgan(&video_path)
    })
    .await?
}
```

### Struct & Type Standards

#### Data Models
```rust
// ✅ Good - derive common traits, serde for JSON
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Video {
    pub id: String,
    pub prompt: String,
    pub status: VideoStatus,
    pub video_url: Option<String>,
    pub created_at: i64,
    pub account_id: String,
}

#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
pub enum VideoStatus {
    #[serde(rename = "generating")]
    Generating,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
}

// ✅ Good - builder pattern for complex types
pub struct VideoProcessOptions {
    pub upscale: bool,
    pub add_subtitle: bool,
    pub subtitle_lang: String,
}

impl VideoProcessOptions {
    pub fn new() -> Self {
        Self {
            upscale: false,
            add_subtitle: false,
            subtitle_lang: "en".to_string(),
        }
    }

    pub fn with_upscale(mut self, enabled: bool) -> Self {
        self.upscale = enabled;
        self
    }
}
```

### Testing Standards

#### Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_video_status_serialization() {
        let status = VideoStatus::Generating;
        let json = serde_json::to_string(&status).unwrap();
        assert_eq!(json, r#""generating""#);
    }

    #[tokio::test]
    async fn test_gemini_service_generation() {
        let service = GeminiService::new("test-key".to_string());
        let result = service.generate("test prompt").await;

        assert!(result.is_ok());
        assert!(!result.unwrap().is_empty());
    }
}
```

## Cross-Platform Standards

### Naming Conventions Table

| Language | Type | Convention | Example |
|----------|------|-----------|---------|
| TypeScript | File | kebab-case | `use-tauri.ts`, `stat-card.tsx` |
| TypeScript | Component | PascalCase | `StatCard`, `AppLayout` |
| TypeScript | Function/Hook | camelCase (hook: use-) | `fetchVideos()`, `use-sidebar.ts` |
| TypeScript | Constant | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_TIMEOUT` |
| Rust | File | snake_case | `gemini_service.rs` |
| Rust | Struct/Enum | PascalCase | `Video`, `VideoStatus` |
| Rust | Function | snake_case | `generate_video()` |
| Rust | Constant | UPPER_SNAKE_CASE | `MAX_QUEUE_SIZE` |

### Type Safety

#### TypeScript Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true
  }
}
```

#### Avoid `any` Type
```typescript
// ❌ Bad
function handleResponse(data: any) { ... }

// ✅ Good
interface ApiResponse {
  status: string;
  data: Video[];
}
function handleResponse(data: ApiResponse) { ... }
```

### Documentation Standards

#### Frontend JSDoc
```typescript
/**
 * Displays a statistic card with title, value, and icon.
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Videos Generated"
 *   value="42"
 *   icon={Video}
 *   description="This month"
 * />
 * ```
 */
export function StatCard({ title, value, icon: Icon, description }: StatCardProps) { ... }
```

#### Rust Doc Comments
```rust
/// Generates a new video using the VEO3 API.
///
/// # Arguments
/// * `prompt` - Description of desired video
/// * `account` - Account with valid API key
///
/// # Returns
/// Video ID of generated video
///
/// # Errors
/// Returns error if API fails or account invalid
pub async fn generate_video(prompt: String, account: &Account) -> Result<String> { ... }
```

## Performance Optimization

### Frontend Optimization Checklist
- [ ] Memoize expensive components: `useMemo()`, `useCallback()`
- [ ] Lazy-load routes: `React.lazy()` + `Suspense`
- [ ] Optimize images: WebP, responsive sizes
- [ ] Monitor bundle size: target < 86KB gzipped
- [ ] Minimize re-renders: use `React.memo()` strategically

### Backend Optimization
- [ ] Use async/await, avoid blocking operations
- [ ] Index database queries
- [ ] Cache API responses (Google Drive token)
- [ ] Connection pooling for SQLite
- [ ] Batch operations where possible

## Security Guidelines

### Frontend
- Sanitize user inputs before sending to backend
- Never expose API keys in frontend code (all in Rust backend)
- Use HTTPS for all external requests
- Validate response types

### Backend
- Encrypt sensitive data at rest (credentials, API keys)
- Rate-limit IPC commands (100/min per command)
- Validate all inputs (prompt length, file size, etc)
- Log sensitive operations (account changes)
- Never log plaintext credentials
