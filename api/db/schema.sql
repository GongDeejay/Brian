-- Brian 认知神经科学平台 · 数据模型
--
-- 设计要点：
--  1. 受试者以 code（编号）标识，不存姓名等身份信息 → 数据最小化。
--  2. sessions.client_id 唯一：前端生成幂等键，重复上传不会产生重复记录
--     （离线补传、重试、多标签页都不会污染数据）。
--  3. auth_sessions 只存 token 的 sha256，库被读走也无法直接冒用登录态。
--  4. 所有时间存 ISO8601 UTC 字符串，避免时区歧义。
--
-- apply via: npm run migrate

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ---------------------------------------------------------------- 账号
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash   TEXT NOT NULL,
  display_name    TEXT,
  -- 'participant' 受试者自助账号；'researcher' 研究者（可管理编号与导出）
  role            TEXT NOT NULL DEFAULT 'participant'
                  CHECK (role IN ('participant', 'researcher')),
  consent_version TEXT,
  consented_at    TEXT,
  created_at      TEXT NOT NULL,
  last_login_at   TEXT
);

-- 登录会话：只保存 token 的 sha256，绝不存明文 token
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  user_agent TEXT,
  ip_hash    TEXT
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);

-- ---------------------------------------------------------------- 受试者
-- 研究者创建编号，受试者可用编号直接测试（无需注册），也可自愿注册后绑定
CREATE TABLE IF NOT EXISTS subjects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,
  label         TEXT,
  note          TEXT,
  owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL
);

-- ---------------------------------------------------------------- 测评记录
CREATE TABLE IF NOT EXISTS sessions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  -- 幂等键：由前端生成，全局唯一，用于重复上传去重
  client_id        TEXT NOT NULL UNIQUE,
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id       INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  -- 记录当时的受试者编号，即使 subject 行被删除也保留可读性
  subject_code     TEXT,
  app              TEXT NOT NULL CHECK (app IN ('wm', 'neuro')),
  task             TEXT NOT NULL,
  started_at       TEXT NOT NULL,
  duration_seconds REAL,
  load_config_json TEXT,
  metrics_json     TEXT NOT NULL,
  app_version      TEXT,
  lang             TEXT,
  created_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject_id, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_task    ON sessions(app, task, started_at);

-- ---------------------------------------------------------------- 审计
-- 只记录行为，不记录可还原身份的信息（IP 只存加盐哈希）
CREATE TABLE IF NOT EXISTS audit_log (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  at      TEXT NOT NULL,
  user_id INTEGER,
  action  TEXT NOT NULL,
  detail  TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at);
