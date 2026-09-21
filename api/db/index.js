/**
 * 数据库连接与查询辅助（SQLite / libSQL）。
 *
 * 选型说明：服务器上 isapo 已在使用 @libsql/client（有预编译二进制，无需 node-gyp），
 * 因此沿用同一方案，避免在服务器上编译原生模块。
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { config } from '../lib/config.js';

let client = null;

/** 当前 schema 版本，写入 schema_meta 便于排查线上库结构。 */
export const SCHEMA_VERSION = '2';

export function getDb() {
  if (client) return client;

  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  client = createClient({ url: `file:${config.dbPath}` });
  return client;
}

/** 执行写语句，返回 { lastInsertRowid, rowsAffected }。 */
export async function run(sql, args = []) {
  const result = await getDb().execute({ sql, args });
  return {
    lastInsertRowid: result.lastInsertRowid !== undefined ? Number(result.lastInsertRowid) : undefined,
    rowsAffected: result.rowsAffected,
  };
}

/** 查询多行，返回对象数组。 */
export async function all(sql, args = []) {
  const result = await getDb().execute({ sql, args });
  return result.rows.map((row) => ({ ...row }));
}

/** 查询单行，无结果返回 null。 */
export async function one(sql, args = []) {
  const rows = await all(sql, args);
  return rows.length > 0 ? rows[0] : null;
}

/** 简单的取值辅助：返回单个标量。 */
export async function scalar(sql, args = []) {
  const row = await one(sql, args);
  if (!row) return null;
  const keys = Object.keys(row);
  return keys.length > 0 ? row[keys[0]] : null;
}

/**
 * 应用 schema.sql（幂等：全部 CREATE TABLE IF NOT EXISTS）。
 *
 * 使用 libSQL 的 `executeMultiple` 直接执行整个脚本，而不是自己按分号切分 ——
 * 手写切分会被 `--` 注释与内含分号的语句骗到，且无法正确处理 PRAGMA。
 */
export async function migrate(schemaPath) {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const db = getDb();

  await db.executeMultiple(sql);
  await upgradeSessionsAppConstraint(db);
  await db.execute({
    sql: 'INSERT INTO schema_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    args: ['schema_version', SCHEMA_VERSION],
  });

  const created = (sql.match(/CREATE\s+TABLE/gi) || []).length;
  const indexed = (sql.match(/CREATE\s+INDEX/gi) || []).length;
  return { tables: created, indexes: indexed };
}

/**
 * Existing databases were created with CHECK (app IN ('wm', 'neuro')).
 * SQLite will not rewrite that on CREATE TABLE IF NOT EXISTS, so rebuild
 * the table once to admit Talent Compass records.
 */
async function upgradeSessionsAppConstraint(db) {
  const result = await db.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sessions'",
  });
  const ddl = result.rows[0]?.sql;
  if (typeof ddl !== 'string' || ddl.includes("'talent'")) return;

  await db.executeMultiple(`
PRAGMA foreign_keys = OFF;
CREATE TABLE sessions_v2 (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id        TEXT NOT NULL UNIQUE,
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id       INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  subject_code     TEXT,
  app              TEXT NOT NULL CHECK (app IN ('wm', 'neuro', 'talent')),
  task             TEXT NOT NULL,
  started_at       TEXT NOT NULL,
  duration_seconds REAL,
  load_config_json TEXT,
  metrics_json     TEXT NOT NULL,
  app_version      TEXT,
  lang             TEXT,
  created_at       TEXT NOT NULL
);
INSERT INTO sessions_v2 (
  id, client_id, user_id, subject_id, subject_code, app, task,
  started_at, duration_seconds, load_config_json, metrics_json,
  app_version, lang, created_at
)
SELECT
  id, client_id, user_id, subject_id, subject_code, app, task,
  started_at, duration_seconds, load_config_json, metrics_json,
  app_version, lang, created_at
FROM sessions;
DROP TABLE sessions;
ALTER TABLE sessions_v2 RENAME TO sessions;
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject_id, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_task    ON sessions(app, task, started_at);
PRAGMA foreign_keys = ON;
`);
}

export async function closeDb() {
  if (client) {
    client.close();
    client = null;
  }
}
