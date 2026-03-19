mod commands;
mod db;
mod models;

use crate::db::handler::get_migrations;
use tauri_plugin_sql::Builder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            Builder::default()
                .add_migrations("sqlite:database.sqlite", get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::logs::save_logs,
            commands::leave::save_leave_application
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
