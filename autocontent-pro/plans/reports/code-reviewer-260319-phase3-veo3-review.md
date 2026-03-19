# Code Review Report — Phase 3: VEO3 API Integration

**Date:** 2026-03-19
**Reviewer:** code-reviewer agent
**Plan:** Phase 3 VEO3 API Integration

---

## Code Review Summary

### Scope
- Files reviewed: 12 (6 Rust, 6 React/TS)
- Lines of code analyzed: ~600 total
- Review focus: Phase 3 new files — VEO3 video generation pipeline

### Overall Assessment
Solid foundation. Code is clean, readable, and well-structured. No hardcoded secrets. The Tauri IPC pipeline is correct. Several medium/high issues around API key security, error propagation, timeout misconfigurations, and missing input validation need addressing before production.

---

## Critical Issues

### 1. API Key in URL query string — logs/network exposure
**File:** `src-tauri/src/services/gemini_client.rs` lines 39-42, 80-83, 131-134

API key appended as `?key=` query param in all three URLs (submit, poll, download). This means:
- Key appears in Tauri/OS network logs verbatim
- Any error message that includes the URL leaks the key
- `bail!("Gemini API error: {}", error_text)` on line 64 — if error_text echoes the request URL (some proxies do), key leaks to frontend

**Fix:** Use `Authorization: Bearer` header instead of query param:
```rust
let response = self.client
    .post(url_without_key)
    .header("x-goog-api-key", &self.api_key)  // or Authorization: Bearer
    .json(&body)
    .send()
    .await?;
```

### 2. poll_operation does NOT check HTTP status before deserializing
**File:** `src-tauri/src/services/gemini_client.rs` lines 95-98

```rust
// MISSING: if !response.status().is_success() { bail!(...) }
let op: GeminiOperationResponse = response.json().await ...
```
If the API returns 401/429/500, this will try to deserialize an error body into `GeminiOperationResponse`, likely producing an unhelpful "Failed to parse operation response" error masking the real HTTP error. Same pattern as submit (which correctly checks status) — poll is inconsistent.

**Fix:** Mirror the status check from `submit_generation`:
```rust
if !response.status().is_success() {
    let status = response.status();
    let error_text = response.text().await.unwrap_or_default();
    bail!("Poll failed ({}): {}", status, error_text);
}
```

---

## High Priority Findings

### 3. HTTP client timeout too short for video download
**File:** `src-tauri/src/services/gemini_client.rs` line 21

`Client::builder().timeout(Duration::from_secs(30))` — this timeout applies to the **entire** response including body. A generated video file (even a few seconds) can easily be >50MB. A 30s total-response timeout will kill legitimate downloads mid-stream.

**Fix:** Split timeout config — use `connect_timeout` + remove or raise `timeout` for the download step, or use a separate `Client` for download:
```rust
let client = Client::builder()
    .connect_timeout(Duration::from_secs(10))
    .timeout(Duration::from_secs(300))  // generous for large file download
    .build()?;
```

### 4. API key stored only in React `useState` — no persistence
**File:** `src/pages/video-generate-page.tsx` lines 15-52

API key lives in ephemeral component state. Every page refresh / app restart forces re-entry. The page text says "Stored locally only" but nothing actually stores it. The project already has `tauri-plugin-store` included — it should be used.

**Fix:** Persist to `tauri-plugin-store` under an encrypted or obfuscated key:
```ts
// On mount: load from store
// On change: save to store
import { load } from "@tauri-apps/plugin-store";
```

### 5. `download_video` — no response status check, no content-type validation
**File:** `src-tauri/src/services/gemini_client.rs` lines 137-155

`response.bytes()` is called without checking status. A 404 or rate-limit response will silently write the HTML error page as an `.mp4` file. Additionally no check that content-type is `video/*`.

**Fix:**
```rust
if !response.status().is_success() {
    bail!("Download failed ({})", response.status());
}
// optional: check content-type header
```

### 6. `duration_secs` incorrectly set in VideoResult
**File:** `src-tauri/src/commands/veo3.rs` line 121

```rust
duration_secs: duration as f64,  // just echoes the config param
```
This is the **requested** duration, not the actual duration of the generated file. The actual video duration should be read from the file metadata or from the API response. Misleading field name vs. value.

**Fix (pragmatic):** Either rename to `requested_duration_secs` or read actual metadata with a media crate. For Phase 3, renaming is sufficient.

---

## Medium Priority Improvements

### 7. Prompt not sanitized / length not validated
**File:** `src-tauri/src/commands/veo3.rs` lines 14-53 / `src/components/video/prompt-form.tsx`

No maximum length check on prompt before sending to API. Gemini API has prompt size limits; hitting them returns a raw API error propagated as raw JSON to the user. Frontend `PromptForm` has no `maxLength` attribute on the textarea.

**Fix:** Add `maxLength={2000}` to `<Textarea>` and validate server-side in Rust before the HTTP call:
```rust
if prompt.is_empty() { bail!("Prompt cannot be empty"); }
if prompt.len() > 2000 { bail!("Prompt exceeds 2000 character limit"); }
```

### 8. `veo3_list_history` stub — empty vector forever
**File:** `src-tauri/src/commands/veo3.rs` lines 127-130

Stub returns `vec![]` silently. This is fine as a Phase 3 placeholder but the frontend `VideoHistory` renders "No history yet" with no indication it's unimplemented. Consider a TODO comment and a `tracing::warn!` at startup if called before Phase 4.

### 9. `useVeo3Generation` event listener leaks on HMR
**File:** `src/hooks/use-veo3-generation.ts` lines 24-31

