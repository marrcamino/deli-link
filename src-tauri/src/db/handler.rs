use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::str::FromStr;
use tauri::{AppHandle, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};

pub async fn get_pool(app: &AppHandle) -> Result<SqlitePool, String> {
    // Resolve path
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    // Ensure directory exists
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

    let db_path = app_dir.join("database.sqlite");
    let db_url = format!("sqlite:{}", db_path.to_str().ok_or("Invalid path")?);

    // Create options with a busy timeout (5 seconds)
    // This prevents "database is locked" errors during rapid operations
    let options = SqliteConnectOptions::from_str(&db_url)
        .map_err(|e| e.to_string())?
        .busy_timeout(std::time::Duration::from_secs(5))
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(options)
        .await
        .map_err(|e| e.to_string())?;

    Ok(pool)
}

pub fn get_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "initial_setup",
        sql: include_str!("./migrations/001.sql"),
        kind: MigrationKind::Up,
    }]
}
