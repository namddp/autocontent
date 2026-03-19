/**
 * Sidecar Client — Spawns and communicates with puppeteer-sidecar via stdin/stdout JSON IPC
 * Manages lifecycle of the Node.js sidecar process for cookie capture and browser automation
 */
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;

/// Response from sidecar process
#[derive(Debug, Deserialize)]
pub struct SidecarResponse {
    pub success: bool,
    pub error: Option<String>,
    #[serde(flatten)]
    pub data: Value,
}

/// Cookie data returned from sidecar capture
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapturedCookie {
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub expires: Option<f64>,
    #[serde(rename = "httpOnly")]
    pub http_only: bool,
    pub secure: bool,
    #[serde(rename = "sameSite")]
    pub same_site: String,
}

/// Result of cookie capture operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureResult {
    pub cookies: Vec<CapturedCookie>,
    pub url: String,
}

/// Manages communication with the puppeteer sidecar process
pub struct SidecarClient {
    child: Arc<Mutex<Option<Child>>>,
    stdin: Arc<Mutex<Option<tokio::process::ChildStdin>>>,
    stdout: Arc<Mutex<Option<BufReader<tokio::process::ChildStdout>>>>,
}

impl SidecarClient {
    /// Spawn sidecar process from bundled binary or dev mode (node + script)
    pub async fn spawn(program: &str, args: &[&str]) -> Result<Self> {
        let mut child = Command::new(program)
            .args(args)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .kill_on_drop(true)
            .spawn()
            .map_err(|e| anyhow!("Failed to spawn sidecar '{}': {}", program, e))?;

        let stdin = child.stdin.take().ok_or_else(|| anyhow!("No stdin"))?;
        let stdout = child.stdout.take().ok_or_else(|| anyhow!("No stdout"))?;

        Ok(Self {
            child: Arc::new(Mutex::new(Some(child))),
            stdin: Arc::new(Mutex::new(Some(stdin))),
            stdout: Arc::new(Mutex::new(Some(BufReader::new(stdout)))),
        })
    }

    /// Send a JSON command and read the response
    async fn send_command(&self, cmd: &Value) -> Result<SidecarResponse> {
        let mut stdin_lock = self.stdin.lock().await;
        let stdin = stdin_lock.as_mut().ok_or_else(|| anyhow!("Sidecar stdin closed"))?;

        let mut line = serde_json::to_string(cmd)?;
        line.push('\n');
        stdin.write_all(line.as_bytes()).await?;
        stdin.flush().await?;
        drop(stdin_lock);

        let mut stdout_lock = self.stdout.lock().await;
        let stdout = stdout_lock.as_mut().ok_or_else(|| anyhow!("Sidecar stdout closed"))?;

        let mut response_line = String::new();
        let bytes_read = tokio::time::timeout(
            std::time::Duration::from_secs(600),
            stdout.read_line(&mut response_line),
        )
        .await
        .map_err(|_| anyhow!("Sidecar response timeout"))?
        .map_err(|e| anyhow!("Read error: {}", e))?;

        if bytes_read == 0 {
            return Err(anyhow!("Sidecar process closed unexpectedly"));
        }

        let resp: SidecarResponse = serde_json::from_str(response_line.trim())?;
        if !resp.success {
            return Err(anyhow!(resp.error.unwrap_or("Unknown sidecar error".into())));
        }

        Ok(resp)
    }

    /// Ping sidecar to check if alive
    pub async fn ping(&self) -> Result<bool> {
        let cmd = serde_json::json!({ "type": "ping" });
        let resp = self.send_command(&cmd).await?;
        Ok(resp.data.get("pong").and_then(|v| v.as_bool()).unwrap_or(false))
    }

    /// Launch interactive browser for Google Flow login and capture cookies
    pub async fn capture_cookies(
        &self,
        url: Option<&str>,
        chrome_path: Option<&str>,
        proxy_server: Option<&str>,
        timeout_ms: Option<u64>,
    ) -> Result<CaptureResult> {
        let cmd = serde_json::json!({
            "type": "capture-cookies",
            "url": url.unwrap_or("https://labs.google/fx/vi/tools/flow"),
            "chromePath": chrome_path,
            "headless": false,
            "proxyServer": proxy_server,
            "timeout": timeout_ms.unwrap_or(300_000),
        });

        let resp = self.send_command(&cmd).await?;
        let cookies: Vec<CapturedCookie> = serde_json::from_value(
            resp.data.get("cookies").cloned().unwrap_or(Value::Array(vec![])),
        )?;
        let url = resp.data.get("url").and_then(|v| v.as_str()).unwrap_or("").to_string();

        Ok(CaptureResult { cookies, url })
    }

    /// Validate existing cookies by loading Google Flow in headless mode
    pub async fn validate_cookies(
        &self,
        cookies: &[CapturedCookie],
        chrome_path: Option<&str>,
        proxy_server: Option<&str>,
    ) -> Result<bool> {
        let cmd = serde_json::json!({
            "type": "validate-cookies",
            "cookies": cookies,
            "chromePath": chrome_path,
            "proxyServer": proxy_server,
        });

        let resp = self.send_command(&cmd).await?;
        Ok(resp.data.get("valid").and_then(|v| v.as_bool()).unwrap_or(false))
    }

    /// Get randomized stealth/fingerprint config
    pub async fn get_stealth_config(&self) -> Result<Value> {
        let cmd = serde_json::json!({ "type": "get-stealth-config" });
        let resp = self.send_command(&cmd).await?;
        Ok(resp.data.get("config").cloned().unwrap_or(Value::Null))
    }

    /// Close the active browser in sidecar (keeps process alive)
    pub async fn close_browser(&self) -> Result<()> {
        let cmd = serde_json::json!({ "type": "close" });
        self.send_command(&cmd).await?;
        Ok(())
    }

    /// Kill the sidecar process
    pub async fn shutdown(&self) -> Result<()> {
        // Try graceful close first
        let _ = self.close_browser().await;

        // Drop stdin to signal EOF
        let mut stdin_lock = self.stdin.lock().await;
        *stdin_lock = None;
        drop(stdin_lock);

        // Wait for process to exit
        let mut child_lock = self.child.lock().await;
        if let Some(mut child) = child_lock.take() {
            let _ = tokio::time::timeout(
                std::time::Duration::from_secs(5),
                child.wait(),
            )
            .await;
        }

        Ok(())
    }
}

impl Drop for SidecarClient {
    fn drop(&mut self) {
        // Best-effort cleanup — can't async in Drop
        let child = self.child.clone();
        tokio::task::spawn(async move {
            let mut lock = child.lock().await;
            if let Some(mut c) = lock.take() {
                let _ = c.kill().await;
            }
        });
    }
}
