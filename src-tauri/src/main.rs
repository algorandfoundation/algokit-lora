// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    // The app identifier must match the identifier in info.plist
    let app_identifier = "dev.tauri-poc.pat";
    let url_schema = "algokit-explorer";
    let window_title = "main";

    tauri_plugin_deep_link::prepare(app_identifier);

    tauri::Builder::default()
        .setup(|app| {
            let handle: tauri::AppHandle = app.handle();
            let window = app.get_window(window_title).unwrap();

            tauri_plugin_deep_link::register(url_schema, move |request| {
                dbg!(&request);
                // set window.deepLink here as well because the macOS plugin handles it
                let _ = window.eval(format!("window.deepLink='{}'", request).as_str());
                handle.emit_all("deep-link-received", request).unwrap();
            })
            .unwrap();

            // Handle the url scheme request on startup for non macOS.
            // On macOS the plugin handles this because it doesn't use cli args for the url.
            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                let _ = window.eval(format!("window.deepLink='{}'", url).as_str());
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
