import Database from "better-sqlite3";

export const db = new Database("vector.db");

db.exec(`
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    content TEXT,
    embedding TEXT
);
`);
