/**
 * Local Talent Compass records → server sync.
 *
 * Same contract as wm/neuro:
 *  - Anonymous use is unchanged; sync no-ops until the user is signed in.
 *  - clientId is derived deterministically so retries never duplicate rows.
 *  - Only real local records are uploaded (assessments, energy logs, mirror notes).
 */
import { getSavedAssessments, getEnergyLogs, getMirrorLogs } from '../utils/calculator';
import { uploadSessions, type SyncRecord, type UploadResult } from './authApi';

const APP = 'talent' as const;
const SYNCED_KEY = 'brian.synced.talent.v1';
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
    // Fall back to re-upload; the server unique index still protects us.
  }
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function deriveClientId(task: string, timestamp: string, metrics: unknown): string {
  let digest = 'unhashable';
  try {
    digest = fnv1a(JSON.stringify(metrics));
  } catch {
    digest = 'unhashable';
  }
  return `${APP}-${task}-${timestamp}-${digest}`;
}

function isoFromRecordId(id: string, fallback?: string): string {
  const match = /(\d{10,})$/.exec(id);
  if (match) {
    const ms = Number(match[1]);
    if (Number.isFinite(ms) && ms > 0) return new Date(ms).toISOString();
  }
  if (fallback) {
    const parsed = Date.parse(fallback);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

export function collectLocalRecords(): SyncRecord[] {
  const records: SyncRecord[] = [];

  for (const item of getSavedAssessments()) {
    const metrics = {
      scores: item.scores,
      archetypeId: item.archetypeId,
      answers: item.answers,
      reflectionAnswers: item.reflectionAnswers,
      executiveSummary: item.aiReport?.executiveSummary ?? null,
    };
    const startedAt = isoFromRecordId(item.id, item.date);
    records.push({
      clientId: deriveClientId('assessment', startedAt, metrics),
      app: APP,
      task: 'assessment',
      startedAt,
      loadConfig: { archetypeId: item.archetypeId },
      metrics,
      appVersion: '1.0.0',
    });
  }

  for (const item of getEnergyLogs()) {
    const metrics = {
      title: item.title,
      type: item.type,
      category: item.category,
      note: item.note,
      energyShift: item.energyShift,
    };
    const startedAt = isoFromRecordId(item.id);
    records.push({
      clientId: deriveClientId('energy', startedAt, metrics),
      app: APP,
      task: 'energy',
      startedAt,
      loadConfig: { type: item.type, category: item.category },
      metrics,
      appVersion: '1.0.0',
    });
  }

  for (const item of getMirrorLogs()) {
    const metrics = {
      relation: item.relation,
      relationLabel: item.relationLabel,
      content: item.content,
      strengthsExtracted: item.strengthsExtracted,
    };
    const startedAt = isoFromRecordId(item.id);
    records.push({
      clientId: deriveClientId('mirror', startedAt, metrics),
      app: APP,
      task: 'mirror',
      startedAt,
      loadConfig: { relation: item.relation },
      metrics,
      appVersion: '1.0.0',
    });
  }

  return records;
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

export function localRecordStats(): { total: number; pending: number } {
  const all = collectLocalRecords();
  const synced = readSynced();
  return {
    total: all.length,
    pending: all.filter((record) => !synced.has(record.clientId)).length,
  };
}
