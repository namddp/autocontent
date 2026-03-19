use anyhow::{bail, Context, Result};
use reqwest::Client;
use std::path::Path;
use tokio::fs::File;
use tokio::io::AsyncReadExt;

use crate::models::video_job::DriveFile;

const DRIVE_UPLOAD_URL: &str =
    "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_API_URL: &str =
    "https://www.googleapis.com/drive/v3/files";
/// 5MB chunks for resumable upload
const CHUNK_SIZE: usize = 5 * 1024 * 1024;

/// Google Drive API client using reqwest (lightweight, no google-drive3 crate)
pub struct DriveClient {
    client: Client,
    access_token: String,
}

impl DriveClient {
    pub fn new(access_token: String) -> Self {
        Self {
            client: Client::new(),
            access_token,
        }
    }

    /// Create a folder on Drive, returns folder ID
    pub async fn create_folder(
        &self,
        name: &str,
        parent_id: Option<&str>,
    ) -> Result<String> {
        let mut metadata = serde_json::json!({
            "name": name,
            "mimeType": "application/vnd.google-apps.folder"
        });
        if let Some(parent) = parent_id {
            metadata["parents"] = serde_json::json!([parent]);
        }

        let response = self
            .client
            .post(DRIVE_API_URL)
            .bearer_auth(&self.access_token)
            .json(&metadata)
            .send()
            .await
            .context("Failed to create folder")?;

        if !response.status().is_success() {
            let err = response.text().await.unwrap_or_default();
            bail!("Create folder failed: {}", err);
        }

        let result: serde_json::Value = response.json().await?;
        Ok(result["id"]
            .as_str()
            .unwrap_or_default()
            .to_string())
    }

    /// Find folder by name, or create if not exists
    pub async fn find_or_create_folder(
        &self,
        name: &str,
        parent_id: Option<&str>,
    ) -> Result<String> {
        let query = format!(
            "name='{}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            name.replace('\'', "\\'")
        );

        let url = format!(
            "{}?q={}&fields=files(id,name)",
            DRIVE_API_URL,
            urlencoding::encode(&query)
        );

        let response = self
            .client
            .get(&url)
            .bearer_auth(&self.access_token)
            .send()
            .await?;

        if !response.status().is_success() {
            let err = response.text().await.unwrap_or_default();
            bail!("Folder search failed: {}", err);
        }

        let result: serde_json::Value = response.json().await?;
        if let Some(files) = result["files"].as_array() {
            if let Some(folder) = files.first() {
                return Ok(folder["id"]
                    .as_str()
                    .unwrap_or_default()
                    .to_string());
            }
        }

        self.create_folder(name, parent_id).await
    }

