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
  `)

  console.log(`SQLite database ready at ${databasePath}`)
}

export function getDatabase() {
  if (!database) throw new Error('SQLite database has not been initialized')
  return database
}
