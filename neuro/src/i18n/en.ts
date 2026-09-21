/**
 * 英文词条聚合入口。
 *
 * `Record<MessageKey, string>` 注解让 TypeScript 在**漏译时直接编译报错**。
 * 请勿改成 `as const` 或去掉注解，否则会失去这道校验。
 * The explicit `Record<MessageKey, string>` annotation turns a missing translation
 * into a compile error rather than a silent gap.
 */
import type { MessageKey } from './zh';
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

const enRaw = {
  ...common.en,
  ...wcst.en,
  ...wpt.en,
  ...ided.en,
  ...gabor.en,
  ...proto.en,
  ...analytics.en,
  ...load.en,
  ...lit.en,
  ...session.en,
  ...auth.en,
};

export const en: Record<MessageKey, string> = enRaw;
