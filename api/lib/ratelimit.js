/**
 * 极简内存限流。用于登录/注册等敏感端点，防止口令爆破与批量注册。
 *
 * 单实例（pm2 fork 模式）足够；若将来多实例，需要换成共享存储。
 */
const buckets = new Map();

/** 定期清理过期桶，避免长时间运行后内存增长。 */
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref?.();

/**
 * @returns {{ allowed: boolean, retryAfterSeconds: number }}
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** 登录成功后清掉计数，避免正常用户被自己之前的失败次数拖累。 */
export function resetLimit(key) {
  buckets.delete(key);
}

/** 仅供测试使用。 */
export function __clearAll() {
  buckets.clear();
}
