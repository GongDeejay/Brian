/**
 * 本地记录 → 服务器同步。
 *
 * 关键设计：
 *  1. **匿名可用**：未登录时一切照旧，数据只写本机，同步函数直接空跑。
 *  2. **幂等**：clientId 由记录内容确定性派生（同一条记录永远算出同一个 id），
 *     因此断网重试、多标签页、重复点击同步都不会产生重复数据。
 *     服务端也对 client_id 建了唯一索引，双保险。
 *  3. **只上报已实测结果**：没有数据的任务不会被编造出一条记录。
 *     本应用只在 localStorage 里保存最近一次各任务结果，因此可上报的就是这些。
 */
import { loadCognitiveProfile } from '../utils/storage';
import { uploadSessions, type SyncRecord, type UploadResult } from './authApi';
import type { ChangeDetectionResult, NBackResult, OSPANResult } from '../types/wm';

const APP = 'wm' as const;

/** 已成功上传过的 clientId（用于避免每次登录都重传）。 */
const SYNCED_KEY = 'brian.synced.wm.v1';
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
    const list = [...ids].slice(-MAX_TRACKED);
    window.localStorage.setItem(SYNCED_KEY, JSON.stringify(list));
  } catch {
    // 存不下就退化为“每次都重传”，服务端幂等可以兜住。
  }
}

/** FNV-1a：把内容摘要成短而稳定的十六进制串，用于 deterministic clientId。 */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * 由记录本身派生幂等键。
 * 同一份结果无论何时、在哪台设备、上传多少次，都会得到同一个 id。
 */
function deriveClientId(task: string, timestamp: string, metrics: unknown): string {
  let digest = '';
  try {
    digest = fnv1a(JSON.stringify(metrics));
  } catch {
    digest = 'unhashable';
  }
  return `${APP}-${task}-${timestamp}-${digest}`;
}

function nbackRecord(result: NBackResult): SyncRecord {
  const startedAt = new Date(result.date).toISOString();
  // Task 名与 clientId 用同一个字符串，便于在服务端日志里直接对照。
  const task = `nback-${result.n}back`;
  return {
    clientId: deriveClientId(task, startedAt, result),
    app: APP,
    task,
    startedAt,
    durationSeconds: undefined,
    loadConfig: { n: result.n, mode: result.mode, totalTrials: result.totalTrials },
    metrics: result,
    appVersion: '1.0.0',
  };
}

function ospanRecord(result: OSPANResult): SyncRecord {
  const startedAt = new Date(result.date).toISOString();
  return {
    clientId: deriveClientId('ospan', startedAt, result),
    app: APP,
    task: 'ospan',
    startedAt,
    loadConfig: { maxPossibleScore: result.maxPossibleScore, sets: result.sets?.length ?? 0 },
    metrics: result,
    appVersion: '1.0.0',
  };
}

function changeDetectionRecord(result: ChangeDetectionResult): SyncRecord {
  const startedAt = new Date(result.date).toISOString();
  return {
    clientId: deriveClientId('change_detection', startedAt, result),
    app: APP,
    task: 'change_detection',
    startedAt,
    loadConfig: {
      totalTrials: result.totalTrials,
      setSizes: result.breakdownBySetSize?.map((row) => row.setSize) ?? [],
    },
    metrics: result,
    appVersion: '1.0.0',
  };
}

/** 收集本机所有可上报的测评结果（只包含真实存在的）。 */
export function collectLocalRecords(): SyncRecord[] {
  const profile = loadCognitiveProfile();
  const records: SyncRecord[] = [];

  if (profile.lastNBackResult) records.push(nbackRecord(profile.lastNBackResult));
  if (profile.lastOSPANResult) records.push(ospanRecord(profile.lastOSPANResult));
  if (profile.lastChangeDetectionResult) records.push(changeDetectionRecord(profile.lastChangeDetectionResult));

  return records;
}

export interface SyncOutcome {
  uploaded: number;
  duplicates: number;
  failed: number;
  /** 本机待上传（含本次失败）的总数 */
  pending: number;
  error?: string;
}

/**
 * 把本机记录同步到服务器。未登录时由调用方保证不会调用，
 * 但即使调用了也只会得到一个空结果（服务端会返回 401，被捕获）。
 */
export async function syncPendingRecords(lang: string, subjectCode?: string | null): Promise<SyncOutcome> {
  const all = collectLocalRecords();
  const synced = readSynced();
  const pending = all.filter((record) => !synced.has(record.clientId));

  if (pending.length === 0) {
    return { uploaded: 0, duplicates: 0, failed: 0, pending: 0 };
  }

  const payload = pending.map((record) => ({
    ...record,
    lang,
    subjectCode: subjectCode ?? null,
  }));

  try {
    const result: UploadResult = await uploadSessions(payload);

    for (const clientId of result.accepted) synced.add(clientId);
    // 重复同样视为已上传，避免每次同步都重传一遍。
    for (const clientId of result.duplicates) synced.add(clientId);
    writeSynced(synced);

    return {
      uploaded: result.acceptedCount,
      duplicates: result.duplicateCount,
      failed: result.failedCount,
      pending: result.failedCount + all.filter((r) => !synced.has(r.clientId)).length - result.failedCount,
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

/** 本机记录总数与待上传数，用于账号面板展示。 */
export function localRecordStats(): { total: number; pending: number } {
  const all = collectLocalRecords();
  const synced = readSynced();
  return {
    total: all.length,
    pending: all.filter((record) => !synced.has(record.clientId)).length,
  };
}
