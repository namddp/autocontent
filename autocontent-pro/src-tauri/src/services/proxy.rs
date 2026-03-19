use std::sync::atomic::{AtomicUsize, Ordering};

use crate::models::browser::{ProxyConfig, ProxyPoolConfig, ProxyRotation};

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
