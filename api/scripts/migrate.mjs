#!/usr/bin/env node
/**
 * 应用数据库 schema（幂等）。npm run migrate
 * 部署时由 pm2 启动流程自动调用，也可手动执行。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDb, migrate } from '../db/index.js';
import { config } from '../lib/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const count = await migrate(path.join(__dirname, '..', 'db', 'schema.sql'));
  console.log(`✓ schema 已应用（${count.tables} 张表 / ${count.indexes} 个索引）`);
  console.log(`  数据库：${config.dbPath}`);
} catch (error) {
  console.error('✗ 迁移失败：', error?.message || error);
  process.exitCode = 1;
} finally {
  await closeDb();
}
