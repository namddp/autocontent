use serde::{Deserialize, Serialize};

/// Browser launch configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserConfig {
    pub headless: bool,
    pub chrome_path: Option<String>,
    pub proxy: Option<ProxyConfig>,
    pub user_agent: Option<String>,
    pub window_width: u32,
    pub window_height: u32,
}

impl Default for BrowserConfig {
    fn default() -> Self {
        Self {
            headless: true,
            chrome_path: None,
            proxy: None,
            user_agent: None,
            window_width: 1920,
            window_height: 1080,
        }
    }
}

/// Single proxy server configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyConfig {
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
    pub protocol: ProxyProtocol,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyProtocol {
    Http,
    Https,
    Socks5,
}

/// Cookie extracted from browser session
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CookieData {
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub expires: Option<f64>,
    pub http_only: bool,
    pub secure: bool,
}

/// Proxy pool with rotation strategy
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyPoolConfig {
    pub proxies: Vec<ProxyConfig>,
    pub rotation: ProxyRotation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyRotation {
    RoundRobin,
    Random,
    Sticky,
}

/// Dynamic proxy provider API source
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum ProxyProvider {
    KiotProxy,
    ProxyXoay,
    #[default]
    None,
}

/// Currently active proxy with TTL tracking
#[derive(Debug, Clone)]
pub struct ActiveProxy {
    pub config: ProxyConfig,
    pub acquired_at: chrono::DateTime<chrono::Utc>,
    pub ttl_secs: u64,
}

impl ActiveProxy {
    pub fn is_expired(&self) -> bool {
        let elapsed = chrono::Utc::now() - self.acquired_at;
        elapsed.num_seconds() as u64 >= self.ttl_secs
    }

    pub fn remaining_secs(&self) -> u64 {
        let elapsed = (chrono::Utc::now() - self.acquired_at).num_seconds() as u64;
        self.ttl_secs.saturating_sub(elapsed)
    }
}
