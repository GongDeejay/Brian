/**
 * 中文词条聚合入口。
 *
 * ⚠️ 新增模块时：在 messages/ 下新建文件，然后**同时**在 zh.ts 与 en.ts 中注册。
 * 不要只改其中一个，否则 en.ts 的完整性校验会失败（这是刻意设计）。
 * Aggregates every Chinese message module. Keys added here must also exist in en.ts.
 */
import { common } from './messages/common';
import { nback } from './messages/nback';
import { ospan } from './messages/ospan';
import { changeDetection } from './messages/changeDetection';
import { dashboard } from './messages/dashboard';
import { theory } from './messages/theory';
import { utils } from './messages/utils';
import { auth } from './messages/auth';

export const zh = {
  ...common.zh,
  ...nback.zh,
  ...ospan.zh,
  ...changeDetection.zh,
  ...dashboard.zh,
  ...theory.zh,
  ...utils.zh,
  ...auth.zh,
};

/** Every valid message key, derived from the Chinese catalogue (the source of truth). */
export type MessageKey = keyof typeof zh;
