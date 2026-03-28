const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data/ directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'expenses.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create expenses table
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    amount     REAL NOT NULL,
    category   TEXT NOT NULL,
    date       TEXT NOT NULL,
    note       TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Add user_id column to expenses table if it doesn't exist
const columns = db.pragma('table_info(expenses)');
const hasUserId = columns.some(col => col.name === 'user_id');
if (!hasUserId) {
  db.exec('ALTER TABLE expenses ADD COLUMN user_id INTEGER REFERENCES users(id)');
}


console.log(`✅ SQLite database ready at: ${DB_PATH}`);

module.exports = db;
