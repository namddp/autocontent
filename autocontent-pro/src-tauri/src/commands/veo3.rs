use crate::models::video_job::*;
use crate::services::gemini_client::GeminiClient;
use tauri::{command, AppHandle, Emitter, Manager};
use uuid::Uuid;

#[derive(Clone, serde::Serialize)]
struct ProgressPayload {
    job_id: String,
    status: String,
    message: String,
}

#[command]
pub async fn veo3_generate_video(
    app: AppHandle,
    prompt: String,
    quality: String,
    duration: u8,
    mode: String,
    api_key: String,
) -> Result<VideoResult, String> {
    let job_id = Uuid::new_v4().to_string();

    let config = GenerationConfig {
        quality: match quality.as_str() {
            "hd" => VideoQuality::Hd,
            "4k" => VideoQuality::FourK,
            _ => VideoQuality::Standard,
        },
        duration,
        mode: match mode.as_str() {
            "fast" => GenerationMode::Fast,
            _ => GenerationMode::Standard,
        },
    };

    // Emit: starting
    let _ = app.emit(
        "veo3:progress",
        ProgressPayload {
            job_id: job_id.clone(),
            status: "generating".to_string(),
            message: "Submitting video generation request...".to_string(),
        },
    );

    let client = GeminiClient::new(api_key).map_err(|e| e.to_string())?;

    // Step 1: Submit generation
    let operation_name = client
        .submit_generation(&prompt, &config)
        .await
        .map_err(|e| e.to_string())?;

    let _ = app.emit(
        "veo3:progress",
        ProgressPayload {
            job_id: job_id.clone(),
            status: "generating".to_string(),
            message: "Generation started. Polling for result...".to_string(),
        },
    );

    // Step 2: Poll until done
    let operation = client
        .poll_operation(&operation_name)
        .await
        .map_err(|e| e.to_string())?;

    // Step 3: Extract video URL
    let video_uri = operation
        .response
        .and_then(|r| {
            r.generate_video_response
                .generated_samples
                .first()
                .cloned()
        })
        .map(|s| s.video.uri)
        .ok_or("No video in response")?;

    let _ = app.emit(
        "veo3:progress",
        ProgressPayload {
            job_id: job_id.clone(),
            status: "downloading".to_string(),
            message: "Downloading generated video...".to_string(),
        },
    );

    // Step 4: Download video
    let output_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("videos");

    let filename = format!("{}.mp4", job_id);
    let local_path = client
        .download_video(&video_uri, &output_dir, &filename)
        .await
        .map_err(|e| e.to_string())?;

    let file_size = tokio::fs::metadata(&local_path)
        .await
        .map(|m| m.len())
        .unwrap_or(0);

    let _ = app.emit(
        "veo3:progress",
        ProgressPayload {
            job_id: job_id.clone(),
            status: "completed".to_string(),
            message: "Video generation completed!".to_string(),
        },
    );

    Ok(VideoResult {
        job_id,
        local_path: local_path.to_string_lossy().to_string(),
        requested_duration_secs: duration as f64,
        file_size_bytes: file_size,
    })
}

#[command]
pub async fn veo3_list_history() -> Result<Vec<serde_json::Value>, String> {
    // Will query from SQLite in Phase 4
    Ok(vec![])
}
