/**
 * 研究者视图：汇总、按受试者/范式查询、CSV 导出。
 *
 * CSV 采用“动态宽表”：把每条记录 metrics 的顶层标量字段展开成列，
 * 取所有记录的并集作为表头。这样不必把范式指标硬编码在服务端，
 * 前端新增指标时导出会自动带上，嵌套对象则序列化为 JSON 文本放在单元格里。
 */
import express from 'express';
import { all, one } from '../db/index.js';
import { audit } from '../lib/audit.js';
import { requireResearcher } from '../lib/auth.js';

export const researchRouter = express.Router();

const VALID_APPS = new Set(['wm', 'neuro', 'talent']);

/** 转义 CSV 字段：含分隔符、引号、换行时用双引号包裹并转义内部引号。 */
function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text;
  if (typeof value === 'object') {
    try {
      text = JSON.stringify(value);
    } catch {
      text = String(value);
    }
  } else {
    text = String(value);
  }
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRow(cells) {
  return cells.map(csvCell).join(',');
}

/** 展开 metrics 的顶层字段；标量直接取值，对象/数组保留为 JSON 字符串。 */
function flattenMetrics(metrics) {
  const out = {};
  if (!metrics || typeof metrics !== 'object') return out;
  for (const [key, value] of Object.entries(metrics)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object') out[key] = JSON.stringify(value);
    else out[key] = value;
  }
  return out;
}

/** BOM 让 Excel 正确识别 UTF-8，避免中文乱码。 */
const UTF8_BOM = '\uFEFF';

function sendCsv(res, filename, header, rows) {
  const lines = [csvRow(header), ...rows.map(csvRow)];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(UTF8_BOM + lines.join('\r\n') + '\r\n');
}

// -------------------------------------------------- 汇总
researchRouter.get('/overview', requireResearcher, async (_req, res) => {
  const totals = await one(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE role = 'participant') AS participants,
       (SELECT COUNT(*) FROM subjects)                          AS subjects,
       (SELECT COUNT(*) FROM sessions)                          AS sessions,
       (SELECT COUNT(DISTINCT subject_code) FROM sessions WHERE subject_code IS NOT NULL) AS coded_subjects`
  );

  const byTask = await all(
    `SELECT app, task, COUNT(*) AS count, MAX(started_at) AS last_at
       FROM sessions GROUP BY app, task ORDER BY app, task`
  );

  res.json({
    totals: {
      participants: Number(totals?.participants ?? 0),
      subjects: Number(totals?.subjects ?? 0),
      sessions: Number(totals?.sessions ?? 0),
      codedSubjects: Number(totals?.coded_subjects ?? 0),
    },
    byTask: byTask.map((row) => ({
      app: row.app,
      task: row.task,
      count: Number(row.count ?? 0),
      lastAt: row.last_at,
    })),
  });
});

// -------------------------------------------------- 查询记录
researchRouter.get('/sessions', requireResearcher, async (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit ?? '500'), 10) || 500, 1), 5000);
  const conditions = [];
  const args = [];

  if (typeof req.query.subjectCode === 'string' && req.query.subjectCode.length > 0) {
    conditions.push('subject_code = ?');
    args.push(req.query.subjectCode.slice(0, 64));
  }
  if (typeof req.query.app === 'string' && VALID_APPS.has(req.query.app)) {
    conditions.push('app = ?');
    args.push(req.query.app);
  }
  if (typeof req.query.task === 'string' && req.query.task.length > 0) {
    conditions.push('task = ?');
    args.push(req.query.task.slice(0, 60));
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  args.push(limit);

  const rows = await all(
    `SELECT client_id, user_id, subject_code, app, task, started_at, duration_seconds,
            load_config_json, metrics_json, app_version, lang, created_at
       FROM sessions ${where}
      ORDER BY started_at DESC LIMIT ?`,
    args
  );

  res.json({
    sessions: rows.map((row) => ({
      clientId: row.client_id,
      userId: row.user_id === null ? null : Number(row.user_id),
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
  });
});

// -------------------------------------------------- CSV 导出
researchRouter.get('/export.csv', requireResearcher, async (req, res) => {
  const conditions = [];
  const args = [];
  if (typeof req.query.subjectCode === 'string' && req.query.subjectCode.length > 0) {
    conditions.push('subject_code = ?');
    args.push(req.query.subjectCode.slice(0, 64));
  }
  if (typeof req.query.app === 'string' && VALID_APPS.has(req.query.app)) {
    conditions.push('app = ?');
    args.push(req.query.app);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await all(
    `SELECT client_id, subject_code, app, task, started_at, duration_seconds,
            load_config_json, metrics_json, app_version, lang, created_at
       FROM sessions ${where}
      ORDER BY subject_code IS NULL, subject_code, started_at ASC`,
    args
  );

  const baseHeader = [
    'participant_code',
    'app',
    'task',
    'started_at',
    'duration_seconds',
    'app_version',
    'lang',
    'uploaded_at',
    'client_id',
    'load_config_json',
  ];

  // 动态列：所有记录 metrics 顶层键的并集，保持稳定排序。
  const metricKeys = new Set();
  const flattened = rows.map((row) => {
    const flat = flattenMetrics(safeParse(row.metrics_json));
    for (const key of Object.keys(flat)) metricKeys.add(key);
    return flat;
  });
  const metricColumns = [...metricKeys].sort();

  const header = [...baseHeader, ...metricColumns];
  const body = rows.map((row, index) => [
    row.subject_code ?? '',
    row.app,
    row.task,
    row.started_at,
    row.duration_seconds ?? '',
    row.app_version ?? '',
    row.lang ?? '',
    row.created_at,
    row.client_id,
    row.load_config_json ?? '',
    ...metricColumns.map((key) => flattened[index][key] ?? ''),
  ]);

  const filename = `brian-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
  await audit(req, 'research.export_csv', { userId: req.user.id, detail: `rows=${rows.length}` });
  sendCsv(res, filename, header, body);
});

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
