use crate::db;
use crate::models::DbResponseWithData;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Deserialize, Serialize)] // Added Serialize
pub struct LeaveApplication {
    pub leave_pk: i64, // Add this
    pub user_fk: i32,
    pub date_file: String,
    pub is_approved: i32,
    pub created_at: String,
}

#[derive(Debug, Deserialize, Serialize)] // Added Serialize
pub struct LeaveDate {
    pub date_record_pk: i64, // Add this
    pub leave_fk: i64,       // Add this
    pub date_value: String,
}

#[derive(Serialize)]
pub struct LeaveWithChildren {
    pub application: LeaveApplication,
    pub dates: Vec<LeaveDate>,
}

#[tauri::command]
pub async fn save_leave_application(
    app: AppHandle,
    mut leave: LeaveApplication, // Mutable to update leave_pk
    mut dates: Vec<LeaveDate>,   // Mutable to update leave_fk
) -> Result<DbResponseWithData<LeaveWithChildren>, String> {
    let mut tx = db::begin_tx(&app).await?;

    // 1. INSERT APPLICATION
    let leave_insert_result = sqlx::query(
        "INSERT INTO leave_application (user_fk, date_file, is_approved, created_at) VALUES (?, ?, ?, ?)"
    )
    .bind(&leave.user_fk)
    .bind(&leave.date_file)
    .bind(&leave.is_approved)
    .bind(&leave.created_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Get the new PK and update the local struct
    let leave_pk = leave_insert_result.last_insert_rowid();
    leave.leave_pk = leave_pk as i64;

    // 2. INSERT DATES
    for date in &mut dates {
        date.leave_fk = leave.leave_pk; // Assign the parent FK

        let date_insert_result =
            sqlx::query("INSERT INTO leave_date (leave_fk, date_value) VALUES (?, ?)")
                .bind(&date.leave_fk)
                .bind(&date.date_value)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;

        // Update the child PK
        date.date_record_pk = date_insert_result.last_insert_rowid() as i64;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(DbResponseWithData {
        success: true,
        message: "Leave Added Successfully".to_string(),
        data: LeaveWithChildren {
            application: leave,
            dates,
        },
    })
}
