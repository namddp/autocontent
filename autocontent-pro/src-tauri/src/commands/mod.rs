/// IPC command handlers for frontend communication
/// Each submodule will be added as features are implemented

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! AutoContent Pro is running.", name)
}
