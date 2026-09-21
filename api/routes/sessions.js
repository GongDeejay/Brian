/**
 * 测评记录的上报与读取。
 *
 * 幂等性：以 clientId 作为唯一键。离线补传、网络重试、多标签页同时提交都不会
 * 产生重复记录，因为重复的 clientId 会被直接跳过（ON CONFLICT DO NOTHING）。
 */
import express from 'express';
import { all, one, run } from '../db/index.js';
import { audit } from '../lib/audit.js';
import { requireAuth } from '../lib/auth.js';
import {
  cleanString,
  ERROR_CODES,
  isIsoDate,
  isValidClientId,
  jsonSize,
  MAX_BATCH_SIZE,
  MAX_LOAD_CONFIG_BYTES,
  MAX_METRICS_BYTES,
} from '../lib/validate.js';

export const sessionsRouter = express.Router();

const VALID_APPS = new Set(['wm', 'neuro', 'talent']);
const MAX_TASK_LENGTH = 60;

/** 把受试者编号解析为 subject 行；不存在则按需创建（研究者之外的编号也能用）。 */
async function resolveSubjectId(subjectCode, userId) {
  if (!subjectCode) return { subjectId: null, subjectCode: null };

  const existing = await one('SELECT id, code FROM subjects WHERE code = ?', [subjectCode]);
  if (existing) return { subjectId: Number(existing.id), subjectCode: existing.code };

  const result = await run(
    'INSERT INTO subjects (code, label, created_by, created_at) VALUES (?, ?, ?, ?)',
    [subjectCode, null, userId, new Date().toISOString()]
  );
  return { subjectId: result.lastInsertRowid, subjectCode };
}

function validateRecord(record) {
  if (!record || typeof record !== 'object') return ERROR_CODES.invalidRequest;
  if (!isValidClientId(record.clientId)) return ERROR_CODES.invalidRequest;
  if (!VALID_APPS.has(record.app)) return ERROR_CODES.invalidRequest;
  if (typeof record.task !== 'string' || record.task.length === 0 || record.task.length > MAX_TASK_LENGTH) {
    return ERROR_CODES.invalidRequest;
  }
  if (!isIsoDate(record.startedAt)) return ERROR_CODES.invalidRequest;
  if (record.metrics === undefined || record.metrics === null) return ERROR_CODES.invalidRequest;
  if (jsonSize(record.metrics) > MAX_METRICS_BYTES) return ERROR_CODES.invalidRequest;
  if (record.loadConfig !== undefined && jsonSize(record.loadConfig) > MAX_LOAD_CONFIG_BYTES) {
    return ERROR_CODES.invalidRequest;
  }
  if (record.subjectCode != null && !/^[A-Za-z0-9_-]{2,64}$/.test(String(record.subjectCode))) {
    return ERROR_CODES.invalidRequest;
  }
  return null;
}

// ------------------------------------------------------------------ 批量上报
sessionsRouter.post('/', requireAuth, async (req, res) => {
  const incoming = req.body?.sessions;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: ERROR_CODES.invalidRequest });
  }
  if (incoming.length > MAX_BATCH_SIZE) {
    return res.status(400).json({ error: ERROR_CODES.invalidRequest, maxBatchSize: MAX_BATCH_SIZE });
  }

  for (const record of incoming) {
    const problem = validateRecord(record);
    if (problem) return res.status(400).json({ error: problem, clientId: record?.clientId ?? null });
  }

  const accepted = [];
  const duplicates = [];
  const failed = [];
  const now = new Date().toISOString();

  for (const record of incoming) {
    const { subjectId, subjectCode } = await resolveSubjectId(
      record.subjectCode ? String(record.subjectCode) : null,
      req.user.id
    );

    try {
      const result = await run(
        `INSERT INTO sessions
           (client_id, user_id, subject_id, subject_code, app, task, started_at,
            duration_seconds, load_config_json, metrics_json, app_version, lang, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(client_id) DO NOTHING`,
        [
          record.clientId,
          req.user.id,
          subjectId,
          subjectCode,
          record.app,
          record.task,
          record.startedAt,
          Number.isFinite(record.durationSeconds) ? Number(record.durationSeconds) : null,
          record.loadConfig === undefined ? null : JSON.stringify(record.loadConfig),
          JSON.stringify(record.metrics),
          cleanString(record.appVersion, 40),
          cleanString(record.lang, 8),
          now,
        ]
      );

      if (result.rowsAffected === 0) duplicates.push(record.clientId);
      else accepted.push(record.clientId);
    } catch (error) {
      console.error('[sessions] 写入失败:', error?.message || error);
      failed.push(record.clientId);
    }
  }

  if (accepted.length > 0) {
    await audit(req, 'sessions.upload', {
      userId: req.user.id,
      detail: `accepted=${accepted.length} duplicates=${duplicates.length} failed=${failed.length}`,
    });
  }

  // 幂等语义：重复上传返回 200，让前端可以安全地重试。
  res.json({
    accepted,
    duplicates,
    failed,
    acceptedCount: accepted.length,
    duplicateCount: duplicates.length,
    failedCount: failed.length,
  });
});

// ------------------------------------------------------------------ 读取本人记录
sessionsRouter.get('/', requireAuth, async (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit ?? '200'), 10) || 200, 1), 1000);
  const app = typeof req.query.app === 'string' && VALID_APPS.has(req.query.app) ? req.query.app : null;

  const rows = app
    ? await all(
        `SELECT client_id, subject_code, app, task, started_at, duration_seconds,
                load_config_json, metrics_json, app_version, lang
           FROM sessions WHERE user_id = ? AND app = ?
          ORDER BY started_at DESC LIMIT ?`,
        [req.user.id, app, limit]
      )
    : await all(
        `SELECT client_id, subject_code, app, task, started_at, duration_seconds,
                load_config_json, metrics_json, app_version, lang
           FROM sessions WHERE user_id = ?
          ORDER BY started_at DESC LIMIT ?`,
        [req.user.id, limit]
      );

  res.json({
    sessions: rows.map((row) => ({
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
    })),
  });
});

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