    /// Resumable upload with progress callback
    pub async fn upload_file_resumable(
        &self,
        file_path: &Path,
        folder_id: &str,
        on_progress: impl Fn(u64, u64) + Send,
    ) -> Result<DriveFile> {
        let file_name = file_path
            .file_name()
            .context("Invalid file name")?
            .to_string_lossy();

        let file_size =
            tokio::fs::metadata(file_path).await?.len();
        let mime_type = mime_guess::from_path(file_path)
            .first_or_octet_stream()
            .to_string();

        // Step 1: Initiate resumable upload session
        let metadata = serde_json::json!({
            "name": file_name.as_ref(),
            "parents": [folder_id]
        });

        let init_response = self
            .client
            .post(&format!(
                "{}?uploadType=resumable",
                DRIVE_UPLOAD_URL
            ))
            .bearer_auth(&self.access_token)
            .header("Content-Type", "application/json")
            .header("X-Upload-Content-Type", &mime_type)
            .header("X-Upload-Content-Length", file_size)
            .json(&metadata)
            .send()
            .await
            .context("Failed to initiate upload")?;

        if !init_response.status().is_success() {
            let err =
                init_response.text().await.unwrap_or_default();
            bail!("Upload initiation failed: {}", err);
        }

        let upload_uri = init_response
            .headers()
            .get("location")
            .context("No upload URI in response")?
            .to_str()
            .context("Invalid upload URI")?
            .to_string();

        // Step 2: Upload in chunks with retry
        let mut file = File::open(file_path).await?;
        let mut bytes_sent: u64 = 0;
        let mut buffer = vec![0u8; CHUNK_SIZE];
        const MAX_RETRIES: u32 = 3;

        loop {
            let bytes_read = file.read(&mut buffer).await?;
            if bytes_read == 0 {
                break;
            }

            let chunk = buffer[..bytes_read].to_vec();
            let range_end = bytes_sent + bytes_read as u64 - 1;
            let content_range = format!(
                "bytes {}-{}/{}",
                bytes_sent, range_end, file_size
            );

            // Retry loop per chunk
            let mut last_err = String::new();
            let mut success = false;
            for attempt in 0..MAX_RETRIES {
                if attempt > 0 {
                    tokio::time::sleep(std::time::Duration::from_secs(
                        1 << attempt,
                    ))
                    .await;
                }

                let resp = self
                    .client
                    .put(&upload_uri)
                    .header("Content-Range", &content_range)
                    .header("Content-Length", bytes_read)
                    .body(chunk.clone())
                    .send()
                    .await;

                let chunk_response = match resp {
                    Ok(r) => r,
                    Err(e) => {
                        last_err = e.to_string();
                        continue;
                    }
                };

                // Final chunk returns 200 with file metadata
                if chunk_response.status().is_success() {
                    bytes_sent += bytes_read as u64;
                    on_progress(bytes_sent, file_size);
                    let result: serde_json::Value =
                        chunk_response.json().await?;
                    return Ok(parse_drive_file(
                        &result, file_size,
                    ));
                }

                // 308 Resume Incomplete = chunk accepted
                if chunk_response.status().as_u16() == 308 {
                    bytes_sent += bytes_read as u64;
                    on_progress(bytes_sent, file_size);
                    success = true;
                    break;
                }

                last_err = chunk_response
                    .text()
                    .await
                    .unwrap_or_default();
            }

            if !success && !last_err.is_empty() {
                bail!(
                    "Upload chunk failed after {} retries: {}",
                    MAX_RETRIES,
                    last_err
                );
            }
        }

        bail!("Upload completed but no response received")
    }

    /// List files in a Drive folder
    pub async fn list_files(
        &self,
        folder_id: &str,
    ) -> Result<Vec<DriveFile>> {
        let query = format!(
            "'{}' in parents and trashed=false",
            folder_id
        );
        let url = format!(
            "{}?q={}&fields=files(id,name,mimeType,size,webViewLink,createdTime)&orderBy=createdTime desc",
            DRIVE_API_URL,
            urlencoding::encode(&query)
        );

        let response = self
            .client
            .get(&url)
            .bearer_auth(&self.access_token)
            .send()
            .await?;

        if !response.status().is_success() {
            let err = response.text().await.unwrap_or_default();
            bail!("List files failed: {}", err);
        }

        let result: serde_json::Value = response.json().await?;
        let files = result["files"]
            .as_array()
            .map(|arr| {
                arr.iter()
                    .map(|f| parse_drive_file(f, 0))
                    .collect()
            })
            .unwrap_or_default();

        Ok(files)
    }

    /// Delete a file by ID
    pub async fn delete_file(
        &self,
        file_id: &str,
    ) -> Result<()> {
        let url = format!("{}/{}", DRIVE_API_URL, file_id);
        let response = self
            .client
            .delete(&url)
            .bearer_auth(&self.access_token)
            .send()
            .await?;

        if !response.status().is_success() {
            bail!(
                "Delete failed: {}",
                response.text().await.unwrap_or_default()
            );
        }
        Ok(())
    }
}

/// Parse Drive API JSON response into DriveFile struct
fn parse_drive_file(
    f: &serde_json::Value,
    fallback_size: u64,
) -> DriveFile {
    DriveFile {
        id: f["id"].as_str().unwrap_or_default().to_string(),
        name: f["name"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        mime_type: f["mimeType"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        size: f["size"]
            .as_str()
            .and_then(|s| s.parse().ok())
            .or(if fallback_size > 0 {
                Some(fallback_size)
            } else {
                None
            }),
        web_view_link: f["webViewLink"]
            .as_str()
            .map(|s| s.to_string()),
        created_time: f["createdTime"]
            .as_str()
            .map(|s| s.to_string()),
    }
}
