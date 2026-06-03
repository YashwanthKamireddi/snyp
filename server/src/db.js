// SQLite access layer. The database is a single file (data.db) sitting beside
// this module, so there is no separate database server to run.

import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data.db"));

// WAL improves read/write concurrency and is the standard choice for a server.
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    short_key    TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    clicks       INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Statements are prepared once and reused; values are bound, never concatenated,
// which keeps the queries fast and safe from SQL injection.
const statements = {
  insert: db.prepare("INSERT INTO urls (short_key, original_url) VALUES (?, ?)"),
  findByKey: db.prepare("SELECT * FROM urls WHERE short_key = ?"),
  listAll: db.prepare("SELECT * FROM urls ORDER BY created_at DESC"),
  incrementClicks: db.prepare("UPDATE urls SET clicks = clicks + 1 WHERE short_key = ?"),
};

// Thrown by createUrl when the chosen key is already taken, so callers can retry.
export class DuplicateKeyError extends Error {}

export function createUrl(shortKey, originalUrl) {
  try {
    statements.insert.run(shortKey, originalUrl);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new DuplicateKeyError();
    }
    throw err;
  }
  return statements.findByKey.get(shortKey);
}

export function getUrlByKey(shortKey) {
  return statements.findByKey.get(shortKey);
}

export function getAllUrls() {
  return statements.listAll.all();
}

export function recordClick(shortKey) {
  statements.incrementClicks.run(shortKey);
}

export default db;
