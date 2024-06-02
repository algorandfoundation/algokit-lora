// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri_plugin_deep_link::prepare("dev.tauri-poc.pat");

    tauri::Builder::default()
        .setup(|app| {
          // If you need macOS support this must be called in .setup() !
          // Otherwise this could be called right after prepare() but then you don't have access to tauri APIs
          let handle: tauri::AppHandle = app.handle();
          let window = app.get_window("main").unwrap();

          tauri_plugin_deep_link::register(
            "algokit-explorer",
            move |request| {
              dbg!(&request);
              let _ = window.eval(format!("window.urlSchemeRequest='{}'", request).as_str());
              handle.emit_all("scheme-request-received", request).unwrap();
            },
          )
          .unwrap(/* If listening to the scheme is optional for your app, you don't want to unwrap here. */);

          // If you also need the url when the primary instance was started by the custom scheme, you currently have to read it yourself

          #[cfg(not(target_os = "macos"))] // on macos the plugin handles this (macos doesn't use cli args for the url)
          if let Some(url) = std::env::args().nth(1) {
            let _ = window.eval(format!("window.urlSchemeRequest='{}'", url).as_str());
            app.emit_all("scheme-request-received", url).unwrap();
          }

          Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
