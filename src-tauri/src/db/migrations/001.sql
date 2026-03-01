-- Initial table
CREATE TABLE IF NOT EXISTS user (
  user_pk INTEGER NOT NULL PRIMARY KEY UNIQUE,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  extension TEXT,
  designation TEXT
);

CREATE TABLE IF NOT EXISTS log (
  log_pk INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_fk INTEGER NOT NULL,
  date TEXT(10) NOT NULL,
  time TEXT(8) NOT NULL,
  FOREIGN KEY (user_fk) REFERENCES user (user_pk) ON DELETE CASCADE
);