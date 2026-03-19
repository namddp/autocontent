use crate::models::video_job::*;
use crate::services::gemini_client::GeminiClient;
use crate::services::image_upload_handler;
use std::path::Path;
use tauri::{command, AppHandle, Emitter, Manager};
use uuid::Uuid;

#[derive(Clone, serde::Serialize)]
struct ProgressPayload {
    job_id: String,
    status: String,
    message: String,
}

/// Unified video generation command supporting T2V, I2V, and Clone modes
#[command]
pub async fn veo3_generate_video(
    app: AppHandle,
    prompt: String,
    quality: String,
    duration: u8,
    mode: String,
    api_key: String,
    generation_type: Option<String>,
    image_path: Option<String>,
    image_path_end: Option<String>,
) -> Result<VideoResult, String> {
    let job_id = Uuid::new_v4().to_string();

    let gen_type = match generation_type.as_deref() {
        Some("image_to_video") => VideoGenerationType::ImageToVideo,
        Some("clone_video") => VideoGenerationType::CloneVideo,
        _ => VideoGenerationType::TextToVideo,
    };

    let config = GenerationConfig {
        generation_type: gen_type.clone(),
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

    let emit_progress = |status: &str, message: &str| {
        let _ = app.emit(
            "veo3:progress",
            ProgressPayload {
                job_id: job_id.clone(),
                status: status.to_string(),
                message: message.to_string(),
            },
        );
    };

    emit_progress("generating", "Submitting video generation request...");

    let client = GeminiClient::new(api_key).map_err(|e| e.to_string())?;

    // Submit based on generation type
    let operation_name = match &config.generation_type {
        VideoGenerationType::TextToVideo => {
            client
                .submit_generation(&prompt, &config)
                .await
                .map_err(|e| e.to_string())?
        }
        VideoGenerationType::ImageToVideo => {
            let path = image_path
                .as_deref()
                .ok_or("image_path required for Image-to-Video mode")?;
            let image = image_upload_handler::read_and_encode_image(Path::new(path))
                .await
                .map_err(|e| e.to_string())?;

            emit_progress("generating", "Uploading image and generating video...");

            client
                .submit_image_to_video(&prompt, &image, &config)
                .await
                .map_err(|e| e.to_string())?
        }
        VideoGenerationType::CloneVideo => {
            let first_path = image_path
                .as_deref()
                .ok_or("image_path (first frame) required for Clone mode")?;
            let last_path = image_path_end
                .as_deref()
                .ok_or("image_path_end (last frame) required for Clone mode")?;

            let first_image =
                image_upload_handler::read_and_encode_image(Path::new(first_path))
                    .await
                    .map_err(|e| e.to_string())?;
            let last_image =
                image_upload_handler::read_and_encode_image(Path::new(last_path))
                    .await
                    .map_err(|e| e.to_string())?;

            emit_progress("generating", "Uploading frames and generating clone video...");

            let prompt_opt = if prompt.is_empty() {
                None
            } else {
                Some(prompt.as_str())
            };

            client
                .submit_clone_video(prompt_opt, &first_image, &last_image, &config)
                .await
                .map_err(|e| e.to_string())?
        }
    };

    emit_progress("generating", "Generation started. Polling for result...");

    // Poll until done
    let operation = client
        .poll_operation(&operation_name)
        .await
        .map_err(|e| e.to_string())?;

    // Extract video URL
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

    emit_progress("downloading", "Downloading generated video...");

    // Download video
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

    emit_progress("completed", "Video generation completed!");

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
