import Database from "@tauri-apps/plugin-sql";

// A private variable to hold the connection
let dbInstance: Database | null = null;

/**
 * **Get Database Connection**
 * 
 * The "One Function" to get database instance.
 * It opens the connection only if it hasn't been opened yet.
 */
export async function getDbConn() {
  if (dbInstance) return dbInstance

  dbInstance = await Database.load("sqlite:database.sqlite");
  return dbInstance;
}