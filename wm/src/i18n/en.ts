/**
 * 英文词条聚合入口。
 *
 * `Record<MessageKey, string>` 注解让 TypeScript 在**漏译时直接编译报错**，
 * 并列出缺失的键名。请勿改成 `as const` 或去掉注解，否则会失去这道校验。
 * Aggregates every English message module. The explicit `Record<MessageKey, string>`
 * annotation makes a missing translation a compile error rather than a silent gap.
 */
import type { MessageKey } from './zh';
import { common } from './messages/common';
import { nback } from './messages/nback';
import { ospan } from './messages/ospan';
import { changeDetection } from './messages/changeDetection';
import { dashboard } from './messages/dashboard';
import { theory } from './messages/theory';
import { utils } from './messages/utils';
import { auth } from './messages/auth';

const enRaw = {
  ...common.en,
  ...nback.en,
  ...ospan.en,
  ...changeDetection.en,
  ...dashboard.en,
  ...theory.en,
  ...utils.en,
  ...auth.en,
};

export const en: Record<MessageKey, string> = enRaw;
