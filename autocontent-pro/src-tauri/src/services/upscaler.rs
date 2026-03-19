use anyhow::{Context, Result};
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::Command;

pub struct UpscalerService {
    binary_path: PathBuf,
    models_dir: PathBuf,
}

impl UpscalerService {
    pub fn new(binary_path: PathBuf, models_dir: PathBuf) -> Self {
        Self {
            binary_path,
            models_dir,
        }
    }

    /// Upscale a single PNG frame with RealESRGAN
    pub async fn upscale_frame(
        &self,
        input_path: &Path,
        output_path: &Path,
        scale: u8,
        model: &str,
    ) -> Result<()> {
        let input = input_path.to_string_lossy().to_string();
        let output = output_path.to_string_lossy().to_string();
        let models = self.models_dir.to_string_lossy().to_string();
        let scale_str = scale.to_string();

        let status = Command::new(&self.binary_path)
            .args([
                "-i", &input, "-o", &output, "-n", model, "-s",
                &scale_str, "-m", &models, "-g", "auto", "-f", "png",
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .status()
            .await
            .context("Failed to execute RealESRGAN")?;

        if !status.success() {
            anyhow::bail!(
                "RealESRGAN upscaling failed for {:?}",
                input_path
            );
        }

        Ok(())
    }

    /// Upscale all PNG frames in input_dir -> output_dir
    pub async fn upscale_directory(
        &self,
        input_dir: &Path,
        output_dir: &Path,
        scale: u8,
        model: &str,
        progress_callback: impl Fn(u32, u32) + Send,
    ) -> Result<u32> {
        tokio::fs::create_dir_all(output_dir).await?;

        let mut frames: Vec<PathBuf> = Vec::new();
        let mut entries = tokio::fs::read_dir(input_dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.extension().map_or(false, |e| e == "png") {
                frames.push(path);
            }
        }
        frames.sort();

        let total = frames.len() as u32;

        for (idx, frame_path) in frames.iter().enumerate() {
            let filename = frame_path
                .file_name()
                .context("Invalid frame filename")?;
            let output_path = output_dir.join(filename);

            self.upscale_frame(frame_path, &output_path, scale, model)
                .await?;

            progress_callback((idx + 1) as u32, total);
        }

        Ok(total)
    }

    /// Check if RealESRGAN binary is accessible
    pub async fn check_available(&self) -> bool {
        Command::new(&self.binary_path)
            .arg("-h")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .await
            .map(|s: std::process::ExitStatus| s.success())
            .unwrap_or(false)
    }
}