```ts
const unlisten = listen<GenerationProgress>("veo3:progress", (event) => {
  setProgress(event.payload);
});
return () => { unlisten.then((fn) => fn()); };
```
The unlisten is a `Promise`. If the component unmounts before the promise resolves (rare but possible), the event listener leaks. Safe pattern:

```ts
useEffect(() => {
  let cancelled = false;
  let unlisten: (() => void) | undefined;

  listen<GenerationProgress>("veo3:progress", (event) => {
    if (!cancelled) setProgress(event.payload);
  }).then((fn) => { unlisten = fn; });

  return () => {
    cancelled = true;
    unlisten?.();
  };
}, []);
```

### 10. `poll_operation` sleeps BEFORE first poll
**File:** `src-tauri/src/services/gemini_client.rs` line 86

`sleep(POLL_INTERVAL).await` is the FIRST statement in the loop body, adding a mandatory 3s delay on every run including attempt 0. For fast generations, you may want to check immediately then poll. Minor UX issue.

**Fix:** Sleep at end of loop or use `sleep` only when `attempt > 0`.

### 11. `VideoPreview` — `autoPlay` without `muted` blocked by browsers
**File:** `src/components/video/video-preview.tsx` line 35

`<video autoPlay loop>` without `muted` will be silently blocked by Chromium's autoplay policy (including Tauri's webview). The video won't autoplay. Add `muted` to guarantee autoplay works.

### 12. `GenerationProgress` persists after job completion with `completed` status
**File:** `src/pages/video-generate-page.tsx` lines 56-62

Progress is shown when `progress !== null`. In `use-veo3-generation.ts` line 55, `setProgress(null)` fires in `finally` — but the last emitted event sets `status: "completed"` and then immediately gets cleared by `finally`. This creates a race: the completed state may never visibly render. Consider clearing progress after a short delay or clearing it when a new job starts.

---

## Low Priority Suggestions

### 13. `VideoQuality` enum not used in API body
**File:** `src-tauri/src/services/gemini_client.rs` lines 44-52

`config.quality` is stored in `GenerationConfig` but not sent in the API request body. Gemini VEO3 likely has a quality/resolution parameter — check API docs. If not supported, remove `VideoQuality` (YAGNI).

### 14. `error_text` in submit could be huge
**File:** `src-tauri/src/services/gemini_client.rs` line 63

`response.text().await.unwrap_or_default()` for error response — no size limit. API error bodies are typically small, but consider `.take(4096)` equivalent to prevent huge strings in error messages.

### 15. `use-veo3-generation.ts` — `generate` not abortable
No cancellation mechanism. If a user clicks away or wants to cancel a 5-minute generation, there's no way to abort. Not critical for Phase 3 but note for backlog.

### 16. `Cargo.toml` — `chrono` dependency unused in reviewed files
`chrono` is declared but not imported in any reviewed file. May be for Phase 4 — fine, just flagging as potential dead dep.

---

## Positive Observations

- No hardcoded API keys anywhere — all user-provided at runtime
- `GeminiClient::new` properly validates HTTP client construction
- Tauri IPC command returns `Result<T, String>` — correct pattern
- `MAX_POLL_ATTEMPTS` constant is well-commented (~5 min)
- `convertFileSrc` used correctly for local file playback in Tauri
- File sizes all well under 200-line limit (largest is `gemini_client.rs` at 159 lines)
- `anyhow::Context` used consistently for error chain clarity
- `rustls-tls` feature selected (not native-tls) — good for cross-platform
- React components are clean, no prop-drilling issues
- `useVeo3Generation` hook well-separated from page component

---

## Recommended Actions

1. **[Critical]** Switch API key from query param to `x-goog-api-key` header in all three GeminiClient methods
2. **[Critical]** Add HTTP status check in `poll_operation` before deserializing
3. **[High]** Fix HTTP client timeout — separate connect vs. response-body timeout; raise to 300s for downloads
4. **[High]** Add HTTP status check in `download_video` before writing bytes
5. **[High]** Persist API key via `tauri-plugin-store` (already a dependency)
6. **[High]** Rename `duration_secs` to `requested_duration_secs` to avoid misleading semantics
7. **[Medium]** Add prompt length validation (frontend maxLength + Rust guard)
8. **[Medium]** Add `muted` to `<video autoPlay>` in VideoPreview
9. **[Medium]** Fix event listener cleanup race in `useVeo3Generation`
10. **[Medium]** Move `sleep` to end of poll loop (or skip on first attempt)
11. **[Low]** Investigate `VideoQuality` — either wire it to API param or remove it

---

## Metrics
- Type Coverage: Good — all Rust structs fully typed; TS interfaces match Rust output types
- Test Coverage: 0% (no tests in Phase 3 — expected for feature branch)
- Linting Issues: Could not run `cargo check` (no Bash access) — no syntax errors detected in manual review
- File Size Compliance: All files under 200 lines (max: gemini_client.rs at 159 lines)

---

## Unresolved Questions

1. Does the Gemini VEO3 API actually support `quality`/resolution parameters? `VideoQuality` is defined and wired in config but never sent in the request body — needs API doc verification.
2. Is `veo-3.1-generate` / `veo-3.1-generate-fast` the correct model name string for the current Gemini API? Should verify against Google AI Studio docs before Phase 3 ships.
3. The API endpoint used is `generateContent` — is this the correct endpoint for VEO3 async video generation, or should it be a dedicated video generation endpoint? The `GeminiGenerateResponse` only returns a `name` (operation name), which suggests a Long Running Operation pattern — verify the exact endpoint path.
