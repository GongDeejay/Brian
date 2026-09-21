/**
 * 口令哈希：使用 Node 内置 scrypt（无原生依赖，无需 node-gyp）。
 *
 * 存储格式：scrypt$N$r$p$saltBase64$hashBase64
 * 参数随哈希一起保存，因此将来提高成本参数时旧口令仍可校验。
 */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

// 约 16 MB 内存、单次 ~50-100ms，对登录足够强，也不会拖垮 2 核小机器。
const DEFAULT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;
const MAX_MEM = 128 * 1024 * 1024;

/** Unicode 规范化，避免同样的口令因输入法差异无法登录。 */
function normalize(password) {
  return password.normalize('NFKC');
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(normalize(password), salt, KEY_LENGTH, {
    ...DEFAULT_PARAMS,
    maxmem: MAX_MEM,
  });
  return [
    'scrypt',
    DEFAULT_PARAMS.N,
    DEFAULT_PARAMS.r,
    DEFAULT_PARAMS.p,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$');
}

/** 恒定时间比对。任何格式异常一律返回 false，不抛出。 */
export async function verifyPassword(password, stored) {
  try {
    if (typeof stored !== 'string') return false;
    const parts = stored.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

    const N = Number.parseInt(parts[1], 10);
    const r = Number.parseInt(parts[2], 10);
    const p = Number.parseInt(parts[3], 10);
    if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

    const salt = Buffer.from(parts[4], 'base64');
    const expected = Buffer.from(parts[5], 'base64');
    if (salt.length === 0 || expected.length === 0) return false;

    const derived = await scryptAsync(normalize(password), salt, expected.length, {
      N,
      r,
      p,
      maxmem: MAX_MEM,
    });
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
