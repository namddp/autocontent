use serde::{Deserialize, Serialize};
use tauri::command;

use crate::services::sidecar_client::{CapturedCookie, SidecarClient};

/// Request payload for cookie capture
#[derive(Debug, Deserialize)]
pub struct CaptureRequest {
    pub chrome_path: Option<String>,
    pub proxy_server: Option<String>,
    pub timeout_ms: Option<u64>,
}

/// Response from cookie capture
#[derive(Debug, Serialize)]
pub struct CaptureResponse {
    pub cookies: Vec<CapturedCookie>,
    pub url: String,
    pub count: usize,
}

/// Spawn sidecar client using resolved path
async fn spawn_sidecar() -> Result<SidecarClient, String> {
    let (program, script) = resolve_sidecar_path()?;
    let args: Vec<&str> = match &script {
        Some(s) => vec![s.as_str()],
        None => vec![],
    };
    SidecarClient::spawn(&program, &args)
        .await
        .map_err(|e| format!("Failed to start sidecar: {}", e))
}

/// Run an operation with a sidecar, ensuring shutdown on both success and error
async fn with_sidecar<F, Fut, T>(op: F) -> Result<T, String>
where
    F: FnOnce(SidecarClient) -> Fut,
    Fut: std::future::Future<Output = Result<T, String>>,
{
    let client = spawn_sidecar().await?;
    let result = op(client).await;
    // Note: SidecarClient::Drop handles kill_on_drop cleanup
    result
}

/// Launch interactive browser for Google Flow login, capture cookies
#[command]
pub async fn cookie_capture(request: CaptureRequest) -> Result<CaptureResponse, String> {
    with_sidecar(|client| async move {
        let result = client
            .capture_cookies(
                None,
                request.chrome_path.as_deref(),
                request.proxy_server.as_deref(),
                request.timeout_ms,
            )
            .await
            .map_err(|e| format!("Cookie capture failed: {}", e))?;

        let count = result.cookies.len();
        let _ = client.shutdown().await;

        Ok(CaptureResponse {
            cookies: result.cookies,
            url: result.url,
            count,
        })
    })
    .await
}

/// Validate existing cookies (headless check)
#[command]
pub async fn cookie_validate(
    cookies: Vec<CapturedCookie>,
    chrome_path: Option<String>,
    proxy_server: Option<String>,
) -> Result<bool, String> {
    with_sidecar(|client| async move {
        let valid = client
            .validate_cookies(&cookies, chrome_path.as_deref(), proxy_server.as_deref())
            .await
            .map_err(|e| format!("Cookie validation failed: {}", e))?;

        let _ = client.shutdown().await;
        Ok(valid)
    })
    .await
}

/// Ping sidecar to verify it can start
#[command]
pub async fn cookie_sidecar_health() -> Result<bool, String> {
    with_sidecar(|client| async move {
        let alive = client.ping().await.unwrap_or(false);
        let _ = client.shutdown().await;
        Ok(alive)
    })
    .await
}

/// Resolve sidecar binary path (prod) or node + script (dev)
/// Returns (program, optional_script_arg)
fn resolve_sidecar_path() -> Result<(String, Option<String>), String> {
    let exe_dir = std::env::current_exe()
        .map_err(|e| format!("Cannot find exe dir: {}", e))?
        .parent()
        .ok_or("Cannot get exe parent dir")?
        .to_path_buf();

    #[cfg(target_os = "windows")]
    let sidecar_name = "puppeteer-sidecar-x86_64-pc-windows-msvc.exe";
    #[cfg(target_os = "macos")]
    let sidecar_name = if cfg!(target_arch = "aarch64") {
        "puppeteer-sidecar-aarch64-apple-darwin"
    } else {
        "puppeteer-sidecar-x86_64-apple-darwin"
    };
    #[cfg(target_os = "linux")]
    let sidecar_name = "puppeteer-sidecar-x86_64-unknown-linux-gnu";

    let sidecar_path = exe_dir.join(sidecar_name);

    if sidecar_path.exists() {
        return Ok((sidecar_path.to_string_lossy().to_string(), None));
    }

    // Dev mode fallback: run via node
    let dev_path = std::env::current_dir()
        .map_err(|e| format!("Cannot get cwd: {}", e))?
        .join("../puppeteer-sidecar/src/index.js");

    if dev_path.exists() {
        Ok(("node".to_string(), Some(dev_path.to_string_lossy().to_string())))
    } else {
        Err(format!(
            "Sidecar not found at '{}' or dev fallback '{}'",
            sidecar_path.display(),
            dev_path.display()
        ))
    }
}
