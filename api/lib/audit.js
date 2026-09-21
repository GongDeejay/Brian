/**
 * 审计日志：记录“谁在什么时候做了什么”，用于安全排查与合规。
 * 只写行为与加盐后的 IP 摘要，不写可还原身份的信息，也不写口令。
 */
import { run } from '../db/index.js';
import { hashIp } from './tokens.js';

export async function audit(req, action, { userId = null, detail = null } = {}) {
  try {
    await run(
      'INSERT INTO audit_log (at, user_id, action, detail, ip_hash) VALUES (?, ?, ?, ?, ?)',
      [
        new Date().toISOString(),
        userId,
        action,
        detail === null ? null : String(detail).slice(0, 500),
        hashIp(req.ip || req.socket?.remoteAddress || ''),
      ]
    );
  } catch (error) {
    // 审计失败不应中断业务，但要留下痕迹。
    console.error('[audit] 写入失败:', error?.message || error);
  }
}
