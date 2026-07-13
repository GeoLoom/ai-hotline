import { config } from './config.js';
import Database from "better-sqlite3";

export const db = new Database(config.dbPath);


db.exec(`
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    content TEXT,
    embedding TEXT
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export function insertFeedback(feedback: {
  question: string;
  answer: string;
  rating: number;
  comment?: string;
}) {
  db.prepare(`
    INSERT INTO feedback (question, answer, rating, comment)
    VALUES (?, ?, ?, ?)
  `).run(feedback.question, feedback.answer, feedback.rating, feedback.comment ?? null);
}