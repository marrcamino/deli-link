use tauri_plugin_sql::{Migration, MigrationKind};

pub fn employee_migration() -> Migration {
    Migration {
        version: 1,
        description: "create_user_table",
        sql: r#"CREATE TABLE IF NOT EXISTS user (
                user_pk INTEGER NOT NULL PRIMARY KEY UNIQUE,
                last_name TEXT NOT NULL,
                first_name TEXT NOT NULL,
                middle_name TEXT,
                extension TEXT,
                designation TEXT
            );
        "#,
        kind: MigrationKind::Up,
    }
}

pub fn log_migration() -> Migration {
    Migration {
        version: 1,
        description: "create_log_table",
        sql: r#"CREATE TABLE log (
                log_pk INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                user_fk INTEGER REFERENCES user (user_pk) ON DELETE CASCADE NOT NULL,
                date TEXT (10) NOT NULL,
                time TEXT (8)  NOT NULL
            );
        "#,
        kind: MigrationKind::Up,
    }
}

pub fn all_migrations() -> Vec<Migration> {
    vec![
        // employee_migration(),
        // log_migration(),
    ]
}
