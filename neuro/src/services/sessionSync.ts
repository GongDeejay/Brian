/**
 * 本地会话记录 → 服务器同步。
 *
 * 与工作记忆平台同一套约定：
 *  - 未登录时完全空跑，匿名使用不受影响；
 *  - clientId 由记录自带的稳定 id 派生（`neuro-<task>-<id>`），配合服务端
 *    唯一索引，重试/多标签页都不会产生重复记录；
 *  - 只上报真实存在的会话，不编造记录。
 */
import { loadSessions } from './sessionStore';
import { uploadSessions, type SyncRecord, type UploadResult } from './authApi';
import type { TestSessionRecord } from '../types';

const APP = 'neuro' as const;

/** 已成功上传过的 clientId（避免每次登录都整批重传）。 */
const SYNCED_KEY = 'brian.synced.neuro.v1';
const MAX_TRACKED = 500;

function readSynced(): Set<string> {
  try {
    const raw = window.localStorage.getItem(SYNCED_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function writeSynced(ids: Set<string>): void {
  try {
    window.localStorage.setItem(SYNCED_KEY, JSON.stringify([...ids].slice(-MAX_TRACKED)));
  } catch {
    // 存不下就退化为每次重传，服务端幂等可以兜住。
  }
}

/** 记录自带的 id 已经是稳定唯一值，直接用作幂等键。 */
export function clientIdFor(record: TestSessionRecord): string {
  return `${APP}-${record.task}-${record.id}`;
}

function toSyncRecord(record: TestSessionRecord): SyncRecord {
  // 记录里的 metrics 可能已内嵌本次的语言标签，一并上报，保留当时口径。
  return {
    clientId: clientIdFor(record),
    app: APP,
    task: record.task,
    startedAt: record.timestamp,
    durationSeconds: record.durationSeconds,
    loadConfig: record.loadConfig,
    metrics: {
      ...record.metrics,
      ...(record.extraMetrics ? { extraMetrics: record.extraMetrics } : {}),
    },
    appVersion: '1.0.0',
  };
}

export function collectLocalRecords(): SyncRecord[] {
  return loadSessions().map(toSyncRecord);
}

export interface SyncOutcome {
  uploaded: number;
  duplicates: number;
  failed: number;
  pending: number;
  error?: string;
}

export async function syncPendingRecords(lang: string, subjectCode?: string | null): Promise<SyncOutcome> {
  const all = collectLocalRecords();
  const synced = readSynced();
  const pending = all.filter((record) => !synced.has(record.clientId));

  if (pending.length === 0) return { uploaded: 0, duplicates: 0, failed: 0, pending: 0 };

  const payload = pending.map((record) => ({ ...record, lang, subjectCode: subjectCode ?? null }));

  try {
    const result: UploadResult = await uploadSessions(payload);
    for (const id of result.accepted) synced.add(id);
    for (const id of result.duplicates) synced.add(id);
    writeSynced(synced);

    return {
      uploaded: result.acceptedCount,
      duplicates: result.duplicateCount,
      failed: result.failedCount,
      pending: all.filter((r) => !synced.has(r.clientId)).length,
    };
  } catch (error) {
    return {
      uploaded: 0,
      duplicates: 0,
      failed: pending.length,
      pending: all.filter((r) => !synced.has(r.clientId)).length,
      error: error instanceof Error ? error.message : 'sync failed',
    };
  }
}

export function localRecordStats(): { total: number; pending: number } {
  const all = collectLocalRecords();
  const synced = readSynced();
  return { total: all.length, pending: all.filter((r) => !synced.has(r.clientId)).length };
}
