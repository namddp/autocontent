use tauri::command;

use crate::models::browser::{BrowserConfig, CookieData, ProxyConfig};
use crate::services::browser_manager::BrowserManager;

/// Launch browser, navigate to URL, wait for user login, extract cookies
#[command]
pub async fn browser_launch_capture(
    config: BrowserConfig,
    url: String,
) -> Result<Vec<CookieData>, String> {
    let mut manager = BrowserManager::new(config);
    manager.launch().await.map_err(|e| e.to_string())?;

    let page = manager
        .new_stealth_page(&url)
        .await
        .map_err(|e| e.to_string())?;

    // Wait for user to complete login (30s window)
    tokio::time::sleep(std::time::Duration::from_secs(30)).await;

    let cookies = manager
        .get_cookies(&page)
        .await
        .map_err(|e| e.to_string())?;

    manager.close().await.map_err(|e| e.to_string())?;
    Ok(cookies)
}

/// Take headless screenshot of a URL
#[command]
pub async fn browser_screenshot(
    url: String,
    output_path: String,
    proxy: Option<ProxyConfig>,
) -> Result<(), String> {
    let config = BrowserConfig {
        headless: true,
        proxy,
        ..Default::default()
    };

    let mut manager = BrowserManager::new(config);
    manager.launch().await.map_err(|e| e.to_string())?;

    let page = manager
        .new_stealth_page(&url)
        .await
        .map_err(|e| e.to_string())?;

    manager
        .screenshot(&page, &output_path)
        .await
        .map_err(|e| e.to_string())?;

    manager.close().await.map_err(|e| e.to_string())?;
    Ok(())
}

/// Test proxy connection by checking external IP via httpbin
#[command]
pub async fn browser_test_proxy(proxy: ProxyConfig) -> Result<String, String> {
    let config = BrowserConfig {
        headless: true,
        proxy: Some(proxy),
        ..Default::default()
    };

    let mut manager = BrowserManager::new(config);
    manager.launch().await.map_err(|e| e.to_string())?;

    let page = manager
        .new_stealth_page("https://httpbin.org/ip")
        .await
        .map_err(|e| e.to_string())?;

    // Extract displayed IP from page body
    let ip: String = page
        .evaluate("document.body.innerText")
        .await
        .map_err(|e| e.to_string())?
        .into_value()
        .map_err(|e| format!("{:?}", e))?;

    manager.close().await.map_err(|e| e.to_string())?;
    Ok(ip)
}
