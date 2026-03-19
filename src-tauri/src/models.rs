use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DbResponse<T = String> {
    pub success: bool,
    pub message: T,
}

#[derive(Serialize, Deserialize)]
pub struct DbResponseWithData<T> {
    pub success: bool,
    pub message: String,
    pub data: T,
}