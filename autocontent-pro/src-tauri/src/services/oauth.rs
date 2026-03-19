use anyhow::{Context, Result};
use axum::{extract::Query, response::Html, routing::get, Router};
use reqwest::Client;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{oneshot, Mutex};
use uuid::Uuid;

use crate::models::account::{OAuthConfig, TokenPair};

const GOOGLE_AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL: &str =
    "https://www.googleapis.com/oauth2/v2/userinfo";

pub struct OAuthService {
    config: OAuthConfig,
    client: Client,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct GoogleUserInfo {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub picture: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct GoogleTokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: u64,
    #[allow(dead_code)]
    token_type: String,
}

impl OAuthService {
    pub fn new(config: OAuthConfig) -> Self {
        Self {
            config,
            client: Client::new(),
        }
    }

    /// Start OAuth flow: open browser, wait for callback, exchange code
    pub async fn start_flow(&self) -> Result<(TokenPair, GoogleUserInfo)> {
        let (tx, rx) = oneshot::channel::<String>();
        let tx = Arc::new(Mutex::new(Some(tx)));

        // CSRF state parameter to prevent redirect attacks
        let csrf_state = Uuid::new_v4().to_string();
        let expected_state = csrf_state.clone();

        // Local callback server to receive OAuth redirect
        let app = Router::new().route(
            "/callback",
            get(
                move |Query(params): Query<HashMap<String, String>>| {
                    let tx = tx.clone();
                    let expected = expected_state.clone();
                    async move {
                        // Validate CSRF state parameter
                        let state_valid = params
                            .get("state")
                            .map(|s| s == &expected)
                            .unwrap_or(false);

                        if !state_valid {
                            return Html(
                                "<h1>Login failed: invalid state parameter.</h1>"
                                    .to_string(),
                            );
                        }

                        if let Some(code) = params.get("code") {
                            if let Some(sender) = tx.lock().await.take() {
                                let _ = sender.send(code.clone());
                            }
                            Html(
                                "<h1>Login successful! You can close this tab.</h1>"
                                    .to_string(),
                            )
                        } else {
                            Html(
                                "<h1>Login failed. Please try again.</h1>"
                                    .to_string(),
                            )
                        }
                    }
                },
            ),
        );

        let listener =
            tokio::net::TcpListener::bind("127.0.0.1:8745")
                .await
                .context("Failed to bind OAuth callback port 8745")?;

        // Spawn server and keep handle for cleanup
        let server_handle = tokio::spawn(async move {
            axum::serve(listener, app).await.ok();
        });

        // Build Google OAuth URL with CSRF state
        let scopes = self.config.scopes.join(" ");
        let auth_url = format!(
            "{}?client_id={}&redirect_uri={}&response_type=code&scope={}&access_type=offline&prompt=consent&state={}",
            GOOGLE_AUTH_URL,
            self.config.client_id,
            self.config.redirect_uri,
            urlencoding::encode(&scopes),
            csrf_state,
        );

        open::that(&auth_url).context("Failed to open browser")?;

        // Wait for callback with 2-minute timeout
        let result = tokio::time::timeout(
            std::time::Duration::from_secs(120),
            rx,
        )
        .await;

        // Abort the callback server regardless of outcome
        server_handle.abort();

        let code = result
            .context("OAuth flow timed out (2 min)")?
            .context("OAuth callback channel closed")?;

        let tokens = self.exchange_code(&code).await?;
        let user_info =
            self.get_user_info(&tokens.access_token).await?;

        Ok((tokens, user_info))
    }

    /// Exchange authorization code for access + refresh tokens
    async fn exchange_code(&self, code: &str) -> Result<TokenPair> {
        let response = self
            .client
            .post(GOOGLE_TOKEN_URL)
            .form(&[
                ("code", code),
                ("client_id", self.config.client_id.as_str()),
                ("client_secret", self.config.client_secret.as_str()),
                ("redirect_uri", self.config.redirect_uri.as_str()),
                ("grant_type", "authorization_code"),
            ])
            .send()
            .await
            .context("Failed to exchange code for tokens")?;

        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Token exchange failed ({}): {}", status, body);
        }

        let token_resp: GoogleTokenResponse = response
            .json()
            .await
            .context("Failed to parse token response")?;

        if token_resp.refresh_token.is_none() {
            tracing::warn!("No refresh_token received — user may need to re-consent");
        }

        let expires_at = chrono::Utc::now()
            + chrono::Duration::seconds(token_resp.expires_in as i64);

        Ok(TokenPair {
            access_token: token_resp.access_token,
            refresh_token: token_resp.refresh_token,
            expires_at: expires_at.to_rfc3339(),
            scopes: self.config.scopes.clone(),
        })
    }

    /// Refresh an expired access token using the refresh token
    pub async fn refresh_token(
        &self,
        refresh_token: &str,
    ) -> Result<TokenPair> {
        let response = self
            .client
            .post(GOOGLE_TOKEN_URL)
            .form(&[
                ("refresh_token", refresh_token),
                ("client_id", self.config.client_id.as_str()),
                ("client_secret", self.config.client_secret.as_str()),
                ("grant_type", "refresh_token"),
            ])
            .send()
            .await
            .context("Failed to refresh token")?;

        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Token refresh failed ({}): {}", status, body);
        }

        let token_resp: GoogleTokenResponse = response
            .json()
            .await
            .context("Failed to parse refresh response")?;

        let expires_at = chrono::Utc::now()
            + chrono::Duration::seconds(token_resp.expires_in as i64);

        Ok(TokenPair {
            access_token: token_resp.access_token,
            refresh_token: Some(refresh_token.to_string()),
            expires_at: expires_at.to_rfc3339(),
            scopes: self.config.scopes.clone(),
        })
    }

    /// Fetch Google user profile info
    async fn get_user_info(
        &self,
        access_token: &str,
    ) -> Result<GoogleUserInfo> {
        let response = self
            .client
            .get(GOOGLE_USERINFO_URL)
            .bearer_auth(access_token)
            .send()
            .await
            .context("Failed to get user info")?;

        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!(
                "User info request failed ({}): {}",
                status,
                body
            );
        }

        response
            .json()
            .await
            .context("Failed to parse user info")
    }
}
