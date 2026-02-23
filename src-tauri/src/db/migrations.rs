use tauri_plugin_sql::{Migration, MigrationKind};

pub fn employee_migration() -> Migration {
    Migration {
        version: 1,
        description: "create_employee_table",
        sql: r#"CREATE TABLE IF NOT EXISTS employee (
                employee_pk INTEGER NOT NULL PRIMARY KEY,
                last_name TEXT NOT NULL,
                first_name TEXT NOT NULL,
                middle_name TEXT
            );
        "#,
        kind: MigrationKind::Up,
    }
}

pub fn all_migrations() -> Vec<Migration> {
    vec![
        employee_migration(),
    ]
}
