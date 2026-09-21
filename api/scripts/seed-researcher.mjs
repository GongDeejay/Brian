#!/usr/bin/env node
/**
 * 创建或提升一个研究者账号。
 *
 * 用法：
 *   BRIAN_RESEARCHER_EMAIL=you@example.com \
 *   BRIAN_RESEARCHER_PASSWORD='至少10位且含两类字符' \
 *   npm run seed:researcher
 *
 * 若邮箱已存在，则把该账号提升为 researcher 并重置口令（用于找回管理权限）。
 * 已存在且未提供口令时，只做角色提升。
 */
import { one, run, closeDb } from '../db/index.js';
import { hashPassword } from '../lib/passwords.js';
import { passwordProblem, normalizeEmail, isEmail } from '../lib/validate.js';

const email = normalizeEmail(process.env.BRIAN_RESEARCHER_EMAIL || '');
const password = process.env.BRIAN_RESEARCHER_PASSWORD || '';
const displayName = process.env.BRIAN_RESEARCHER_NAME || 'Researcher';

async function main() {
  if (!isEmail(email)) {
    console.error('请设置 BRIAN_RESEARCHER_EMAIL 为合法邮箱');
    process.exit(1);
  }

  const existing = await one('SELECT id, role FROM users WHERE email = ?', [email]);
  const now = new Date().toISOString();

  if (existing) {
    if (password) {
      const problem = passwordProblem(password);
      if (problem) {
        console.error('口令不符合要求：至少 10 位，且包含大小写/数字/符号中的至少两类');
        process.exit(1);
      }
      await run('UPDATE users SET role = ?, password_hash = ? WHERE id = ?', [
        'researcher',
        await hashPassword(password),
        existing.id,
      ]);
      console.log(`✓ 已将 ${email} 提升为 researcher 并重置口令`);
    } else {
      await run('UPDATE users SET role = ? WHERE id = ?', ['researcher', existing.id]);
      console.log(`✓ 已将 ${email} 提升为 researcher`);
    }
    return;
  }

  const problem = passwordProblem(password);
  if (problem) {
    console.error('创建研究者账号需要 BRIAN_RESEARCHER_PASSWORD：至少 10 位，且包含两类字符');
    process.exit(1);
  }

  const result = await run(
    `INSERT INTO users (email, password_hash, display_name, role, consent_version, consented_at, created_at)
     VALUES (?, ?, ?, 'researcher', NULL, NULL, ?)`,
    [email, await hashPassword(password), displayName, now]
  );
  console.log(`✓ 已创建研究者账号 ${email}（id=${result.lastInsertRowid}）`);
}

main()
  .catch((error) => {
    console.error('✗ 失败：', error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
