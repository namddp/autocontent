use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;

pub struct FfmpegService {
    binary_path: PathBuf,
    probe_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoInfo {
    pub duration_secs: f64,
    pub fps: f32,
    pub width: u32,
    pub height: u32,
}

impl FfmpegService {
    pub fn new(binary_path: PathBuf) -> Self {
        // Derive ffprobe path from ffmpeg path (same directory)
        let probe_path = binary_path
            .parent()
            .unwrap_or(Path::new("."))
            .join("ffprobe");
        Self {
            binary_path,
            probe_path,
        }
    }

    /// Extract all frames from video as PNG sequence
    pub async fn extract_frames(
        &self,
        video_path: &Path,
        output_dir: &Path,
    ) -> Result<u32> {
        tokio::fs::create_dir_all(output_dir)
            .await
            .context("Failed to create frames directory")?;

        let input = video_path.to_string_lossy().to_string();
        let pattern =
            output_dir.join("frame_%06d.png").to_string_lossy().to_string();

        let status = Command::new(&self.binary_path)
            .args(["-i", &input, "-vsync", "0", &pattern])
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .status()
            .await
            .context("Failed to execute FFmpeg")?;

        if !status.success() {
            anyhow::bail!("FFmpeg frame extraction failed");
        }

        count_files_in_dir(output_dir, "png").await
    }

    /// Extract audio track from video (copy codec)
    pub async fn extract_audio(
        &self,
        video_path: &Path,
        output_path: &Path,
    ) -> Result<()> {
        let input = video_path.to_string_lossy().to_string();
        let output = output_path.to_string_lossy().to_string();

        let status = Command::new(&self.binary_path)
            .args([
                "-i", &input, "-vn", "-acodec", "copy", "-y", &output,
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .status()
            .await
            .context("Failed to extract audio")?;

        if !status.success() {
            anyhow::bail!("FFmpeg audio extraction failed");
        }

        Ok(())
    }

    /// Encode PNG frames + optional audio into MP4 (H.264 + AAC)
    pub async fn encode_video(
        &self,
        frames_dir: &Path,
        audio_path: Option<&Path>,
        output_path: &Path,
        fps: f32,
        preset: &str,
        crf: u8,
    ) -> Result<()> {
        let pattern =
            frames_dir.join("frame_%06d.png").to_string_lossy().to_string();
        let output = output_path.to_string_lossy().to_string();

        let mut args: Vec<String> = vec![
            "-framerate".into(),
            fps.to_string(),
            "-i".into(),
            pattern,
        ];

        if let Some(audio) = audio_path {
            if audio.exists() {
                args.extend([
                    "-i".into(),
                    audio.to_string_lossy().to_string(),
                    "-c:a".into(),
                    "aac".into(),
                    "-shortest".into(),
                ]);
            }
        }

        args.extend([
            "-c:v".into(),
            "libx264".into(),
            "-preset".into(),
            preset.into(),
            "-crf".into(),
            crf.to_string(),
            "-pix_fmt".into(),
            "yuv420p".into(),
            "-y".into(),
            output,
        ]);

        let status = Command::new(&self.binary_path)
            .args(&args)
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .status()
            .await
            .context("Failed to encode video")?;

        if !status.success() {
            anyhow::bail!("FFmpeg encoding failed");
        }

        Ok(())
    }

    /// Probe video metadata using ffprobe-style args
    pub async fn get_video_info(
        &self,
        video_path: &Path,
    ) -> Result<VideoInfo> {
        let input = video_path.to_string_lossy().to_string();

        let output = Command::new(&self.probe_path)
            .args([
                "-i", &input, "-v", "quiet", "-print_format", "json",
                "-show_streams", "-show_format",
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await
            .context("Failed to probe video")?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(parse_video_info(&stdout).unwrap_or(VideoInfo {
            duration_secs: 0.0,
            fps: 30.0,
            width: 0,
            height: 0,
        }))
    }
}

/// Parse ffprobe JSON output for video stream info
fn parse_video_info(json_str: &str) -> Result<VideoInfo> {
    let value: serde_json::Value =
        serde_json::from_str(json_str).context("Invalid JSON")?;

    let streams =
        value["streams"].as_array().context("No streams")?;

    let video_stream = streams
        .iter()
        .find(|s| s["codec_type"] == "video")
        .context("No video stream")?;

    let width = video_stream["width"].as_u64().unwrap_or(0) as u32;
    let height =
        video_stream["height"].as_u64().unwrap_or(0) as u32;

    let fps_str =
        video_stream["r_frame_rate"].as_str().unwrap_or("30/1");
    let fps = parse_fps_fraction(fps_str);

    let duration_secs = value["format"]["duration"]
        .as_str()
        .and_then(|d| d.parse::<f64>().ok())
        .unwrap_or(0.0);

    Ok(VideoInfo {
        duration_secs,
        fps,
        width,
        height,
    })
}

fn parse_fps_fraction(fps_str: &str) -> f32 {
    let parts: Vec<&str> = fps_str.split('/').collect();
    if parts.len() == 2 {
        let num = parts[0].parse::<f32>().unwrap_or(30.0);
        let den = parts[1].parse::<f32>().unwrap_or(1.0);
        if den > 0.0 {
            num / den
        } else {
            30.0
        }
    } else {
        fps_str.parse::<f32>().unwrap_or(30.0)
    }
}

async fn count_files_in_dir(
    dir: &Path,
    ext: &str,
) -> Result<u32> {
    let mut count = 0u32;
    let mut entries = tokio::fs::read_dir(dir).await?;
    while let Some(entry) = entries.next_entry().await? {
        if entry
            .path()
            .extension()
            .map_or(false, |e| e == ext)
        {
            count += 1;
        }
    }
    Ok(count)
}
