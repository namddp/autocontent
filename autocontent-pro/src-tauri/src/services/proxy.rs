use std::sync::atomic::{AtomicUsize, Ordering};

use crate::models::browser::{
    ActiveProxy, ProxyConfig, ProxyPoolConfig, ProxyProvider, ProxyRotation,
};
use crate::services::proxy_api_client;
use anyhow::{bail, Result};
use reqwest::Client;

/// Thread-safe proxy pool with rotation strategies
pub struct ProxyPool {
    proxies: Vec<ProxyConfig>,
    rotation: ProxyRotation,
    current_index: AtomicUsize,
}

impl ProxyPool {
    pub fn new(config: ProxyPoolConfig) -> Self {
        Self {
            proxies: config.proxies,
            rotation: config.rotation,
            current_index: AtomicUsize::new(0),
        }
    }

    /// Get next proxy based on rotation strategy
    pub fn next_proxy(&self) -> Option<&ProxyConfig> {
        if self.proxies.is_empty() {
            return None;
        }

        match self.rotation {
            ProxyRotation::RoundRobin => {
                let idx = self.current_index.fetch_add(1, Ordering::SeqCst)
                    % self.proxies.len();
                Some(&self.proxies[idx])
            }
            ProxyRotation::Random => {
                let idx = rand::random::<usize>() % self.proxies.len();
                Some(&self.proxies[idx])
            }
            ProxyRotation::Sticky => self.proxies.first(),
        }
    }

    /// Get proxy for specific account index (sticky rotation)
    pub fn proxy_for_account(&self, account_index: usize) -> Option<&ProxyConfig> {
        if self.proxies.is_empty() {
            return None;
        }
        Some(&self.proxies[account_index % self.proxies.len()])
    }

    pub fn count(&self) -> usize {
        self.proxies.len()
    }
}

/// Dynamic proxy manager with API-based rotation and TTL tracking
pub struct ProxyManager {
    provider: ProxyProvider,
    api_key: Option<String>,
    active: Option<ActiveProxy>,
    client: Client,
}

impl ProxyManager {
    pub fn new(provider: ProxyProvider, api_key: Option<String>) -> Self {
        Self {
            provider,
            api_key,
            active: None,
            client: Client::new(),
        }
    }

    /// Get current proxy, fetching a new one if expired or none active
    pub async fn get_proxy(&mut self) -> Result<Option<ProxyConfig>> {
        if matches!(self.provider, ProxyProvider::None) {
            return Ok(None);
        }

        // Return cached proxy if still valid
        if let Some(ref active) = self.active {
            if !active.is_expired() {
                return Ok(Some(active.config.clone()));
            }
        }

        let api_key = self
            .api_key
            .as_deref()
            .ok_or_else(|| anyhow::anyhow!("Proxy API key not configured"))?;

        // Fetch new proxy from API
        let (config, ttl) = match self.provider {
            ProxyProvider::KiotProxy => {
                proxy_api_client::fetch_kiotproxy(&self.client, api_key).await?
            }
            ProxyProvider::ProxyXoay => {
                proxy_api_client::fetch_proxyxoay(&self.client, api_key).await?
            }
            ProxyProvider::None => unreachable!(),
        };

        // Health check
        proxy_api_client::health_check_proxy(&config.host, config.port).await?;

        self.active = Some(ActiveProxy {
            config: config.clone(),
            acquired_at: chrono::Utc::now(),
            ttl_secs: ttl,
        });

        Ok(Some(config))
    }

    /// Force rotation — invalidate current proxy and fetch new
    pub async fn rotate(&mut self) -> Result<Option<ProxyConfig>> {
        self.active = None;
        self.get_proxy().await
    }

    /// Get info about currently active proxy
    pub fn active_info(&self) -> Option<(String, u16, u64)> {
        self.active.as_ref().map(|a| {
            (a.config.host.clone(), a.config.port, a.remaining_secs())
        })
    }
}

/// Generate randomized but realistic User-Agent string
pub fn random_user_agent() -> String {
    let chrome_versions = [
        "131.0.6778.86",
        "130.0.6723.117",
        "129.0.6668.100",
        "128.0.6613.138",
        "127.0.6533.120",
    ];

    let os_strings = [
        "Windows NT 10.0; Win64; x64",
        "Macintosh; Intel Mac OS X 10_15_7",
        "Macintosh; Intel Mac OS X 14_5",
        "X11; Linux x86_64",
    ];

    let chrome = chrome_versions[rand::random::<usize>() % chrome_versions.len()];
    let os = os_strings[rand::random::<usize>() % os_strings.len()];

    format!(
        "Mozilla/5.0 ({}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{} Safari/537.36",
        os, chrome
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::browser::ProxyProtocol;

    fn sample_pool(n: usize) -> ProxyPool {
        let proxies: Vec<ProxyConfig> = (0..n)
            .map(|i| ProxyConfig {
                host: format!("proxy{}.example.com", i),
                port: 8080 + i as u16,
                username: None,
                password: None,
                protocol: ProxyProtocol::Http,
            })
            .collect();

        ProxyPool::new(ProxyPoolConfig {
            proxies,
            rotation: ProxyRotation::RoundRobin,
        })
    }

    #[test]
    fn test_round_robin() {
        let pool = sample_pool(3);
        let p0 = pool.next_proxy().unwrap().host.clone();
        let p1 = pool.next_proxy().unwrap().host.clone();
        let p2 = pool.next_proxy().unwrap().host.clone();
        let p3 = pool.next_proxy().unwrap().host.clone();

        assert_eq!(p0, "proxy0.example.com");
        assert_eq!(p1, "proxy1.example.com");
        assert_eq!(p2, "proxy2.example.com");
        assert_eq!(p3, "proxy0.example.com"); // Wraps around
    }

    #[test]
    fn test_empty_pool() {
        let pool = sample_pool(0);
        assert!(pool.next_proxy().is_none());
    }

    #[test]
    fn test_proxy_for_account() {
        let pool = sample_pool(3);
        let p = pool.proxy_for_account(5).unwrap();
        assert_eq!(p.host, "proxy2.example.com"); // 5 % 3 = 2
    }

    #[test]
    fn test_random_user_agent() {
        let ua = random_user_agent();
        assert!(ua.contains("Mozilla/5.0"));
        assert!(ua.contains("Chrome/"));
        assert!(ua.contains("Safari/537.36"));
    }

    #[test]
    fn test_pool_count() {
        assert_eq!(sample_pool(5).count(), 5);
        assert_eq!(sample_pool(0).count(), 0);
    }
}
