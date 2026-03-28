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



console.log(`✅ SQLite database ready at: ${DB_PATH}`);

module.exports = db;
