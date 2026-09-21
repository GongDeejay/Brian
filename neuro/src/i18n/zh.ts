/**
 * 中文词条聚合入口。
 *
 * ⚠️ 新增模块时：在 messages/ 下新建文件，然后**同时**在 zh.ts 与 en.ts 中注册。
 * Aggregates every Chinese message module. Keys added here must also exist in en.ts.
 */
import { common } from './messages/common';
import { wcst } from './messages/wcst';
import { wpt } from './messages/wpt';
import { ided } from './messages/ided';
import { gabor } from './messages/gabor';
import { proto } from './messages/proto';
import { analytics } from './messages/analytics';
import { load } from './messages/load';
import { lit } from './messages/lit';
import { session } from './messages/session';
import { auth } from './messages/auth';

export const zh = {
  ...common.zh,
  ...wcst.zh,
  ...wpt.zh,
  ...ided.zh,
  ...gabor.zh,
  ...proto.zh,
  ...analytics.zh,
  ...load.zh,
  ...lit.zh,
  ...session.zh,
  ...auth.zh,
};

/** Every valid message key, derived from the Chinese catalogue (the source of truth). */
export type MessageKey = keyof typeof zh;
