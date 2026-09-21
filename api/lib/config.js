/**
 * 运行时配置。所有敏感值来自环境变量或服务端 .env 文件，不写入仓库。
 *
 * ⚠️ DB_PATH 必须指向 **rsync 发布目录之外**。CI 用 `rsync --delete` 发布前端，
 * 若数据库放在站点根目录内，每次推送都会把全部受试者数据删掉。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 极简 .env 加载器（避免引入 dotenv 依赖）。
 * 只填充**尚未设置**的变量，因此真实环境变量始终优先，便于 pm2/CI 覆盖。
 * 默认读取 api/.env，可用 BRIAN_ENV_FILE 指定其他路径。
 */
function loadEnvFile() {
  const candidates = [
    process.env.BRIAN_ENV_FILE,
    path.join(__dirname, '..', '.env'),
  ].filter(Boolean);

  for (const file of candidates) {
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // 文件不存在是正常情况（例如本地开发用真实环境变量）
    }

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith('#')) continue;

      const eq = line.indexOf('=');
      if (eq === -1) continue;

      const key = line.slice(0, eq).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
      if (process.env[key] !== undefined) continue;

      let value = line.slice(eq + 1).trim();
      // 去掉成对的引号
      if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
    return file;
  }
  return null;
}

export const envFileUsed = loadEnvFile();

function envInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const dataDir = process.env.BRIAN_DATA_DIR || '/var/www/brian-data';

export const config = {
  port: envInt('PORT', 3011),
  host: process.env.HOST || '127.0.0.1',

  /** SQLite 数据文件（位于发布目录之外）。 */
  dbPath: process.env.BRIAN_DB_PATH || path.join(dataDir, 'brian.db'),

  /** 允许的前端来源，逗号分隔。默认只允许正式域名与本地开发。 */
  allowedOrigins: (process.env.BRIAN_ALLOWED_ORIGINS ||
    'https://brian.mplusm.site,http://localhost:5173,http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  /** 登录态有效期（天）。 */
  sessionTtlDays: envInt('BRIAN_SESSION_TTL_DAYS', 30),

  /** 生产环境必须是 true：cookie 只在 HTTPS 下发送。 */
  cookieSecure: process.env.BRIAN_COOKIE_SECURE !== 'false',

  cookieName: 'brian_session',

  /** IP 只存加盐哈希，用于限流与审计，不落明文。 */
  ipHashSalt: process.env.BRIAN_IP_SALT || 'brian-default-salt-change-me',

  /** 当前知情同意条款版本；条款内容变更时应递增。 */
  consentVersion: process.env.BRIAN_CONSENT_VERSION || '2026-09-1',

  /** 注册是否开放。关闭后仅研究者可创建账号。 */
  openRegistration: process.env.BRIAN_OPEN_REGISTRATION !== 'false',

  /**
   * 每个 IP 每小时的注册上限。
   *
   * 注意：实验室/教室里的被试通常共用同一个 NAT 出口 IP，因此这个值**不能太小**，
   * 否则整间教室只能注册少数几个账号。默认给到 30。
   */
  maxRegistrationsPerIp: envInt('BRIAN_MAX_REGISTRATIONS_PER_IP', 30),

  /**
   * 每个 IP 每 15 分钟的登录尝试上限（成功登录会清零计数）。
   * 这是防口令爆破的关键限制，保持较小值。
   */
  maxLoginAttemptsPerIp: envInt('BRIAN_MAX_LOGIN_ATTEMPTS_PER_IP', 20),

  /** 允许通过环境变量直接引导第一个研究者账号（邮箱）。 */
  bootstrapResearcherEmail: process.env.BRIAN_RESEARCHER_EMAIL || '',

  isProduction: process.env.NODE_ENV === 'production',
};
