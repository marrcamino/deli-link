use crate::db;
use crate::db::handler::get_pool;
use crate::models::DbResponseWithData;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct LeaveApplication {
    pub leave_pk: Option<i64>,
    pub user_fk: i32,
    pub date_file: String,
    pub leave_type: String,
    pub is_approved: i32,
    pub created_at: String,
}

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct LeaveDate {
    pub leave_date_pk: Option<i64>,
    pub leave_fk: Option<i64>,
    pub date_value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LeaveWithChildren {
    #[serde(flatten)]
    pub leave: LeaveApplication,
    pub dates: Vec<LeaveDate>,
}

#[tauri::command]
pub async fn save_leave_application(
    app: AppHandle,
    mut leave: LeaveApplication,
    mut dates: Vec<LeaveDate>,
) -> Result<DbResponseWithData<LeaveWithChildren>, String> {
    let mut tx = db::begin_tx(&app).await?;

    // 1. INSERT APPLICATION
    let leave_insert_result = sqlx::query(
        "INSERT INTO leave_application (user_fk, date_file, leave_type, is_approved, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&leave.user_fk)
    .bind(&leave.date_file)
    .bind(&leave.leave_type)
    .bind(&leave.is_approved)
    .bind(&leave.created_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Get the new PK and update the local struct
    let leave_pk = leave_insert_result.last_insert_rowid();
    leave.leave_pk = Some(leave_pk as i64);

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
        date.leave_date_pk = Some(date_insert_result.last_insert_rowid() as i64);
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(DbResponseWithData {
        success: true,
        message: "Leave succesfully saved".to_string(),
        data: LeaveWithChildren { leave, dates },
    })
}

#[tauri::command]
pub async fn update_leave_application(
    app: AppHandle,
    leave: LeaveWithChildren,
    new_dates: Vec<String>,
) -> Result<DbResponseWithData<LeaveWithChildren>, String> {
    let mut tx = crate::db::begin_tx(&app).await?;

    let leave_pk = leave
        .leave
        .leave_pk
        .ok_or("Cannot update a leave application without a valid ID")?;

    // 1. UPDATE APPLICATION
    sqlx::query("UPDATE leave_application SET date_file = ?, leave_type = ?,  is_approved = ? WHERE leave_pk = ?")
        .bind(&leave.leave.date_file)
        .bind(&leave.leave.leave_type)
        .bind(&leave.leave.is_approved)
        .bind(leave_pk)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // 2. SYNC DATES
    let existing_date_strings: Vec<String> =
        leave.dates.iter().map(|d| d.date_value.clone()).collect();

    for old_date in &leave.dates {
        if !new_dates.contains(&old_date.date_value) {
            sqlx::query("DELETE FROM leave_date WHERE leave_date_pk = ?")
                .bind(old_date.leave_date_pk)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
        }
    }

    for date_str in &new_dates {
        if !existing_date_strings.contains(date_str) {
            sqlx::query("INSERT INTO leave_date (leave_fk, date_value) VALUES (?, ?)")
                .bind(leave_pk)
                .bind(date_str)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    // 3. RE-FETCH FRESH DATA
    let pool = get_pool(&app).await.map_err(|e| e.to_string())?;

    let updated_leave = sqlx::query_as::<sqlx::Sqlite, LeaveApplication>(
        "SELECT * FROM leave_application WHERE leave_pk = ?",
    )
    .bind(leave_pk)
    .fetch_one(&pool)
    .await
    .map_err(|e: sqlx::Error| e.to_string())?;

    let updated_dates =
        sqlx::query_as::<sqlx::Sqlite, LeaveDate>("SELECT * FROM leave_date WHERE leave_fk = ?")
            .bind(leave_pk)
            .fetch_all(&pool)
            .await
            .map_err(|e: sqlx::Error| e.to_string())?;

    Ok(DbResponseWithData {
        success: true,
        message: "Leave successfully updated".to_string(),
        data: LeaveWithChildren {
            leave: updated_leave,
            dates: updated_dates,
        },
    })
}
