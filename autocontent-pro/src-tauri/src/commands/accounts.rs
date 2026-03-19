use crate::models::account::*;
use crate::services::{crypto, oauth::OAuthService};
use chrono::Utc;
use uuid::Uuid;

#[tauri::command]
pub async fn add_account_oauth(
    client_id: String,
    client_secret: String,
) -> Result<AccountInfo, String> {
    let config = OAuthConfig {
        client_id,
        client_secret,
        redirect_uri: "http://127.0.0.1:8745/callback".to_string(),
        scopes: vec![
            "https://www.googleapis.com/auth/drive.file".to_string(),
            "https://www.googleapis.com/auth/userinfo.email".to_string(),
            "https://www.googleapis.com/auth/userinfo.profile"
                .to_string(),
        ],
    };

    let service = OAuthService::new(config);
    let (tokens, user_info) =
        service.start_flow().await.map_err(|e| e.to_string())?;

    // Encrypt tokens before storage
    let master_key = crypto::get_device_master_key();
    let _encrypted_access =
        crypto::encrypt(&tokens.access_token, &master_key)
            .map_err(|e| e.to_string())?;
    let _encrypted_refresh = match &tokens.refresh_token {
        Some(rt) => Some(
            crypto::encrypt(rt, &master_key)
                .map_err(|e| e.to_string())?,
        ),
        None => None,
    };

    let account_id = Uuid::new_v4().to_string();

    // TODO: Phase 6 — persist to SQLite with encrypted tokens

    Ok(AccountInfo {
        id: account_id,
        email: user_info.email,
        display_name: user_info.name,
        avatar_url: user_info.picture,
        status: AccountStatus::Active,
        auth_type: AuthType::ApiKey,
        has_api_key: false,
        has_cookies: false,
        last_used: None,
        created_at: Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn list_accounts() -> Result<Vec<AccountInfo>, String> {
    // TODO: Phase 6 — query from SQLite
    Ok(vec![])
}

#[tauri::command]
pub async fn remove_account(
    _account_id: String,
) -> Result<(), String> {
    // TODO: Phase 6 — delete from SQLite + revoke tokens
    Ok(())
}

#[tauri::command]
pub async fn set_api_key(
    _account_id: String,
    api_key: String,
) -> Result<(), String> {
    let master_key = crypto::get_device_master_key();
    let _encrypted_key = crypto::encrypt(&api_key, &master_key)
        .map_err(|e| e.to_string())?;
    // TODO: Phase 6 — update SQLite with encrypted API key
    Ok(())
}

#[tauri::command]
pub async fn get_active_account() -> Result<Option<AccountInfo>, String> {
    // TODO: Phase 6 — query SQLite WHERE is_active = true
    Ok(None)
}
