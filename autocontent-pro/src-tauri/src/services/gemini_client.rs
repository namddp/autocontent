use anyhow::{bail, Context, Result};
use reqwest::Client;
use std::path::{Path, PathBuf};
use std::time::Duration;
use tokio::time::sleep;

use crate::models::video_job::*;
use crate::services::image_upload_handler;

const GEMINI_BASE_URL: &str = "https://generativelanguage.googleapis.com/v1beta";
const POLL_INTERVAL: Duration = Duration::from_secs(3);
const MAX_POLL_ATTEMPTS: u32 = 100; // ~5 min at 3s interval

pub struct GeminiClient {
    client: Client,
    api_key: String,
}

impl GeminiClient {
    pub fn new(api_key: String) -> Result<Self> {
        let client = Client::builder()
            .connect_timeout(Duration::from_secs(15))
            .timeout(Duration::from_secs(300))
            .build()
            .context("Failed to create HTTP client")?;

        Ok(Self { client, api_key })
    }

    /// Build the generate URL for a given model
    fn generate_url(config: &GenerationConfig) -> String {
        let model = match config.mode {
            GenerationMode::Fast => "veo-3.1-generate-fast",
            GenerationMode::Standard => "veo-3.1-generate",
        };
        format!("{}/models/{}:generateContent", GEMINI_BASE_URL, model)
    }

    /// Submit video generation request, returns operation name
    pub async fn submit_generation(
        &self,
        prompt: &str,
        config: &GenerationConfig,
    ) -> Result<String> {
        let url = Self::generate_url(config);

        let body = serde_json::json!({
            "contents": [{
                "parts": [{ "text": prompt }]
            }],
            "generationConfig": {
                "responseModalities": ["video"],
                "videoDuration": config.duration,
            }
        });

        let response = self
            .client
            .post(&url)
            .header("x-goog-api-key", &self.api_key)
            .json(&body)
            .send()
            .await
            .context("Failed to send generation request")?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            bail!("Gemini API error: {}", error_text);
        }

        let result: GeminiGenerateResponse = response
            .json()
            .await
            .context("Failed to parse generation response")?;

        Ok(result.name)
    }

    /// Submit image-to-video generation (single image + prompt)
    pub async fn submit_image_to_video(
        &self,
        prompt: &str,
        image: &InlineImageData,
        config: &GenerationConfig,
    ) -> Result<String> {
        let url = Self::generate_url(config);

        let body = serde_json::json!({
            "contents": [{
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": image.mime_type,
                            "data": image.base64_data,
                        }
                    },
                    { "text": prompt }
                ]
            }],
            "generationConfig": {
                "responseModalities": ["video"],
                "videoDuration": config.duration,
            }
        });

        let response = self
            .client
            .post(&url)
            .header("x-goog-api-key", &self.api_key)
            .json(&body)
            .send()
            .await
            .context("Failed to send I2V generation request")?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            bail!("Gemini I2V API error: {}", error_text);
        }

        let result: GeminiGenerateResponse = response
            .json()
            .await
            .context("Failed to parse I2V response")?;

        Ok(result.name)
    }

    /// Submit clone video generation (first frame + last frame + optional prompt)
    pub async fn submit_clone_video(
        &self,
        prompt: Option<&str>,
        first_image: &InlineImageData,
        last_image: &InlineImageData,
        config: &GenerationConfig,
    ) -> Result<String> {
        let url = Self::generate_url(config);

        let mut parts = vec![
            serde_json::json!({
                "inlineData": {
                    "mimeType": first_image.mime_type,
                    "data": first_image.base64_data,
                }
            }),
            serde_json::json!({
                "inlineData": {
                    "mimeType": last_image.mime_type,
                    "data": last_image.base64_data,
                }
            }),
        ];

        if let Some(text) = prompt {
            if !text.is_empty() {
                parts.push(serde_json::json!({ "text": text }));
            }
        }

        let body = serde_json::json!({
            "contents": [{ "parts": parts }],
            "generationConfig": {
                "responseModalities": ["video"],
                "videoDuration": config.duration,
            }
        });

        let response = self
            .client
            .post(&url)
            .header("x-goog-api-key", &self.api_key)
            .json(&body)
            .send()
            .await
            .context("Failed to send clone generation request")?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            bail!("Gemini clone API error: {}", error_text);
        }

        let result: GeminiGenerateResponse = response
            .json()
            .await
            .context("Failed to parse clone response")?;

        Ok(result.name)
    }

    /// Poll operation status until done or timeout
    pub async fn poll_operation(
        &self,
        operation_name: &str,
    ) -> Result<GeminiOperationResponse> {
        let url = format!("{}/{}", GEMINI_BASE_URL, operation_name);

        for attempt in 0..MAX_POLL_ATTEMPTS {
            if attempt > 0 {
                sleep(POLL_INTERVAL).await;
            }

            let response = self
                .client
                .get(&url)
                .header("x-goog-api-key", &self.api_key)
                .send()
                .await
                .context("Failed to poll operation")?;

            let status = response.status();
            if !status.is_success() {
                let error_text = response.text().await.unwrap_or_default();
                bail!("Poll API error ({}): {}", status, error_text);
            }

            let op: GeminiOperationResponse = response
                .json()
                .await
                .context("Failed to parse operation response")?;

            if let Some(true) = op.done {
                return Ok(op);
            }

            if let Some(ref error) = op.error {
                bail!(
                    "Generation failed: {} (code {})",
                    error.message,
                    error.code
                );
            }

            tracing::info!(
                "Polling attempt {}/{}: operation not done yet",
                attempt + 1,
                MAX_POLL_ATTEMPTS
            );
        }

        bail!("Generation timed out after {} attempts", MAX_POLL_ATTEMPTS);
    }

    /// Download video from URL to local path
    pub async fn download_video(
        &self,
        video_uri: &str,
        output_dir: &Path,
        filename: &str,
    ) -> Result<PathBuf> {
        let output_path = output_dir.join(filename);

        let response = self
            .client
            .get(video_uri)
            .header("x-goog-api-key", &self.api_key)
            .send()
            .await
            .context("Failed to download video")?;

        if !response.status().is_success() {
            bail!(
                "Video download failed with status {}",
                response.status()
            );
        }

        let bytes = response
            .bytes()
            .await
            .context("Failed to read video bytes")?;

        tokio::fs::create_dir_all(output_dir)
            .await
            .context("Failed to create output directory")?;

        tokio::fs::write(&output_path, &bytes)
            .await
            .context("Failed to write video file")?;

        Ok(output_path)
    }
}
