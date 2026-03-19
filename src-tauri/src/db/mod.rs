use sqlx::{Pool, Sqlite, Transaction};
use tauri::AppHandle;

pub async fn begin_tx(app: &AppHandle) -> Result<Transaction<'_, Sqlite>, String> {
    let pool: Pool<Sqlite> = crate::db::handler::get_pool(app).await?;
    let tx: Transaction<'_, Sqlite> = pool.begin().await.map_err(|e: sqlx::Error| e.to_string())?;
    Ok(tx)
}

pub mod handler;
