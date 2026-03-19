/// Image Upload Handler — Read, validate, and base64-encode images for Gemini API
use anyhow::{bail, Context, Result};
use base64::Engine;
use std::path::Path;

use crate::models::video_job::InlineImageData;

const MAX_IMAGE_SIZE_BYTES: u64 = 20 * 1024 * 1024; // 20MB
const SUPPORTED_MIME_TYPES: &[&str] = &["image/jpeg", "image/png", "image/webp"];

/// Read image file, validate size/format, return base64-encoded data + mime type
pub async fn read_and_encode_image(path: &Path) -> Result<InlineImageData> {
    // Validate file exists
    if !path.exists() {
        bail!("Image file not found: {}", path.display());
    }

    // Check file size
    let metadata = tokio::fs::metadata(path)
        .await
        .context("Failed to read image metadata")?;

    if metadata.len() > MAX_IMAGE_SIZE_BYTES {
        bail!(
            "Image too large: {}MB (max {}MB)",
            metadata.len() / (1024 * 1024),
            MAX_IMAGE_SIZE_BYTES / (1024 * 1024)
        );
    }

    // Detect MIME type from extension
    let mime_type = detect_mime_type(path)?;

    // Read and encode
    let bytes = tokio::fs::read(path)
        .await
        .context("Failed to read image file")?;

    let base64_data = base64::engine::general_purpose::STANDARD.encode(&bytes);

    Ok(InlineImageData {
        base64_data,
        mime_type,
    })
}

/// Detect MIME type from file extension
fn detect_mime_type(path: &Path) -> Result<String> {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let mime = match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "webp" => "image/webp",
        other => bail!(
            "Unsupported image format '.{}'. Supported: {}",
            other,
            SUPPORTED_MIME_TYPES.join(", ")
        ),
    };

    Ok(mime.to_string())
}
