use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub email: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub status: AccountStatus,
    pub auth_type: AuthType,
    pub last_used: Option<String>,
    pub created_at: String,
}

/// Authentication method for the account
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AuthType {
    #[default]
    ApiKey,
    Cookie,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AccountStatus {
    Active,
    Expired,
    Error,
    Disabled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: String,
    pub scopes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
    pub scopes: Vec<String>,
}

/// Cookie-based session credentials for Google Flow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookieCredentials {
    pub cookies: Vec<CookieEntry>,
    pub captured_at: String,
    pub expires_at: Option<String>,
}

/// Single cookie entry for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookieEntry {
    pub name: String,
    pub value: String,
    pub domain: String,
    pub path: String,
    pub expires: Option<f64>,
    pub http_only: bool,
    pub secure: bool,
    pub same_site: String,
}

/// Safe account info returned to frontend (no tokens/cookies)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountInfo {
    pub id: String,
    pub email: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub status: AccountStatus,
    pub auth_type: AuthType,
    pub has_api_key: bool,
    pub has_cookies: bool,
    pub last_used: Option<String>,
    pub created_at: String,
}
