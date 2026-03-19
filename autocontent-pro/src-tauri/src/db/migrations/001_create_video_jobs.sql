CREATE TABLE IF NOT EXISTS video_jobs (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    quality TEXT NOT NULL DEFAULT 'standard',
    duration INTEGER NOT NULL DEFAULT 8,
    mode TEXT NOT NULL DEFAULT 'standard',
    status TEXT NOT NULL DEFAULT 'pending',
    operation_name TEXT,
    video_url TEXT,
    local_path TEXT,
    error TEXT,
    account_email TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_created ON video_jobs(created_at DESC);
