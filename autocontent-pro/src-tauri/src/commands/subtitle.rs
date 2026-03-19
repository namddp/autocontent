use crate::models::video_job::{
    SubtitleSegment, TranscriptionResult, WhisperModel,
};
use crate::services::whisper::WhisperService;
use std::path::PathBuf;
use std::process::Stdio;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn transcribe_video(
    app: AppHandle,
    video_path: String,
    model: String,
    language: Option<String>,
) -> Result<TranscriptionResult, String> {
    let temp_dir =
        tempfile::tempdir().map_err(|e| e.to_string())?;
    let audio_path = temp_dir.path().join("audio.wav");

    // Extract audio as 16kHz mono WAV for Whisper
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?;
    let ffmpeg_path = resource_dir.join("binaries/ffmpeg");
    let audio_out = audio_path.to_string_lossy().to_string();

    let status = tokio::process::Command::new(
        ffmpeg_path.to_string_lossy().to_string(),
    )
    .args([
        "-i",
        &video_path,
        "-ar",
        "16000",
        "-ac",
        "1",
        "-f",
        "wav",
        "-y",
        &audio_out,
    ])
    .stdout(Stdio::null())
    .stderr(Stdio::piped())
    .status()
    .await
    .map_err(|e| e.to_string())?;

    if !status.success() {
        return Err(
            "Failed to extract audio from video".to_string()
        );
    }

    // Transcribe using whisper sidecar
    let whisper_path =
        resource_dir.join("binaries/whisper");
    let models_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("whisper-models");

    let whisper_model = match model.as_str() {
        "base" => WhisperModel::Base,
        "small" => WhisperModel::Small,
        _ => WhisperModel::Tiny,
    };

    let service =
        WhisperService::new(whisper_path, models_dir);

    service
        .transcribe(
            &audio_path,
            &whisper_model,
            language.as_deref(),
        )
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_srt(
    segments: Vec<SubtitleSegment>,
    output_path: String,
) -> Result<(), String> {
    WhisperService::write_srt(
        &segments,
        &PathBuf::from(&output_path),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn burn_subtitles(
    app: AppHandle,
    video_path: String,
    srt_path: String,
    output_path: String,
) -> Result<String, String> {
    let ffmpeg_path = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?
        .join("binaries/ffmpeg");

    // Escape FFmpeg filter metacharacters in srt_path
    let escaped_path = srt_path
        .replace('\\', "/")
        .replace(':', "\\:")
        .replace("'", "\\'");
    let subtitle_filter = format!("subtitles='{}'", escaped_path);

    let output = tokio::process::Command::new(
        ffmpeg_path.to_string_lossy().to_string(),
    )
    .args([
        "-i",
        &video_path,
        "-vf",
        &subtitle_filter,
        "-c:a",
        "copy",
        "-y",
        &output_path,
    ])
    .stdout(Stdio::null())
    .stderr(Stdio::piped())
    .output()
    .await
    .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to burn subtitles: {}", stderr));
    }

    Ok(output_path)
}
