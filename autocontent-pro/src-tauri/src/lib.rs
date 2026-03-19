mod commands;
mod db;
mod models;
mod services;

use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt::init();

    // Initialize batch queue manager
    let (batch_manager, batch_rx) =
        services::batch_manager::BatchManager::new();
    let batch_manager = Arc::new(batch_manager);

    let dispatcher_manager = batch_manager.clone();

    tauri::Builder::default()
        .manage(batch_manager)
        .plugin(
            tauri_plugin_store::Builder::default().build(),
        )
        .plugin(
            tauri_plugin_sql::Builder::default().build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .setup(move |_app| {
            // Spawn job dispatcher background task
            let dispatcher =
                services::job_dispatcher::JobDispatcher::new(
                    dispatcher_manager,
                );
            tokio::spawn(async move {
                dispatcher.run(batch_rx).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::veo3::veo3_generate_video,
            commands::veo3::veo3_list_history,
            commands::accounts::add_account_oauth,
            commands::accounts::list_accounts,
            commands::accounts::remove_account,
            commands::accounts::set_api_key,
            commands::accounts::get_active_account,
            commands::video::process_video,
            commands::video::get_video_info,
            commands::drive::drive_upload,
            commands::drive::drive_list_files,
            commands::drive::drive_delete_file,
            commands::subtitle::transcribe_video,
            commands::subtitle::save_srt,
            commands::subtitle::burn_subtitles,
            commands::batch::batch_create,
            commands::batch::batch_start,
            commands::batch::batch_pause,
            commands::batch::batch_resume,
            commands::batch::batch_cancel_job,
            commands::batch::batch_cancel_batch,
            commands::batch::batch_retry_job,
            commands::batch::batch_get_status,
            commands::batch::batch_get_jobs,
            commands::batch::batch_get_all_jobs,
            commands::browser::browser_launch_capture,
            commands::browser::browser_screenshot,
            commands::browser::browser_test_proxy,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
