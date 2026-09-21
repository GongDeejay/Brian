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
export const SCHEMA_VERSION = '1';

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
  await db.execute({
    sql: 'INSERT INTO schema_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    args: ['schema_version', SCHEMA_VERSION],
  });

  const created = (sql.match(/CREATE\s+TABLE/gi) || []).length;
  const indexed = (sql.match(/CREATE\s+INDEX/gi) || []).length;
  return { tables: created, indexes: indexed };
}

export async function closeDb() {
  if (client) {
    client.close();
    client = null;
  }
}
