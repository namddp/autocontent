use crate::models::video_job::ProcessingProgress;
use crate::services::ffmpeg::FfmpegService;
use crate::services::upscaler::UpscalerService;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
pub async fn process_video(
    app: AppHandle,
    input_path: String,
    output_path: String,
    scale_factor: u8,
    quality: String,
    job_id: String,
) -> Result<String, String> {
    // Validate scale factor
    if ![2u8, 4].contains(&scale_factor) {
        return Err("Scale factor must be 2 or 4".to_string());
    }

    let temp_dir =
        tempfile::tempdir().map_err(|e| e.to_string())?;
    let temp = temp_dir.path();

    let frames_dir = temp.join("frames");
    let upscaled_dir = temp.join("upscaled");
    let audio_path = temp.join("audio.aac");

    // Resolve sidecar binary paths from app resources
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?;
    let ffmpeg_path = resource_dir.join("binaries/ffmpeg");
    let realesrgan_path =
        resource_dir.join("binaries/realesrgan-ncnn-vulkan");
    let models_dir = resource_dir.join("models");

    let ffmpeg = FfmpegService::new(ffmpeg_path);
    let upscaler =
        UpscalerService::new(realesrgan_path, models_dir);

    // Step 1: Extract audio (may fail if no audio track — that's OK)
    emit_progress(
        &app,
        &job_id,
        "extracting",
        0,
        0,
        "Extracting audio...",
    );
    let _ = ffmpeg
        .extract_audio(&PathBuf::from(&input_path), &audio_path)
        .await;

    // Step 2: Extract frames
    emit_progress(
        &app,
        &job_id,
        "extracting",
        0,
        0,
        "Extracting frames...",
    );
    let total_frames = ffmpeg
        .extract_frames(&PathBuf::from(&input_path), &frames_dir)
        .await
        .map_err(|e| e.to_string())?;

    emit_progress(
        &app,
        &job_id,
        "extracting",
        total_frames,
        total_frames,
        &format!("Extracted {} frames", total_frames),
    );

    // Step 3: Upscale frames with progress
    let app_clone = app.clone();
    let job_id_clone = job_id.clone();
    upscaler
        .upscale_directory(
            &frames_dir,
            &upscaled_dir,
            scale_factor,
            "realesrgan-x4plus",
            move |current, total| {
                emit_progress(
                    &app_clone,
                    &job_id_clone,
                    "upscaling",
                    current,
                    total,
                    &format!(
                        "Upscaling frame {}/{}",
                        current, total
                    ),
                );
            },
        )
        .await
        .map_err(|e| e.to_string())?;

    // Step 4: Encode final video
    emit_progress(
        &app,
        &job_id,
        "encoding",
        0,
        0,
        "Encoding final video...",
    );

    let (preset, crf) = match quality.as_str() {
        "fast" => ("ultrafast", 28u8),
        "high" => ("slow", 18),
        _ => ("medium", 23),
    };

    let audio_ref = if audio_path.exists() {
        Some(audio_path.as_path())
    } else {
        None
    };

    ffmpeg
        .encode_video(
            &upscaled_dir,
            audio_ref,
            &PathBuf::from(&output_path),
            30.0, // TODO: detect original FPS via get_video_info
            preset,
            crf,
        )
        .await
        .map_err(|e| e.to_string())?;

    emit_progress(
        &app,
        &job_id,
        "completed",
        1,
        1,
        "Video processing completed!",
    );

    // temp_dir auto-cleanup on drop
    Ok(output_path)
}

#[tauri::command]
pub async fn get_video_info(
    app: AppHandle,
    video_path: String,
) -> Result<crate::services::ffmpeg::VideoInfo, String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?;
    let ffmpeg_path = resource_dir.join("binaries/ffmpeg");
    let ffmpeg = FfmpegService::new(ffmpeg_path);
    ffmpeg
        .get_video_info(&PathBuf::from(video_path))
        .await
        .map_err(|e| e.to_string())
}

fn emit_progress(
    app: &AppHandle,
    job_id: &str,
    stage: &str,
    current: u32,
    total: u32,
    message: &str,
) {
    let percent = if total > 0 {
        (current as f32 / total as f32) * 100.0
    } else {
        0.0
    };
    let _ = app.emit(
        "video:progress",
        ProcessingProgress {
            job_id: job_id.to_string(),
            stage: stage.to_string(),
            current_frame: current,
            total_frames: total,
            percent,
            message: message.to_string(),
        },
    );
}
