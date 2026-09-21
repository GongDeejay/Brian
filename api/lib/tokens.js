/**
 * 登录态：随机 token + 服务端会话表 + httpOnly cookie。
 *
 * 安全选择：
 *  - token 用 CSPRNG 生成，数据库里**只存 sha256**，库被读走也无法直接冒用。
 *  - cookie 为 httpOnly + SameSite=Lax + Secure（生产），前端 JS 读不到，
 *    因此 XSS 无法直接窃取登录态。
 *  - 比对使用恒定时间函数，避免时序侧信道。
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from './config.js';

const TOKEN_BYTES = 32;

export function generateToken() {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

/** IP 只以加盐哈希形式落库，用于限流与审计，不保存明文地址。 */
export function hashIp(ip) {
  return createHash('sha256').update(`${config.ipHashSalt}:${ip || ''}`).digest('hex').slice(0, 32);
}

export function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return out;
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!name) continue;
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}

export function serializeSessionCookie(token, maxAgeSeconds) {
  const attributes = [
    `${config.cookieName}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (config.cookieSecure) attributes.push('Secure');
  return attributes.join('; ');
}

export function serializeClearedCookie() {
  const attributes = [
    `${config.cookieName}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (config.cookieSecure) attributes.push('Secure');
  return attributes.join('; ');
}

export function sessionExpiry(days = config.sessionTtlDays) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/** 从请求里取出 token（只用 cookie，不接受 query/body 传 token）。 */
export function tokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[config.cookieName];
  return typeof token === 'string' && token.length > 0 ? token : null;
}
