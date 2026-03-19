use crate::models::video_job::{DriveFile, UploadProgress};
use crate::services::drive_client::DriveClient;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};

#[tauri::command]
pub async fn drive_upload(
    app: AppHandle,
    access_token: String,
    file_path: String,
    folder_name: String,
) -> Result<DriveFile, String> {
    let client = DriveClient::new(access_token);

    // Create/find folder
    let folder_id = client
        .find_or_create_folder(&folder_name, None)
        .await
        .map_err(|e| e.to_string())?;

    // Upload with progress events
    let app_clone = app.clone();
    let file_name = PathBuf::from(&file_path)
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let result = client
        .upload_file_resumable(
            &PathBuf::from(&file_path),
            &folder_id,
            move |sent, total| {
                let _ = app_clone.emit(
                    "drive:upload_progress",
                    UploadProgress {
                        file_name: file_name.clone(),
                        bytes_sent: sent,
                        total_bytes: total,
                        percent: (sent as f32 / total as f32)
                            * 100.0,
                    },
                );
            },
        )
        .await
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub async fn drive_list_files(
    access_token: String,
    folder_name: String,
) -> Result<Vec<DriveFile>, String> {
    let client = DriveClient::new(access_token);

    let folder_id = client
        .find_or_create_folder(&folder_name, None)
        .await
        .map_err(|e| e.to_string())?;

    client
        .list_files(&folder_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn drive_delete_file(
    access_token: String,
    file_id: String,
) -> Result<(), String> {
    let client = DriveClient::new(access_token);
    client
        .delete_file(&file_id)
        .await
        .map_err(|e| e.to_string())
}
