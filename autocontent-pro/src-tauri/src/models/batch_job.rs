use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchJob {
    pub id: String,
    pub batch_id: String,
    pub prompt: String,
    pub account_id: String,
    pub pipeline: JobPipeline,
    pub status: BatchJobStatus,
    pub priority: JobPriority,
    pub current_stage: Option<String>,
    pub video_local_path: Option<String>,
    pub srt_local_path: Option<String>,
    pub drive_file_id: Option<String>,
    pub error: Option<String>,
    pub retry_count: u8,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JobPipeline {
    pub generate: bool,
    pub upscale: bool,
    pub upscale_factor: u8,
    pub subtitle: bool,
    pub upload: bool,
    pub drive_folder: Option<String>,
}

#[derive(
    Debug, Clone, Serialize, Deserialize, PartialEq,
)]
#[serde(rename_all = "lowercase")]
pub enum BatchJobStatus {
    Pending,
    Generating,
    Upscaling,
    Subtitling,
    Uploading,
    Completed,
    Failed,
    Cancelled,
    Paused,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
)]
#[serde(rename_all = "lowercase")]
pub enum JobPriority {
    Low = 0,
    Normal = 1,
    High = 2,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchConfig {
    pub prompts: Vec<String>,
    pub account_ids: Vec<String>,
    pub pipeline: JobPipeline,
    pub priority: JobPriority,
    pub veo3_config: VeoConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VeoConfig {
    pub quality: String,
    pub duration: u8,
    pub mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchSummary {
    pub batch_id: String,
    pub total: u32,
    pub pending: u32,
    pub in_progress: u32,
    pub completed: u32,
    pub failed: u32,
    pub cancelled: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueueStatus {
    pub is_running: bool,
    pub is_paused: bool,
    pub total_jobs: u32,
    pub active_jobs: u32,
    pub completed_jobs: u32,
    pub failed_jobs: u32,
}
