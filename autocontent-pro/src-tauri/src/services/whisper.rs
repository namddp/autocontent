use anyhow::{Context, Result};
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;

use crate::models::video_job::{SubtitleSegment, TranscriptionResult, WhisperModel};

/// Whisper service using whisper.cpp CLI binary (sidecar pattern)
pub struct WhisperService {
    binary_path: PathBuf,
    models_dir: PathBuf,
}

impl WhisperService {
    pub fn new(binary_path: PathBuf, models_dir: PathBuf) -> Self {
        Self {
            binary_path,
            models_dir,
        }
    }

    /// Get model filename for the specified model size
    fn get_model_path(&self, model: &WhisperModel) -> PathBuf {
        let filename = match model {
            WhisperModel::Tiny => "ggml-tiny.bin",
            WhisperModel::Base => "ggml-base.bin",
            WhisperModel::Small => "ggml-small.bin",
        };
        self.models_dir.join(filename)
    }

    /// Transcribe audio file using whisper.cpp CLI -> parse SRT output
    pub async fn transcribe(
        &self,
        audio_path: &Path,
        model: &WhisperModel,
        language: Option<&str>,
    ) -> Result<TranscriptionResult> {
        let model_path = self.get_model_path(model);
        if !model_path.exists() {
            anyhow::bail!(
                "Whisper model not found: {:?}. Download from HuggingFace.",
                model_path
            );
        }

        let input = audio_path.to_string_lossy().to_string();
        let model_str = model_path.to_string_lossy().to_string();
        // Output base path (whisper adds .srt extension)
        let output_base = audio_path
            .with_extension("")
            .to_string_lossy()
            .to_string();

        let mut args = vec![
            "-m".to_string(),
            model_str,
            "-f".to_string(),
            input,
            "--output-srt".to_string(),
            "--output-file".to_string(),
            output_base.clone(),
        ];

        if let Some(lang) = language {
            args.extend(["-l".to_string(), lang.to_string()]);
        }

        let output = Command::new(&self.binary_path)
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await
            .context("Failed to run whisper")?;

        if !output.status.success() {
            let stderr =
                String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("Whisper failed: {}", stderr);
        }

        // Parse the generated SRT file
        let srt_path = format!("{}.srt", output_base);
        let srt_content = tokio::fs::read_to_string(&srt_path)
            .await
            .context("Failed to read generated SRT")?;

        let segments = parse_srt(&srt_content);

        // Detect language from stderr output
        let stderr_str =
            String::from_utf8_lossy(&output.stderr);
        let detected_lang = extract_detected_language(&stderr_str)
            .unwrap_or_else(|| "unknown".to_string());

        let duration_ms =
            segments.last().map(|s| s.end_ms).unwrap_or(0);

        Ok(TranscriptionResult {
            segments,
            language: detected_lang,
            duration_ms,
        })
    }

    /// Check if whisper binary is accessible
    pub async fn check_available(&self) -> bool {
        self.binary_path.exists()
    }

    /// Generate SRT file from subtitle segments
    pub fn write_srt(
        segments: &[SubtitleSegment],
        output_path: &Path,
    ) -> Result<()> {
        use std::io::Write;
        let mut file = std::fs::File::create(output_path)
            .context("Failed to create SRT file")?;

        for seg in segments {
            let start = format_srt_timestamp(seg.start_ms);
            let end = format_srt_timestamp(seg.end_ms);

            writeln!(file, "{}", seg.index)?;
            writeln!(file, "{} --> {}", start, end)?;
            writeln!(file, "{}", seg.text)?;
            writeln!(file)?;
        }

        Ok(())
    }
}

/// Format milliseconds as SRT timestamp: HH:MM:SS,mmm
fn format_srt_timestamp(ms: u64) -> String {
    let hours = ms / 3_600_000;
    let minutes = (ms % 3_600_000) / 60_000;
    let seconds = (ms % 60_000) / 1_000;
    let millis = ms % 1_000;
    format!(
        "{:02}:{:02}:{:02},{:03}",
        hours, minutes, seconds, millis
    )
}

/// Parse SRT content into SubtitleSegments
fn parse_srt(content: &str) -> Vec<SubtitleSegment> {
    let mut segments = Vec::new();
    let mut lines = content.lines().peekable();

    while let Some(line) = lines.next() {
        let line = line.trim();

        // Parse index number
        let index: u32 = match line.parse() {
            Ok(n) => n,
            Err(_) => continue,
        };

        // Parse timestamp line: "00:00:01,000 --> 00:00:03,500"
        let ts_line = match lines.next() {
            Some(l) => l.trim(),
            None => break,
        };

        let (start_ms, end_ms) = match parse_srt_timestamps(ts_line)
        {
            Some(ts) => ts,
            None => continue,
        };

        // Collect text lines until empty line
        let mut text_parts = Vec::new();
        while let Some(text_line) = lines.peek() {
            let text_line = text_line.trim();
            if text_line.is_empty() {
                lines.next();
                break;
            }
            text_parts.push(text_line.to_string());
            lines.next();
        }

        let text = text_parts.join(" ");
        if text.is_empty() {
            continue;
        }
        segments.push(SubtitleSegment {
            index,
            start_ms,
            end_ms,
            text,
        });
    }

    segments
}

/// Parse "HH:MM:SS,mmm --> HH:MM:SS,mmm" into (start_ms, end_ms)
fn parse_srt_timestamps(line: &str) -> Option<(u64, u64)> {
    let parts: Vec<&str> = line.split("-->").collect();
    if parts.len() != 2 {
        return None;
    }
    let start = parse_timestamp(parts[0].trim())?;
    let end = parse_timestamp(parts[1].trim())?;
    Some((start, end))
}

fn parse_timestamp(ts: &str) -> Option<u64> {
    // Format: HH:MM:SS,mmm
    let ts = ts.replace(',', ".");
    let parts: Vec<&str> = ts.split(':').collect();
    if parts.len() != 3 {
        return None;
    }
    let hours: u64 = parts[0].parse().ok()?;
    let minutes: u64 = parts[1].parse().ok()?;
    let sec_parts: Vec<&str> = parts[2].split('.').collect();
    let seconds: u64 = sec_parts[0].parse().ok()?;
    let millis: u64 = sec_parts
        .get(1)
        .and_then(|m| m.parse().ok())
        .unwrap_or(0);

    Some(
        hours * 3_600_000
            + minutes * 60_000
            + seconds * 1_000
            + millis,
    )
}

/// Extract detected language from whisper stderr output
fn extract_detected_language(stderr: &str) -> Option<String> {
    // whisper.cpp logs: "auto-detected language: en (p = 0.97)"
    for line in stderr.lines() {
        if line.contains("auto-detected language:") {
            let lang = line
                .split(':')
                .nth(1)?
                .trim()
                .split_whitespace()
                .next()?;
            return Some(lang.to_string());
        }
    }
    None
}
