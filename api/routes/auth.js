/**
 * 注册 / 登录 / 登出 / 当前用户 / 知情同意。
 */
import express from 'express';
import { config } from '../lib/config.js';
import { one, run } from '../db/index.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';
import {
  generateToken,
  hashIp,
  hashToken,
  serializeClearedCookie,
  serializeSessionCookie,
  sessionExpiry,
} from '../lib/tokens.js';
import { rateLimit, resetLimit } from '../lib/ratelimit.js';
import { audit } from '../lib/audit.js';
import { publicUser, requireAuth } from '../lib/auth.js';
import {
  cleanString,
  ERROR_CODES,
  isEmail,
  normalizeEmail,
  passwordProblem,
} from '../lib/validate.js';

export const authRouter = express.Router();

// 限流阈值可由环境变量调整（见 lib/config.js）：
// 注册阈值必须容忍“整间教室共用一个出口 IP”的场景，登录阈值则保持较紧以防爆破。
const MAX_LOGIN_ATTEMPTS = config.maxLoginAttemptsPerIp;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_REGISTRATIONS_PER_IP = config.maxRegistrationsPerIp;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

function clientKey(req) {
  return hashIp(req.ip || req.socket?.remoteAddress || '');
}

async function createSession(req, res, userId) {
  const token = generateToken();
  const expiresAt = sessionExpiry();

  await run(
    'INSERT INTO auth_sessions (token_hash, user_id, created_at, expires_at, user_agent, ip_hash) VALUES (?, ?, ?, ?, ?, ?)',
    [
      hashToken(token),
      userId,
      new Date().toISOString(),
      expiresAt,
      cleanString(req.headers['user-agent'], 200),
      clientKey(req),
    ]
  );

  const maxAgeSeconds = config.sessionTtlDays * 24 * 60 * 60;
  res.setHeader('Set-Cookie', serializeSessionCookie(token, maxAgeSeconds));
}

/** 清掉该用户已过期的会话，避免表无界增长。 */
async function pruneExpiredSessions(userId) {
  await run('DELETE FROM auth_sessions WHERE user_id = ? AND expires_at <= ?', [
    userId,
    new Date().toISOString(),
  ]);
}

// ------------------------------------------------------------------ 注册
authRouter.post('/register', async (req, res) => {
  const limit = rateLimit(`register:${clientKey(req)}`, MAX_REGISTRATIONS_PER_IP, REGISTER_WINDOW_MS);
  if (!limit.allowed) {
    return res.status(429).json({ error: ERROR_CODES.rateLimited, retryAfterSeconds: limit.retryAfterSeconds });
  }

  if (!config.openRegistration) {
    return res.status(403).json({ error: ERROR_CODES.registrationClosed });
  }

  const { email, password, displayName, consentVersion } = req.body ?? {};

  if (!isEmail(email)) return res.status(400).json({ error: ERROR_CODES.invalidEmail });
  const pwProblem = passwordProblem(password);
  if (pwProblem) return res.status(400).json({ error: pwProblem });

  const normalized = normalizeEmail(email);
  const existing = await one('SELECT id FROM users WHERE email = ?', [normalized]);
  if (existing) return res.status(409).json({ error: ERROR_CODES.emailTaken });

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  const consented = cleanString(consentVersion, 40);

  const result = await run(
    `INSERT INTO users (email, password_hash, display_name, role, consent_version, consented_at, created_at)
     VALUES (?, ?, ?, 'participant', ?, ?, ?)`,
    [normalized, passwordHash, cleanString(displayName, 80), consented, consented ? now : null, now]
  );

  const userId = result.lastInsertRowid;
  await createSession(req, res, userId);
  await audit(req, 'user.register', { userId, detail: normalized });
  resetLimit(`login:${clientKey(req)}`);

  res.status(201).json({
    user: publicUser({
      id: userId,
      email: normalized,
      displayName: cleanString(displayName, 80),
      role: 'participant',
      consentVersion: consented,
      consentedAt: consented ? now : null,
    }),
  });
});

// ------------------------------------------------------------------ 登录
authRouter.post('/login', async (req, res) => {
  const key = `login:${clientKey(req)}`;
  const limit = rateLimit(key, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    await audit(req, 'auth.rate_limited');
    return res.status(429).json({ error: ERROR_CODES.rateLimited, retryAfterSeconds: limit.retryAfterSeconds });
  }

  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: ERROR_CODES.invalidRequest });
  }

  const user = await one('SELECT * FROM users WHERE email = ?', [normalizeEmail(email)]);

  // 无论账号是否存在都执行一次哈希校验，避免通过响应时间枚举邮箱。
  const ok = user
    ? await verifyPassword(password, user.password_hash)
    : await verifyPassword(password, 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAA==');

  if (!user || !ok) {
    await audit(req, 'auth.login_failed', { detail: normalizeEmail(email) });
    return res.status(401).json({ error: ERROR_CODES.invalidCredentials });
  }

  const now = new Date().toISOString();
  await run('UPDATE users SET last_login_at = ? WHERE id = ?', [now, user.id]);
  await pruneExpiredSessions(user.id);
  await createSession(req, res, user.id);
  resetLimit(key);
  await audit(req, 'auth.login', { userId: user.id, detail: user.email });

  res.json({ user: publicUser(user) });
});

// ------------------------------------------------------------------ 登出
authRouter.post('/logout', async (req, res) => {
  if (req.user) {
    await run('DELETE FROM auth_sessions WHERE token_hash = ?', [req.user.tokenHash]);
    await audit(req, 'auth.logout', { userId: req.user.id });
  }
  res.setHeader('Set-Cookie', serializeClearedCookie());
  res.json({ ok: true });
});

// ------------------------------------------------------------------ 当前用户
authRouter.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ------------------------------------------------------------------ 知情同意
authRouter.post('/consent', requireAuth, async (req, res) => {
  const version = cleanString(req.body?.version, 40) || config.consentVersion;
  const now = new Date().toISOString();
  await run('UPDATE users SET consent_version = ?, consented_at = ? WHERE id = ?', [
    version,
    now,
    req.user.id,
  ]);
  await audit(req, 'user.consent', { userId: req.user.id, detail: version });
  res.json({ ok: true, consentVersion: version, consentedAt: now });
});
