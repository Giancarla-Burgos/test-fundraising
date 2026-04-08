/**
 * models/db.js
 * SQLite database connection and schema initialization.
 * Uses better-sqlite3 for a simple synchronous API.
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'raisekit.db');

// Ensure the data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ─────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS playbooks (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_type         TEXT    NOT NULL,
    funding_goal     TEXT    NOT NULL,
    time_horizon     TEXT    NOT NULL,
    funding_priority TEXT    NOT NULL,
    mission          TEXT,
    current_stage    TEXT,
    strategy_summary TEXT    NOT NULL,
    today_actions    TEXT    NOT NULL,
    timeline         TEXT    NOT NULL,
    donor_outreach   TEXT    NOT NULL,
    grant_ideas      TEXT    NOT NULL,
    checklist        TEXT    NOT NULL,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── User helpers ───────────────────────────────────────────────────────────

const users = {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },
  findById(id) {
    return db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id);
  },
  create({ name, email, password }) {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name, email, password);
    return result.lastInsertRowid;
  },
};

// ── Playbook helpers ────────────────────────────────────────────────────────

const playbooks = {
  findAllByUser(userId) {
    return db
      .prepare(
        `SELECT id, org_type, funding_goal, time_horizon, funding_priority,
                mission, current_stage, created_at
         FROM playbooks WHERE user_id = ? ORDER BY created_at DESC`
      )
      .all(userId);
  },
  findById(id) {
    return db.prepare('SELECT * FROM playbooks WHERE id = ?').get(id);
  },
  findByIdAndUser(id, userId) {
    return db
      .prepare('SELECT * FROM playbooks WHERE id = ? AND user_id = ?')
      .get(id, userId);
  },
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO playbooks
        (user_id, org_type, funding_goal, time_horizon, funding_priority,
         mission, current_stage, strategy_summary, today_actions, timeline,
         donor_outreach, grant_ideas, checklist)
      VALUES
        (@userId, @orgType, @fundingGoal, @timeHorizon, @fundingPriority,
         @mission, @currentStage, @strategySummary, @todayActions, @timeline,
         @donorOutreach, @grantIdeas, @checklist)
    `);
    const result = stmt.run(data);
    return result.lastInsertRowid;
  },
  deleteByIdAndUser(id, userId) {
    const result = db
      .prepare('DELETE FROM playbooks WHERE id = ? AND user_id = ?')
      .run(id, userId);
    return result.changes > 0;
  },
};

module.exports = { db, users, playbooks };
