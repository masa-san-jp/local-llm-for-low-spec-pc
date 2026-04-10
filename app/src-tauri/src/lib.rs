/// Returns the project root directory (two levels above src-tauri/).
/// Uses CARGO_MANIFEST_DIR which is resolved at compile time.
#[tauri::command]
fn project_root() -> String {
    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    // CARGO_MANIFEST_DIR = .../app/src-tauri
    // parent()           = .../app
    // parent().parent()  = project root
    manifest_dir
        .parent()
        .and_then(|p| p.parent())
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| env!("CARGO_MANIFEST_DIR").to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![project_root])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
