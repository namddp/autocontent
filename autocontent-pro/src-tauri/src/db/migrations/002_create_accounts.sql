CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    encrypted_api_key TEXT,
    token_expires_at TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    is_active INTEGER NOT NULL DEFAULT 0,
    last_used TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_config (
    id INTEGER PRIMARY KEY,
    client_id TEXT NOT NULL,
    encrypted_client_secret TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
