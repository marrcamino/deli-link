use crate::db;
use crate::models::DbResponse;
use serde::Deserialize;
use tauri::AppHandle;

#[derive(Debug, Deserialize)]
pub struct MachineUserLog {
    pub user_fk: i32,
    pub date: String,
    pub time: String,
}

#[tauri::command]
pub async fn save_logs(
    app: AppHandle,
    month: String,
    year: String,
    logs: Vec<MachineUserLog>,
) -> Result<DbResponse, String> {
    let mut tx = db::begin_tx(&app).await?;

    // 1. Delete Old Logs and capture the result
    let delete_result =
        sqlx::query("DELETE FROM log WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?")
            .bind(&month)
            .bind(&year)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

    // Check if any rows were actually deleted
    let old_logs_overridden = delete_result.rows_affected() > 0;

    // 2. Insert New Logs
    for log in logs {
        sqlx::query("INSERT INTO log (user_fk, date, time) VALUES (?, ?, ?)")
            .bind(log.user_fk)
            .bind(&log.date)
            .bind(&log.time)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
    }

    // 3. Commit the transaction
    tx.commit().await.map_err(|e| e.to_string())?;

    // 4. Construct the dynamic message
    let base_message = "Logs Saved Successfully!";
    let final_message = if old_logs_overridden {
        format!("{} Old logs were overridden.", base_message)
    } else {
        base_message.to_string()
    };

    Ok(DbResponse {
        success: true,
        message: final_message,
    })
}
