use crate::db;
use crate::db::handler::get_pool;
use crate::models::DbResponseWithData;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct PassSlip {
    pub pass_slip_pk: Option<i64>,
    pub user_fk: i32,
    pub start_time: String,
    pub end_time: String,
    pub slip_type: String,
    pub signatory_fk: i32,
    pub is_approved: i32,
    pub filed_at: String,
    pub created_at: String,
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
    mut pass_slip: PassSlip,
    mut dates: Vec<PassSlipDate>,
) -> Result<DbResponseWithData<PassSlipWithChildren>, String> {
    let mut tx = db::begin_tx(&app).await?;

    // 1. INSERT PASS SLIP
    let slip_insert_result = sqlx::query(
        r#"
        INSERT INTO pass_slip (
            user_fk, start_time, end_time, slip_type, 
            signatory_fk, is_approved, filed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&pass_slip.user_fk)
    .bind(&pass_slip.start_time)
    .bind(&pass_slip.end_time)
    .bind(&pass_slip.slip_type)
    .bind(&pass_slip.signatory_fk)
    .bind(&pass_slip.is_approved)
    .bind(&pass_slip.filed_at)
    .bind(&pass_slip.created_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // Get the new PK for the parent
    let pass_slip_pk = slip_insert_result.last_insert_rowid();
    pass_slip.pass_slip_pk = Some(pass_slip_pk);

    // 2. INSERT DATES
    for date in &mut dates {
        date.pass_slip_fk = Some(pass_slip_pk);

        let date_insert_result = sqlx::query(
            "INSERT INTO pass_slip_date (pass_slip_fk, date_value) VALUES (?, ?)"
        )
        .bind(&date.pass_slip_fk)
        .bind(&date.date_value)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        // Update child PK for the response
        date.pass_slip_date_pk = Some(date_insert_result.last_insert_rowid());
    }

    // Commit the transaction
    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(DbResponseWithData {
        success: true,
        message: "Pass slip successfully saved".to_string(),
        data: PassSlipWithChildren {
            pass_slip,
            dates,
        },
    })
}