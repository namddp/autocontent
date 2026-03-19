use chrono::Utc;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use uuid::Uuid;

use crate::models::batch_job::*;

/// In-memory batch queue manager with channel-based dispatch
pub struct BatchManager {
    jobs: Arc<RwLock<Vec<BatchJob>>>,
    is_running: Arc<RwLock<bool>>,
    is_paused: Arc<RwLock<bool>>,
    job_sender: mpsc::Sender<BatchJob>,
}

impl BatchManager {
    pub fn new() -> (Self, mpsc::Receiver<BatchJob>) {
        let (tx, rx) = mpsc::channel(100);
        (
            Self {
                jobs: Arc::new(RwLock::new(Vec::new())),
                is_running: Arc::new(RwLock::new(false)),
                is_paused: Arc::new(RwLock::new(false)),
                job_sender: tx,
            },
            rx,
        )
    }

    /// Create batch from config, returns batch_id
    pub async fn create_batch(
        &self,
        config: BatchConfig,
    ) -> String {
        let batch_id = Uuid::new_v4().to_string();
        let account_count = config.account_ids.len().max(1);

        let mut jobs = self.jobs.write().await;

        for (idx, prompt) in config.prompts.iter().enumerate()
        {
            let account_id = if config.account_ids.is_empty()
            {
                "default".to_string()
            } else {
                config.account_ids[idx % account_count]
                    .clone()
            };

            let job = BatchJob {
                id: Uuid::new_v4().to_string(),
                batch_id: batch_id.clone(),
                prompt: prompt.clone(),
                account_id,
                pipeline: config.pipeline.clone(),
                status: BatchJobStatus::Pending,
                priority: config.priority.clone(),
                current_stage: None,
                video_local_path: None,
                srt_local_path: None,
                drive_file_id: None,
                error: None,
                retry_count: 0,
                created_at: Utc::now(),
                started_at: None,
                completed_at: None,
            };

            jobs.push(job);
        }

        batch_id
    }

    /// Start processing queue — dispatch pending jobs
    pub async fn start(&self) {
        {
            let mut is_running = self.is_running.write().await;
            *is_running = true;
        }
        {
            let mut is_paused = self.is_paused.write().await;
            *is_paused = false;
        }

        let jobs = self.jobs.read().await;
        for job in jobs.iter() {
            if job.status == BatchJobStatus::Pending {
                let _ =
                    self.job_sender.send(job.clone()).await;
            }
        }
    }

    /// Pause queue (current jobs finish, no new dispatches)
    pub async fn pause(&self) {
        let mut is_paused = self.is_paused.write().await;
        *is_paused = true;
    }

    /// Resume paused queue
    pub async fn resume(&self) {
        let mut is_paused = self.is_paused.write().await;
        *is_paused = false;
    }

    /// Cancel a specific job
    pub async fn cancel_job(&self, job_id: &str) {
        let mut jobs = self.jobs.write().await;
        if let Some(job) =
            jobs.iter_mut().find(|j| j.id == job_id)
        {
            job.status = BatchJobStatus::Cancelled;
        }
    }

    /// Cancel all jobs in a batch
    pub async fn cancel_batch(&self, batch_id: &str) {
        let mut jobs = self.jobs.write().await;
        for job in jobs.iter_mut() {
            if job.batch_id == batch_id
                && job.status != BatchJobStatus::Completed
            {
                job.status = BatchJobStatus::Cancelled;
            }
        }
    }

    /// Retry a failed job (max 3 retries)
    pub async fn retry_job(&self, job_id: &str) {
        let mut jobs = self.jobs.write().await;
        if let Some(job) =
            jobs.iter_mut().find(|j| j.id == job_id)
        {
            if job.status == BatchJobStatus::Failed
                && job.retry_count < 3
            {
                job.status = BatchJobStatus::Pending;
                job.retry_count += 1;
                job.error = None;
                let _ =
                    self.job_sender.send(job.clone()).await;
            }
        }
    }

    /// Update job status and metadata
    pub async fn update_job_status(
        &self,
        job_id: &str,
        status: BatchJobStatus,
        stage: Option<String>,
        error: Option<String>,
    ) {
        let mut jobs = self.jobs.write().await;
        if let Some(job) =
            jobs.iter_mut().find(|j| j.id == job_id)
        {
            job.status = status.clone();
            job.current_stage = stage;
            if let Some(err) = error {
                job.error = Some(err);
            }
            match &status {
                BatchJobStatus::Completed => {
                    job.completed_at = Some(Utc::now());
                }
                BatchJobStatus::Generating => {
                    if job.started_at.is_none() {
                        job.started_at = Some(Utc::now());
                    }
                }
                _ => {}
            }
        }
    }

    /// Set video path on a job
    pub async fn set_video_path(
        &self,
        job_id: &str,
        path: String,
    ) {
        let mut jobs = self.jobs.write().await;
        if let Some(job) =
            jobs.iter_mut().find(|j| j.id == job_id)
        {
            job.video_local_path = Some(path);
        }
    }

    /// Get queue status summary
    pub async fn get_status(&self) -> QueueStatus {
        let jobs = self.jobs.read().await;
        let is_running = *self.is_running.read().await;
        let is_paused = *self.is_paused.read().await;

        QueueStatus {
            is_running,
            is_paused,
            total_jobs: jobs.len() as u32,
            active_jobs: jobs
                .iter()
                .filter(|j| {
                    matches!(
                        j.status,
                        BatchJobStatus::Generating
                            | BatchJobStatus::Upscaling
                            | BatchJobStatus::Subtitling
                            | BatchJobStatus::Uploading
                    )
                })
                .count() as u32,
            completed_jobs: jobs
                .iter()
                .filter(|j| {
                    j.status == BatchJobStatus::Completed
                })
                .count() as u32,
            failed_jobs: jobs
                .iter()
                .filter(|j| {
                    j.status == BatchJobStatus::Failed
                })
                .count() as u32,
        }
    }

    /// Get all jobs for a batch
    pub async fn get_batch_jobs(
        &self,
        batch_id: &str,
    ) -> Vec<BatchJob> {
        let jobs = self.jobs.read().await;
        jobs.iter()
            .filter(|j| j.batch_id == batch_id)
            .cloned()
            .collect()
    }

    /// Get all jobs across all batches
    pub async fn get_all_jobs(&self) -> Vec<BatchJob> {
        let jobs = self.jobs.read().await;
        jobs.clone()
    }

    /// Check if queue is paused
    pub async fn is_paused(&self) -> bool {
        *self.is_paused.read().await
    }
}
