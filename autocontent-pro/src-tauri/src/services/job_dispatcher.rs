use std::sync::Arc;
use tokio::sync::mpsc;

use crate::models::batch_job::*;
use crate::services::batch_manager::BatchManager;

/// Receives jobs from channel and executes pipeline stages
pub struct JobDispatcher {
    manager: Arc<BatchManager>,
}

impl JobDispatcher {
    pub fn new(manager: Arc<BatchManager>) -> Self {
        Self { manager }
    }

    /// Main dispatch loop — spawns a task per job
    pub async fn run(
        &self,
        mut rx: mpsc::Receiver<BatchJob>,
    ) {
        while let Some(job) = rx.recv().await {
            // Skip if queue is paused
            if self.manager.is_paused().await {
                continue;
            }

            let manager = self.manager.clone();
            tokio::spawn(async move {
                Self::execute_pipeline(manager, job).await;
            });
        }
    }

    /// Execute pipeline stages sequentially for a job
    async fn execute_pipeline(
        manager: Arc<BatchManager>,
        job: BatchJob,
    ) {
        let job_id = job.id.clone();

        // Stage 1: Generate video (if enabled)
        if job.pipeline.generate {
            manager
                .update_job_status(
                    &job_id,
                    BatchJobStatus::Generating,
                    Some("generating".into()),
                    None,
                )
                .await;

            // TODO: Wire to veo3_generate_video service
            // For now, simulate with a delay
            tokio::time::sleep(
                std::time::Duration::from_secs(2),
            )
            .await;
        }

        // Stage 2: Upscale (if enabled)
        if job.pipeline.upscale {
            manager
                .update_job_status(
                    &job_id,
                    BatchJobStatus::Upscaling,
                    Some("upscaling".into()),
                    None,
                )
                .await;

            // TODO: Wire to process_video service
            tokio::time::sleep(
                std::time::Duration::from_secs(1),
            )
            .await;
        }

        // Stage 3: Subtitle (if enabled)
        if job.pipeline.subtitle {
            manager
                .update_job_status(
                    &job_id,
                    BatchJobStatus::Subtitling,
                    Some("subtitling".into()),
                    None,
                )
                .await;

            // TODO: Wire to transcribe_video service
            tokio::time::sleep(
                std::time::Duration::from_secs(1),
            )
            .await;
        }

        // Stage 4: Upload to Drive (if enabled)
        if job.pipeline.upload {
            manager
                .update_job_status(
                    &job_id,
                    BatchJobStatus::Uploading,
                    Some("uploading".into()),
                    None,
                )
                .await;

            // TODO: Wire to drive_upload service
            tokio::time::sleep(
                std::time::Duration::from_secs(1),
            )
            .await;
        }

        // Mark completed
        manager
            .update_job_status(
                &job_id,
                BatchJobStatus::Completed,
                None,
                None,
            )
            .await;
    }
}
