use anyhow::{Context, Result};
use chromiumoxide::browser::{Browser, BrowserConfig as CdpBrowserConfig};
use chromiumoxide::Page;
use futures::StreamExt;
use std::sync::Arc;

use crate::models::browser::{BrowserConfig, CookieData, ProxyProtocol};
use crate::services::proxy::random_user_agent;

/// Manages Chrome browser lifecycle via CDP (Chrome DevTools Protocol)
pub struct BrowserManager {
    browser: Option<Arc<Browser>>,
    config: BrowserConfig,
}

impl BrowserManager {
    pub fn new(config: BrowserConfig) -> Self {
        Self {
            browser: None,
            config,
        }
    }

    /// Launch Chrome with CDP connection
    pub async fn launch(&mut self) -> Result<()> {
        let mut builder = CdpBrowserConfig::builder();

        // Set proxy if configured
        if let Some(ref proxy) = self.config.proxy {
            let proxy_str = format!(
                "{}://{}:{}",
                match proxy.protocol {
                    ProxyProtocol::Http => "http",
                    ProxyProtocol::Https => "https",
                    ProxyProtocol::Socks5 => "socks5",
                },
                proxy.host,
                proxy.port,
            );
            builder = builder.arg(format!("--proxy-server={}", proxy_str));
        }

        // Set user agent (custom or random)
        let ua = self
            .config
            .user_agent
            .clone()
            .unwrap_or_else(random_user_agent);
        builder = builder.arg(format!("--user-agent={}", ua));

        // Set window size
        builder = builder.window_size(self.config.window_width, self.config.window_height);

        // Custom Chrome path
        if let Some(ref path) = self.config.chrome_path {
            builder = builder.chrome_executable(path);
        }

        let config = builder
            .build()
            .map_err(|e| anyhow::anyhow!("Failed to build browser config: {:?}", e))?;

        let (browser, mut handler) = Browser::launch(config)
            .await
            .context("Failed to launch Chrome")?;

        // Spawn CDP event handler in background
        tokio::spawn(async move {
            while let Some(_event) = handler.next().await {}
        });

        self.browser = Some(Arc::new(browser));
        Ok(())
    }

    /// Create new page with stealth scripts injected before navigation
    pub async fn new_stealth_page(&self, url: &str) -> Result<Page> {
        let browser = self.browser.as_ref().context("Browser not launched")?;

        let page = browser
            .new_page("about:blank")
            .await
            .context("Failed to create page")?;

        // Inject anti-detection scripts BEFORE navigation
        self.apply_stealth_scripts(&page).await?;

        // Navigate to target URL
        page.goto(url).await.context("Failed to navigate")?;

        Ok(page)
    }

    /// Register stealth scripts via CDP Page.addScriptToEvaluateOnNewDocument
    /// so they persist across navigations (not just current JS context)
    async fn apply_stealth_scripts(&self, page: &Page) -> Result<()> {
        use chromiumoxide::cdp::browser_protocol::page::AddScriptToEvaluateOnNewDocumentParams;

        let stealth_js = r#"
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' }
                ]
            });
        "#;

        page.execute(AddScriptToEvaluateOnNewDocumentParams::new(stealth_js))
            .await
            .context("Failed to register stealth scripts")?;

        Ok(())
    }

    /// Extract all cookies from a page
    pub async fn get_cookies(&self, page: &Page) -> Result<Vec<CookieData>> {
        let cookies = page.get_cookies().await.context("Failed to get cookies")?;

        Ok(cookies
            .iter()
            .map(|c| CookieData {
                name: c.name.clone(),
                value: c.value.clone(),
                domain: c.domain.clone(),
                path: c.path.clone(),
                expires: Some(c.expires),
                http_only: c.http_only,
                secure: c.secure,
            })
            .collect())
    }

    /// Set cookies on a page (restore session)
    pub async fn set_cookies(&self, page: &Page, cookies: &[CookieData]) -> Result<()> {
        for cookie in cookies {
            page.set_cookie(
                chromiumoxide::cdp::browser_protocol::network::CookieParam::builder()
                    .name(cookie.name.clone())
                    .value(cookie.value.clone())
                    .domain(cookie.domain.clone())
                    .path(cookie.path.clone())
                    .secure(cookie.secure)
                    .http_only(cookie.http_only)
                    .build()
                    .map_err(|e| anyhow::anyhow!("Failed to build cookie: {:?}", e))?,
            )
            .await
            .context("Failed to set cookie")?;
        }
        Ok(())
    }

    /// Take full-page screenshot and save to file
    pub async fn screenshot(&self, page: &Page, output_path: &str) -> Result<()> {
        let screenshot = page
            .screenshot(
                chromiumoxide::page::ScreenshotParams::builder()
                    .full_page(true)
                    .build(),
            )
            .await
            .context("Failed to take screenshot")?;

        tokio::fs::write(output_path, screenshot)
            .await
            .context("Failed to save screenshot")?;

        Ok(())
    }

    /// Close browser gracefully (drops Arc, Chrome process terminates)
    pub async fn close(&mut self) -> Result<()> {
        if let Some(browser) = self.browser.take() {
            drop(browser);
        }
        Ok(())
    }
}

/// Ensure Chrome process cleanup on early return or panic
impl Drop for BrowserManager {
    fn drop(&mut self) {
        self.browser.take();
    }
}
