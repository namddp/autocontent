/// Proxy API Client — Fetch rotating proxies from KiotProxy and ProxyXoay APIs
use anyhow::{bail, Context, Result};
use reqwest::Client;
use std::time::Duration;

use crate::models::browser::{ProxyConfig, ProxyProtocol};

const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);
const DEFAULT_TTL_SECS: u64 = 300; // 5 minutes fallback

/// Fetch a fresh proxy from KiotProxy API
pub async fn fetch_kiotproxy(
    client: &Client,
    api_key: &str,
) -> Result<(ProxyConfig, u64)> {
    let url = "https://api.kiotproxy.com/api/v1/proxies/new";

    let resp = client
        .get(url)
        .header("Authorization", format!("Bearer {}", api_key))
        .query(&[("api_key", api_key)])
        .timeout(REQUEST_TIMEOUT)
        .send()
        .await
        .context("KiotProxy API request failed")?;

    if !resp.status().is_success() {
        let text = resp.text().await.unwrap_or_default();
        bail!("KiotProxy API error: {}", text);
    }

    let body: serde_json::Value = resp.json().await.context("Parse KiotProxy response")?;

    let proxy_ip = body["proxy_ip"]
        .as_str()
        .or(body["ip"].as_str())
        .ok_or_else(|| anyhow::anyhow!("Missing proxy_ip in KiotProxy response"))?;

    let proxy_port = body["proxy_port"]
        .as_u64()
        .or(body["port"].as_u64())
        .unwrap_or(8080) as u16;

    let username = body["username"].as_str().map(String::from);
    let password = body["password"].as_str().map(String::from);
    let ttl = body["ttl"].as_u64().unwrap_or(DEFAULT_TTL_SECS);

    let config = ProxyConfig {
        host: proxy_ip.to_string(),
        port: proxy_port,
        username,
        password,
        protocol: ProxyProtocol::Http,
    };

    Ok((config, ttl))
}

/// Fetch a fresh proxy from ProxyXoay API
pub async fn fetch_proxyxoay(
    client: &Client,
    api_key: &str,
) -> Result<(ProxyConfig, u64)> {
    let url = format!(
        "https://proxyxoay.shop/api/get.php?key={}&type=http",
        api_key
    );

    let resp = client
        .get(&url)
        .timeout(REQUEST_TIMEOUT)
        .send()
        .await
        .context("ProxyXoay API request failed")?;

    if !resp.status().is_success() {
        let text = resp.text().await.unwrap_or_default();
        bail!("ProxyXoay API error: {}", text);
    }

    let text = resp.text().await.context("Read ProxyXoay response")?;

    // ProxyXoay may return JSON or plain text "ip:port"
    if let Ok(body) = serde_json::from_str::<serde_json::Value>(&text) {
        let ip = body["ip"]
            .as_str()
            .or(body["proxy"].as_str())
            .ok_or_else(|| anyhow::anyhow!("Missing ip in ProxyXoay response"))?;

        let port = body["port"].as_u64().unwrap_or(8080) as u16;
        let ttl = body["ttl"].as_u64().unwrap_or(DEFAULT_TTL_SECS);

        return Ok((
            ProxyConfig {
                host: ip.to_string(),
                port,
                username: body["username"].as_str().map(String::from),
                password: body["password"].as_str().map(String::from),
                protocol: ProxyProtocol::Http,
            },
            ttl,
        ));
    }

    // Plain text format: "ip:port" or "ip:port:user:pass"
    let parts: Vec<&str> = text.trim().split(':').collect();
    match parts.len() {
        2 => Ok((
            ProxyConfig {
                host: parts[0].to_string(),
                port: parts[1].parse().unwrap_or(8080),
                username: None,
                password: None,
                protocol: ProxyProtocol::Http,
            },
            DEFAULT_TTL_SECS,
        )),
        4 => Ok((
            ProxyConfig {
                host: parts[0].to_string(),
                port: parts[1].parse().unwrap_or(8080),
                username: Some(parts[2].to_string()),
                password: Some(parts[3].to_string()),
                protocol: ProxyProtocol::Http,
            },
            DEFAULT_TTL_SECS,
        )),
        _ => bail!("Unexpected ProxyXoay response format: {}", text),
    }
}

/// Simple TCP health check — verify proxy is reachable
pub async fn health_check_proxy(host: &str, port: u16) -> Result<()> {
    let addr = format!("{}:{}", host, port);
    tokio::time::timeout(Duration::from_secs(5), tokio::net::TcpStream::connect(&addr))
        .await
        .map_err(|_| anyhow::anyhow!("Proxy health check timeout: {}", addr))?
        .map_err(|e| anyhow::anyhow!("Proxy unreachable {}: {}", addr, e))?;
    Ok(())
}
