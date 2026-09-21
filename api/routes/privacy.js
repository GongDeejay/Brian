/**
 * 数据主体权利：导出自己的全部数据、删除账号与全部记录。
 *
 * 这两条是 PIPL / GDPR 意义上的“可携带权”与“删除权”，
 * 因此实现上必须真的删干净，而不是打标记。
 */
import express from 'express';
import { all, run } from '../db/index.js';
import { audit } from '../lib/audit.js';
import { requireAuth } from '../lib/auth.js';
import { serializeClearedCookie } from '../lib/tokens.js';

export const privacyRouter = express.Router();

// -------------------------------------------------- 导出本人全部数据
privacyRouter.get('/export', requireAuth, async (req, res) => {
  const [userRow] = await all(
    'SELECT id, email, display_name, role, consent_version, consented_at, created_at, last_login_at FROM users WHERE id = ?',
    [req.user.id]
  );

  const sessionRows = await all(
    `SELECT client_id, subject_code, app, task, started_at, duration_seconds,
            load_config_json, metrics_json, app_version, lang, created_at
       FROM sessions WHERE user_id = ? ORDER BY started_at ASC`,
    [req.user.id]
  );

  const subjectRows = await all(
    'SELECT id, code, label, created_at FROM subjects WHERE owner_user_id = ? ORDER BY created_at ASC',
    [req.user.id]
  );

  const payload = {
    exportedAt: new Date().toISOString(),
    format: 'brian-export-v1',
    account: {
      email: userRow?.email ?? null,
      displayName: userRow?.display_name ?? null,
      role: userRow?.role ?? null,
      consentVersion: userRow?.consent_version ?? null,
      consentedAt: userRow?.consented_at ?? null,
      createdAt: userRow?.created_at ?? null,
      lastLoginAt: userRow?.last_login_at ?? null,
    },
    subjects: subjectRows.map((row) => ({
      code: row.code,
      label: row.label,
      createdAt: row.created_at,
    })),
    sessions: sessionRows.map((row) => ({
      clientId: row.client_id,
      subjectCode: row.subject_code,
      app: row.app,
      task: row.task,
      startedAt: row.started_at,
      durationSeconds: row.duration_seconds,
      loadConfig: row.load_config_json ? safeParse(row.load_config_json) : null,
      metrics: safeParse(row.metrics_json),
      appVersion: row.app_version,
      lang: row.lang,
      uploadedAt: row.created_at,
    })),
    notes:
      'This file contains every assessment record associated with your account. ' +
      'Metric values are internal indices of this platform and are not norm-referenced.',
  };

  const filename = `brian-export-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await audit(req, 'privacy.export', { userId: req.user.id, detail: `sessions=${sessionRows.length}` });
  res.send(JSON.stringify(payload, null, 2));
});

// -------------------------------------------------- 删除账号与全部数据
privacyRouter.delete('/', requireAuth, async (req, res) => {
  const userId = req.user.id;

  // 显式按依赖顺序删除，不依赖外键级联是否开启。
  await run('DELETE FROM sessions WHERE user_id = ?', [userId]);
  // 只解除归属关系，保留研究者创建的编号本体（其数据已被上面的语句删除）。
  await run('UPDATE subjects SET owner_user_id = NULL WHERE owner_user_id = ?', [userId]);
  await run('DELETE FROM auth_sessions WHERE user_id = ?', [userId]);
  await run('DELETE FROM users WHERE id = ?', [userId]);

  await audit(req, 'privacy.delete_account', { userId, detail: 'self-service deletion' });

  res.setHeader('Set-Cookie', serializeClearedCookie());
  res.json({ ok: true });
});

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
