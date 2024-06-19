// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    // The app identifier must match the identifier in info.plist
    let app_identifier = "dev.tauri-poc.pat";
    let url_schema = "algokit-lora";
    let window_title = "main";

    tauri_plugin_deep_link::prepare(app_identifier);

    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "macos")]
            register_deep_link_mac(app, url_schema, window_title);

            #[cfg(not(target_os = "macos"))]
            register_deep_link_windows_linux(app, url_schema, window_title);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(target_os = "macos")]
fn register_deep_link_mac(app: &mut tauri::App, url_schema: &str, window_title: &str) {
    let handle: tauri::AppHandle = app.handle();
    let window: tauri::Window = app.get_window(window_title).unwrap();

    tauri_plugin_deep_link::register(url_schema, move |request| {
        // On macOS, tauri_plugin_deep_link handles the start up scenario for us.
        // But that also means when a deep link is triggered, we don't know if the app is opened or not
        // Therefore, we set the window.deepLink property as well as emit the event
        let _ = window.eval(format!("window.deepLink='{}'", request).as_str());
        handle.emit_all("deep-link-received", request).unwrap();
    })
    .unwrap();
}

#[cfg(not(target_os = "macos"))]
fn register_deep_link_windows_linux(app: &mut tauri::App, url_schema: &str, window_title: &str) {
    let handle: tauri::AppHandle = app.handle();
    let window: tauri::Window = app.get_window(window_title).unwrap();

    tauri_plugin_deep_link::register(url_schema, move |request| {
        handle.emit_all("deep-link-received", request).unwrap();
    })
    .unwrap();

    // On Windows and Linux, when the user uses deep link to open the app, the URL is passed in as a command line argument.
    // We set the window.deepLink property so that the frontend can read it.
    if let Some(url) = std::env::args().nth(1) {
        let _ = window.eval(format!("window.deepLink='{}'", url).as_str());
    }
}
