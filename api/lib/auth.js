/**
 * 认证中间件。
 *
 * `attachUser` 在每个请求上尽力解析登录态（失败不报错，视为匿名）；
 * `requireAuth` / `requireResearcher` 用于需要权限的路由。
 */
import { one, run } from '../db/index.js';
import { ERROR_CODES } from './validate.js';
import { hashToken, tokenFromRequest } from './tokens.js';

export async function attachUser(req, _res, next) {
  req.user = null;
  try {
    const token = tokenFromRequest(req);
    if (!token) return next();

    const row = await one(
      `SELECT s.token_hash, s.expires_at, u.id, u.email, u.display_name, u.role,
              u.consent_version, u.consented_at
         FROM auth_sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?`,
      [hashToken(token)]
    );

    if (!row) return next();

    if (Date.parse(row.expires_at) <= Date.now()) {
      await run('DELETE FROM auth_sessions WHERE token_hash = ?', [row.token_hash]);
      return next();
    }

    req.user = {
      id: Number(row.id),
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      consentVersion: row.consent_version,
      consentedAt: row.consented_at,
      tokenHash: row.token_hash,
    };
  } catch (error) {
    console.error('[auth] 解析登录态失败:', error?.message || error);
    req.user = null;
  }
  return next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: ERROR_CODES.unauthorized });
  }
  return next();
}

export function requireResearcher(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: ERROR_CODES.unauthorized });
  }
  if (req.user.role !== 'researcher') {
    return res.status(403).json({ error: ERROR_CODES.forbidden });
  }
  return next();
}

/** 对外暴露的用户信息（绝不含口令哈希）。 */
export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    consentVersion: user.consentVersion,
    consentedAt: user.consentedAt,
  };
}
