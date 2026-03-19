use std::sync::Arc;
use tauri::State;

use crate::models::batch_job::*;
use crate::services::batch_manager::BatchManager;

#[tauri::command]
pub async fn batch_create(
    manager: State<'_, Arc<BatchManager>>,
    config: BatchConfig,
) -> Result<String, String> {
    let batch_id = manager.create_batch(config).await;
    Ok(batch_id)
}

#[tauri::command]
pub async fn batch_start(
    manager: State<'_, Arc<BatchManager>>,
) -> Result<(), String> {
    manager.start().await;
    Ok(())
}

#[tauri::command]
pub async fn batch_pause(
    manager: State<'_, Arc<BatchManager>>,
) -> Result<(), String> {
    manager.pause().await;
    Ok(())
}

#[tauri::command]
pub async fn batch_resume(
    manager: State<'_, Arc<BatchManager>>,
) -> Result<(), String> {
    manager.resume().await;
    Ok(())
}

#[tauri::command]
pub async fn batch_cancel_job(
    manager: State<'_, Arc<BatchManager>>,
    job_id: String,
) -> Result<(), String> {
    manager.cancel_job(&job_id).await;
    Ok(())
}

#[tauri::command]
pub async fn batch_cancel_batch(
    manager: State<'_, Arc<BatchManager>>,
    batch_id: String,
) -> Result<(), String> {
    manager.cancel_batch(&batch_id).await;
    Ok(())
}

#[tauri::command]
pub async fn batch_retry_job(
    manager: State<'_, Arc<BatchManager>>,
    job_id: String,
) -> Result<(), String> {
    manager.retry_job(&job_id).await;
    Ok(())
}

#[tauri::command]
pub async fn batch_get_status(
    manager: State<'_, Arc<BatchManager>>,
) -> Result<QueueStatus, String> {
    Ok(manager.get_status().await)
}

#[tauri::command]
pub async fn batch_get_jobs(
    manager: State<'_, Arc<BatchManager>>,
    batch_id: String,
) -> Result<Vec<BatchJob>, String> {
    Ok(manager.get_batch_jobs(&batch_id).await)
}

#[tauri::command]
pub async fn batch_get_all_jobs(
    manager: State<'_, Arc<BatchManager>>,
) -> Result<Vec<BatchJob>, String> {
    Ok(manager.get_all_jobs().await)
}
