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

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config(prompts: Vec<&str>, accounts: Vec<&str>) -> BatchConfig {
        BatchConfig {
            prompts: prompts.into_iter().map(String::from).collect(),
            account_ids: accounts.into_iter().map(String::from).collect(),
            pipeline: JobPipeline {
                generate: true,
                upscale: true,
                upscale_factor: 4,
                subtitle: false,
                upload: false,
                drive_folder: None,
            },
            priority: JobPriority::Normal,
            veo3_config: VeoConfig {
                quality: "standard".into(),
                duration: 8,
                mode: "standard".into(),
            },
        }
    }

    #[tokio::test]
    async fn test_create_batch() {
        let (manager, _rx) = BatchManager::new();
        let config = test_config(
            vec!["prompt 1", "prompt 2", "prompt 3"],
            vec!["acc1", "acc2"],
        );

        let batch_id = manager.create_batch(config).await;
        let jobs = manager.get_batch_jobs(&batch_id).await;

        assert_eq!(jobs.len(), 3);
        assert_eq!(jobs[0].account_id, "acc1");
        assert_eq!(jobs[1].account_id, "acc2");
        assert_eq!(jobs[2].account_id, "acc1"); // Round-robin
    }

    #[tokio::test]
    async fn test_create_batch_no_accounts() {
        let (manager, _rx) = BatchManager::new();
        let config = test_config(vec!["prompt 1"], vec![]);

        let batch_id = manager.create_batch(config).await;
        let jobs = manager.get_batch_jobs(&batch_id).await;

        assert_eq!(jobs.len(), 1);
        assert_eq!(jobs[0].account_id, "default");
    }

    #[tokio::test]
    async fn test_cancel_job() {
        let (manager, _rx) = BatchManager::new();
        let config = test_config(vec!["test"], vec!["acc1"]);

        let batch_id = manager.create_batch(config).await;
        let jobs = manager.get_batch_jobs(&batch_id).await;
        let job_id = &jobs[0].id;

        manager.cancel_job(job_id).await;

        let updated = manager.get_batch_jobs(&batch_id).await;
        assert_eq!(updated[0].status, BatchJobStatus::Cancelled);
    }

    #[tokio::test]
    async fn test_queue_status_empty() {
        let (manager, _rx) = BatchManager::new();
        let status = manager.get_status().await;

        assert_eq!(status.total_jobs, 0);
        assert!(!status.is_running);
        assert!(!status.is_paused);
    }

    #[tokio::test]
    async fn test_pause_resume() {
        let (manager, _rx) = BatchManager::new();

        assert!(!manager.is_paused().await);
        manager.pause().await;
        assert!(manager.is_paused().await);
        manager.resume().await;
        assert!(!manager.is_paused().await);
    }

    #[tokio::test]
    async fn test_get_all_jobs() {
        let (manager, _rx) = BatchManager::new();
        let config1 = test_config(vec!["p1"], vec!["a1"]);
        let config2 = test_config(vec!["p2", "p3"], vec!["a2"]);

        manager.create_batch(config1).await;
        manager.create_batch(config2).await;

        let all = manager.get_all_jobs().await;
        assert_eq!(all.len(), 3);
    }
}
