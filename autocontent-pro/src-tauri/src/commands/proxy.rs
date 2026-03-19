use serde::Serialize;
use tauri::command;

use crate::models::browser::ProxyProvider;
use crate::services::proxy::ProxyManager;

/// Result of proxy test
#[derive(Debug, Serialize)]
pub struct ProxyTestResult {
    pub host: String,
    pub port: u16,
    pub ttl_secs: u64,
    pub provider: String,
}

/// Fetch and test a proxy from the specified provider
#[command]
pub async fn proxy_test_fetch(
    provider: String,
    api_key: String,
) -> Result<ProxyTestResult, String> {
    let prov = match provider.as_str() {
        "kiotproxy" => ProxyProvider::KiotProxy,
        "proxyxoay" => ProxyProvider::ProxyXoay,
        _ => return Err("Unknown proxy provider".to_string()),
    };

    let mut manager = ProxyManager::new(prov, Some(api_key));
    let proxy = manager
        .get_proxy()
        .await
        .map_err(|e| e.to_string())?
        .ok_or("No proxy returned")?;

    let (host, port, ttl) = manager
        .active_info()
        .unwrap_or((proxy.host.clone(), proxy.port, 0));

    Ok(ProxyTestResult {
        host,
        port,
        ttl_secs: ttl,
        provider,
    })
}

/// Check proxy health by TCP connect
#[command]
pub async fn proxy_health_check(host: String, port: u16) -> Result<bool, String> {
    crate::services::proxy_api_client::health_check_proxy(&host, port)
        .await
        .map(|_| true)
        .map_err(|e| e.to_string())
}
