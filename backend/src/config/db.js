import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
let database

export function getDatabasePath() {
  const configuredPath = process.env.SQLITE_DB_PATH?.trim()
  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(backendRoot, configuredPath)
  }

  return path.join(backendRoot, 'data', 'mindvocab.sqlite')
}

export async function connectDB() {
  const databasePath = getDatabasePath()
  fs.mkdirSync(path.dirname(databasePath), { recursive: true })

  database = new DatabaseSync(databasePath)
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS documents (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (collection, id)
    );
    CREATE INDEX IF NOT EXISTS idx_documents_collection
      ON documents (collection);
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  migrateContentSchema(databasePath)

  console.log(`SQLite database ready at ${databasePath}`)
}

function migrateContentSchema(databasePath) {
  const targetVersion = '2'
  const row = database.prepare('SELECT value FROM app_metadata WHERE key = ?').get('content_schema_version')
  if (row?.value === targetVersion) return
  const dataCount = database.prepare('SELECT COUNT(*) AS count FROM documents').get().count
  if (!dataCount) {
    database.prepare('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)').run('content_schema_version', targetVersion)
    return
  }
  const backupDir = path.join(path.dirname(databasePath), 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  database.exec('PRAGMA wal_checkpoint(FULL);')
  const backupPath = path.join(backupDir, `mindvocab-before-content-v2-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`)
  fs.copyFileSync(databasePath, backupPath)
  database.exec('BEGIN IMMEDIATE;')
  try {
    database.exec('DELETE FROM documents;')
    database.prepare('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)').run('content_schema_version', targetVersion)
    database.exec('COMMIT;')
    console.log(`Content schema upgraded; backup created at ${backupPath}`)
  } catch (error) {
    database.exec('ROLLBACK;')
    throw error
  }
}

export function getDatabase() {
  if (!database) throw new Error('SQLite database has not been initialized')
  return database
}
