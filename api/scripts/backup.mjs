#!/usr/bin/env node
/**
 * 数据库备份。npm run backup [保留份数=14]
 *
 * 优先使用 SQLite 的 `VACUUM INTO` 生成一致快照（WAL 模式下直接拷贝 .db
 * 可能丢掉尚未 checkpoint 的事务）；若不支持则回退为连 .db-wal/.db-shm 一起拷贝。
 *
 * 建议 cron（每日 03:20，与服务器上 isapo 的备份时间错开）：
 *   20 3 * * * cd /srv/brian-api && /usr/local/bin/node scripts/backup.mjs 14 >> backups/backup.log 2>&1
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDb, getDb } from '../db/index.js';
import { config } from '../lib/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEEP = Math.max(1, Number.parseInt(process.argv[2] || '14', 10));
const BACKUP_DIR = process.env.BRIAN_BACKUP_DIR || path.join(path.dirname(config.dbPath), 'backups');

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function pruneOldBackups() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith('brian-') && name.endsWith('.db'))
    .sort();
  const excess = files.length - KEEP;
  for (let i = 0; i < excess; i += 1) {
    fs.unlinkSync(path.join(BACKUP_DIR, files[i]));
    console.log(`  已删除旧备份 ${files[i]}`);
  }
}

async function main() {
  if (!fs.existsSync(config.dbPath)) {
    console.error(`未找到数据库文件：${config.dbPath}`);
    process.exit(1);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const target = path.join(BACKUP_DIR, `brian-${stamp()}.db`);

  let vacuumed = false;
  try {
    await getDb().execute(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    vacuumed = true;
  } catch (error) {
    console.warn(`  VACUUM INTO 不可用（${error?.message || error}），回退为文件拷贝`);
  }

  if (!vacuumed) {
    fs.copyFileSync(config.dbPath, target);
    for (const suffix of ['-wal', '-shm']) {
      const side = `${config.dbPath}${suffix}`;
      if (fs.existsSync(side)) fs.copyFileSync(side, `${target}${suffix}`);
    }
  }

  const sizeKb = (fs.statSync(target).size / 1024).toFixed(1);
  console.log(`✓ 备份完成：${target}（${sizeKb} KB，${vacuumed ? 'VACUUM 快照' : '文件拷贝'}）`);
  pruneOldBackups();
  await closeDb();
}

main().catch((error) => {
  console.error('✗ 备份失败：', error?.message || error);
  process.exitCode = 1;
});
