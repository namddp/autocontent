pub mod accounts;
pub mod veo3;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! AutoContent Pro is running.", name)
}
