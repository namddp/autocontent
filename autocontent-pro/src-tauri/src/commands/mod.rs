pub mod accounts;
pub mod subtitle;
pub mod veo3;
pub mod video;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! AutoContent Pro is running.", name)
}
