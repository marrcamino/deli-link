use crate::db;
// use crate::db::handler::get_pool;
use crate::models::DbResponseWithData;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct PassSlip {
    pub pass_slip_pk: Option<i64>,
    pub user_fk: i32,
    pub slip_type: String,
    pub start_time: String,
    pub end_time: String,
    pub reason: String,
    pub signatory_fk: i32,
    pub is_approved: i32,
    pub filed_at: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct PassSlipDate {
    pub pass_slip_date_pk: Option<i64>,
    pub pass_slip_fk: Option<i64>,
    pub date_value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PassSlipWithChildren {
    #[serde(flatten)]
    pub pass_slip: PassSlip,
    pub dates: Vec<PassSlipDate>,
}

#[tauri::command]
pub async fn save_pass_slip(
    app: AppHandle,
    pass_slip: PassSlip,
    dates: Vec<PassSlipDate>,
) -> Result<DbResponseWithData<PassSlipWithChildren>, String> {
    let mut tx = db::begin_tx(&app).await?;

    // 1. INSERT PASS SLIP
    let inserted_pass_slip: PassSlip = sqlx::query_as(
        r#"
        INSERT INTO pass_slip (
            user_fk, slip_type, signatory_fk, is_approved, start_time, end_time, reason, filed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
        "#,
    )
    .bind(&pass_slip.user_fk)
    .bind(&pass_slip.slip_type)
    .bind(&pass_slip.signatory_fk)
    .bind(&pass_slip.is_approved)
    .bind(&pass_slip.start_time)
    .bind(&pass_slip.end_time)
    .bind(&pass_slip.reason)
    .bind(&pass_slip.filed_at)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    let pass_slip_pk = inserted_pass_slip
        .pass_slip_pk
        .ok_or_else(|| "Insert did not return pass_slip_pk".to_string())?;

    // 2. INSERT DATES
    let mut inserted_dates = Vec::with_capacity(dates.len());

    for date in &dates {
        let inserted_date: PassSlipDate = sqlx::query_as(
            r#"
            INSERT INTO pass_slip_date (pass_slip_fk, date_value)
            VALUES (?, ?)
            RETURNING *
            "#,
        )
        .bind(pass_slip_pk)
        .bind(&date.date_value)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        inserted_dates.push(inserted_date);
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(DbResponseWithData {
        success: true,
        message: "Pass slip successfully saved".to_string(),
        data: PassSlipWithChildren {
            pass_slip: inserted_pass_slip,
            dates: inserted_dates,
        },
    })
}

#[tauri::command]
pub async fn update_pass_slip(
    app: AppHandle,
    pass_slip: PassSlip,
    dates: Vec<PassSlipDate>,
) -> Result<DbResponseWithData<PassSlipWithChildren>, String> {
    let pass_slip_pk = pass_slip
        .pass_slip_pk
        .ok_or_else(|| "pass_slip_pk is required for update".to_string())?;

    let mut tx = db::begin_tx(&app).await?;

    // 1. UPDATE PASS SLIP
    let updated_pass_slip: PassSlip = sqlx::query_as(
        r#"
        UPDATE pass_slip
        SET user_fk = ?, slip_type = ?, signatory_fk = ?, is_approved = ?,
            start_time = ?, end_time = ?, reason =?, filed_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE pass_slip_pk = ?
        RETURNING *
        "#,
    )
    .bind(&pass_slip.user_fk)
    .bind(&pass_slip.slip_type)
    .bind(&pass_slip.signatory_fk)
    .bind(&pass_slip.is_approved)
    .bind(&pass_slip.start_time)
    .bind(&pass_slip.end_time)
    .bind(&pass_slip.reason)
    .bind(&pass_slip.filed_at)
    .bind(pass_slip_pk)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // 2. DELETE existing dates for this pass slip
    sqlx::query("DELETE FROM pass_slip_date WHERE pass_slip_fk = ?")
        .bind(pass_slip_pk)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // 3. INSERT new dates
    let mut inserted_dates = Vec::with_capacity(dates.len());

    for date in &dates {
        let inserted_date: PassSlipDate = sqlx::query_as(
            r#"
            INSERT INTO pass_slip_date (pass_slip_fk, date_value)
            VALUES (?, ?)
            RETURNING *
            "#,
        )
        .bind(pass_slip_pk)
        .bind(&date.date_value)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        inserted_dates.push(inserted_date);
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(DbResponseWithData {
        success: true,
        message: "Pass slip successfully updated".to_string(),
        data: PassSlipWithChildren {
            pass_slip: updated_pass_slip,
            dates: inserted_dates,
        },
    })
}
