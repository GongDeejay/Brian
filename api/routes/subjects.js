/**
 * 受试者编号管理。
 *
 * 双轨形态：
 *  - 研究者：批量创建编号、查看全部编号及其数据量（POST/GET /api/subjects）。
 *  - 受试者：可用编号直接开始测试（无需注册）；注册后可“认领”编号，
 *    以便在自己的账号里查看该编号的历史（POST /api/subjects/claim）。
 */
import express from 'express';
import { all, one, run } from '../db/index.js';
import { audit } from '../lib/audit.js';
import { requireAuth, requireResearcher } from '../lib/auth.js';
import { cleanString, ERROR_CODES, isValidSubjectCode } from '../lib/validate.js';

export const subjectsRouter = express.Router();

const MAX_BATCH = 200;

// -------------------------------------------------- 研究者：创建编号
subjectsRouter.post('/', requireResearcher, async (req, res) => {
  const codes = Array.isArray(req.body?.codes) ? req.body.codes : [req.body?.code];
  const clean = codes
    .map((c) => (typeof c === 'string' ? c.trim() : ''))
    .filter((c) => c.length > 0);

  if (clean.length === 0 || clean.length > MAX_BATCH) {
    return res.status(400).json({ error: ERROR_CODES.invalidRequest, maxBatchSize: MAX_BATCH });
  }
  for (const code of clean) {
    if (!isValidSubjectCode(code)) return res.status(400).json({ error: ERROR_CODES.invalidRequest, code });
  }

  const label = cleanString(req.body?.label, 120);
  const note = cleanString(req.body?.note, 500);
  const now = new Date().toISOString();
  const created = [];
  const existing = [];

  for (const code of clean) {
    const result = await run(
      `INSERT INTO subjects (code, label, note, created_by, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(code) DO NOTHING`,
      [code, label, note, req.user.id, now]
    );
    if (result.rowsAffected === 0) existing.push(code);
    else created.push(code);
  }

  await audit(req, 'subjects.create', {
    userId: req.user.id,
    detail: `created=${created.length} existing=${existing.length}`,
  });
  res.status(201).json({ created, existing });
});

// -------------------------------------------------- 研究者：列出全部编号
subjectsRouter.get('/', requireResearcher, async (_req, res) => {
  const rows = await all(
    `SELECT s.id, s.code, s.label, s.note, s.created_at,
            u.email AS owner_email,
            (SELECT COUNT(*) FROM sessions x WHERE x.subject_id = s.id) AS session_count,
            (SELECT MAX(x.started_at) FROM sessions x WHERE x.subject_id = s.id) AS last_session_at
       FROM subjects s
       LEFT JOIN users u ON u.id = s.owner_user_id
      ORDER BY s.created_at DESC`
  );

  res.json({
    subjects: rows.map((row) => ({
      id: Number(row.id),
      code: row.code,
      label: row.label,
      note: row.note,
      createdAt: row.created_at,
      ownerEmail: row.owner_email,
      sessionCount: Number(row.session_count ?? 0),
      lastSessionAt: row.last_session_at,
    })),
  });
});

// -------------------------------------------------- 受试者：认领编号
subjectsRouter.post('/claim', requireAuth, async (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!isValidSubjectCode(code)) return res.status(400).json({ error: ERROR_CODES.invalidRequest });

  const existing = await one('SELECT id, owner_user_id FROM subjects WHERE code = ?', [code]);

  if (!existing) {
    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO subjects (code, owner_user_id, created_at) VALUES (?, ?, ?)',
      [code, req.user.id, now]
    );
    await audit(req, 'subjects.claim_new', { userId: req.user.id, detail: code });
    return res.status(201).json({ code, subjectId: result.lastInsertRowid, created: true });
  }

  const ownerId = existing.owner_user_id === null ? null : Number(existing.owner_user_id);

  // 无主编号可直接认领；已被他人认领则拒绝，避免抢占他人编号。
  if (ownerId === null) {
    await run('UPDATE subjects SET owner_user_id = ? WHERE id = ?', [req.user.id, existing.id]);
    await audit(req, 'subjects.claim', { userId: req.user.id, detail: code });
    return res.json({ code, subjectId: Number(existing.id), created: false, claimed: true });
  }

  if (ownerId === req.user.id) {
    return res.json({ code, subjectId: Number(existing.id), created: false, claimed: false });
  }

  return res.status(409).json({ error: ERROR_CODES.conflict });
});

// -------------------------------------------------- 受试者：我的编号
subjectsRouter.get('/mine', requireAuth, async (req, res) => {
  const rows = await all(
    `SELECT s.id, s.code, s.label, s.created_at,
            (SELECT COUNT(*) FROM sessions x WHERE x.subject_id = s.id AND x.user_id = ?) AS session_count
       FROM subjects s
      WHERE s.owner_user_id = ?
      ORDER BY s.created_at DESC`,
    [req.user.id, req.user.id]
  );

  res.json({
    subjects: rows.map((row) => ({
      id: Number(row.id),
      code: row.code,
      label: row.label,
      createdAt: row.created_at,
      sessionCount: Number(row.session_count ?? 0),
    })),
  });
});
