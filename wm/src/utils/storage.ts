import {
  ChangeDetectionResult,
  CognitiveProfile,
  HistoryRecord,
  NBackResult,
  OSPANResult,
  SessionValidityRecord,
} from '../types/wm';
import { translate, type Lang } from '../i18n';

export const STORAGE_KEY = 'wm_cognitive_platform_data_v1';

/** Bumped whenever the persisted shape changes; older payloads are migrated. */
export const STORAGE_SCHEMA_VERSION = 2;

/** Maximum number of retained sessions in the history log. */
const HISTORY_LIMIT = 30;

export interface SaveOutcome {
  /** Profile that is authoritative in memory (may be trimmed on quota errors). */
  profile: CognitiveProfile;
  persisted: boolean;
  /**
   * Localized, human-readable reason when `persisted` is false. Rendered in the
   * language that was active at save time (see the `lang` argument on the
   * `save*Result` helpers) — history entries are frozen as they were written.
   */
  error: string | null;
}

export function createEmptyProfile(): CognitiveProfile {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    lastNBackResult: null,
    lastOSPANResult: null,
    lastChangeDetectionResult: null,
    history: [],
  };
}

// ---------------------------------------------------------------------------
// Validation helpers
//
// The previous implementation did `JSON.parse(raw) as CognitiveProfile` with no
// shape validation at all: a stored `"null"` (which is what
// `JSON.stringify(null)` / a failed clear leaves behind), an array, or `{}`
// crashed the very next `profile.history.unshift(...)` call and produced a
// white screen. Everything read from storage is now validated and normalised.
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Finite number or fallback (NaN / Infinity / strings are rejected). */
function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function positiveNum(value: unknown, fallback = 0): number {
  return Math.max(0, num(value, fallback));
}

function clamp01(value: unknown): number {
  return Math.min(1, positiveNum(value));
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeValidity(value: unknown): SessionValidityRecord | undefined {
  if (!isRecord(value)) return undefined;
  const interruptions = Math.round(positiveNum(value.interruptions));
  return {
    interruptions,
    totalAwayMs: Math.round(positiveNum(value.totalAwayMs)),
    trialRestarts: Math.round(positiveNum(value.trialRestarts)),
    isValid: interruptions === 0,
  };
}

function sanitizeNBackResult(value: unknown): NBackResult | null {
  if (!isRecord(value)) return null;
  const n = Math.round(num(value.n));
  const totalTrials = Math.round(positiveNum(value.totalTrials));
  if (n < 1 || totalTrials < 1) return null;

  const validity = sanitizeValidity(value.validity);
  return {
    date: str(value.date, '—'),
    n,
    mode:
      value.mode === 'letter' || value.mode === 'symbol'
        ? value.mode
        : 'spatial',
    totalTrials,
    hits: Math.round(positiveNum(value.hits)),
    misses: Math.round(positiveNum(value.misses)),
    falseAlarms: Math.round(positiveNum(value.falseAlarms)),
    correctRejections: Math.round(positiveNum(value.correctRejections)),
    accuracy: clamp01(value.accuracy),
    dPrime: num(value.dPrime),
    meanReactionTimeMs: positiveNum(value.meanReactionTimeMs),
    ...(validity ? { validity } : {}),
  };
}

function sanitizeOSPANResult(value: unknown): OSPANResult | null {
  if (!isRecord(value)) return null;
  const maxPossibleScore = Math.round(positiveNum(value.maxPossibleScore));
  if (maxPossibleScore < 1) return null;

  const rawSets = Array.isArray(value.sets) ? value.sets : [];
  const sets = rawSets.filter(isRecord).map((set) => ({
    spanLength: Math.round(positiveNum(set.spanLength)),
    targetLetters: stringArray(set.targetLetters),
    recalledLetters: stringArray(set.recalledLetters),
    allCorrect: set.allCorrect === true,
  }));

  const validity = sanitizeValidity(value.validity);
  return {
    date: str(value.date, '—'),
    absoluteScore: Math.round(positiveNum(value.absoluteScore)),
    totalScore: Math.round(positiveNum(value.totalScore)),
    maxPossibleScore,
    mathAccuracy: clamp01(value.mathAccuracy),
    meanMathRT: positiveNum(value.meanMathRT),
    sets,
    ...(validity ? { validity } : {}),
  };
}

function sanitizeChangeDetectionResult(value: unknown): ChangeDetectionResult | null {
  if (!isRecord(value)) return null;
  const totalTrials = Math.round(positiveNum(value.totalTrials));
  const rawBreakdown = Array.isArray(value.breakdownBySetSize) ? value.breakdownBySetSize : [];
  const breakdownBySetSize = rawBreakdown
    .filter(isRecord)
    .map((entry) => ({
      setSize: Math.round(positiveNum(entry.setSize)),
      trials: Math.round(positiveNum(entry.trials)),
      hits: Math.round(positiveNum(entry.hits)),
      misses: Math.round(positiveNum(entry.misses)),
      falseAlarms: Math.round(positiveNum(entry.falseAlarms)),
      correctRejections: Math.round(positiveNum(entry.correctRejections)),
      hitRate: positiveNum(entry.hitRate),
      falseAlarmRate: positiveNum(entry.falseAlarmRate),
      cowanK: num(entry.cowanK),
    }))
    .filter((entry) => entry.setSize > 0);

  if (totalTrials < 1 && breakdownBySetSize.length === 0) return null;

  const validity = sanitizeValidity(value.validity);
  return {
    date: str(value.date, '—'),
    totalTrials: Math.max(totalTrials, breakdownBySetSize.reduce((acc, e) => acc + e.trials, 0)),
    overallAccuracy: clamp01(value.overallAccuracy),
    meanCowanK: num(value.meanCowanK),
    breakdownBySetSize,
    meanReactionTimeMs: positiveNum(value.meanReactionTimeMs),
    ...(validity ? { validity } : {}),
  };
}

function sanitizeHistory(value: unknown): HistoryRecord[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const records: HistoryRecord[] = [];

  value.forEach((entry) => {
    if (!isRecord(entry)) return;
    const type =
      entry.type === 'nback' || entry.type === 'ospan' || entry.type === 'change_detection'
        ? entry.type
        : null;
    if (!type) return;

    const timestamp = positiveNum(entry.timestamp, Date.now()) || Date.now();
    let id = str(entry.id, makeId(type));
    // Duplicate ids (produced by the old double-save race) break React keys.
    if (seen.has(id)) id = makeId(type);
    seen.add(id);

    records.push({
      id,
      timestamp,
      type,
      scoreDisplay: str(entry.scoreDisplay, '—'),
      detail: str(entry.detail, '—'),
    });
  });

  return records
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, HISTORY_LIMIT);
}

function normalizeProfile(value: unknown): CognitiveProfile {
  if (!isRecord(value)) return createEmptyProfile();
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    lastNBackResult: sanitizeNBackResult(value.lastNBackResult),
    lastOSPANResult: sanitizeOSPANResult(value.lastOSPANResult),
    lastChangeDetectionResult: sanitizeChangeDetectionResult(value.lastChangeDetectionResult),
    history: sanitizeHistory(value.history),
  };
}

// ---------------------------------------------------------------------------
// Read / write
// ---------------------------------------------------------------------------

function describeStorageError(error: unknown, lang: Lang): string {
  const name = isRecord(error) ? String(error.name ?? '') : '';
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
    return translate(lang, 'storage.error.quota');
  }
  return translate(lang, 'storage.error.unavailable');
}

/**
 * Writes the profile, degrading gracefully instead of throwing:
 * on a quota error the history log is progressively trimmed (and finally
 * dropped) before giving up, and a failure never propagates to the caller.
 */
function writeProfile(profile: CognitiveProfile, lang: Lang): SaveOutcome {
  const trimmed = (limit: number): CognitiveProfile => ({
    ...profile,
    history: profile.history.slice(0, limit),
  });

  const attempts: CognitiveProfile[] = [
    trimmed(HISTORY_LIMIT),
    trimmed(10),
    trimmed(3),
    { ...profile, history: [] },
  ];

  let lastError: string | null = null;
  for (const candidate of attempts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      return { profile: candidate, persisted: true, error: null };
    } catch (error) {
      lastError = describeStorageError(error, lang);
    }
  }

  return {
    // Nothing could be written: keep the complete profile in memory so no data
    // disappears from the UI, and let the caller surface the notice.
    profile: attempts[0],
    persisted: false,
    error: lastError ?? translate(lang, 'storage.error.writeFailed'),
  };
}

export function loadCognitiveProfile(): CognitiveProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProfile();
    return normalizeProfile(JSON.parse(raw));
  } catch {
    // Corrupted JSON, a `"null"` payload, or storage access denied: never throw.
    return createEmptyProfile();
  }
}

/** Re-persists an existing profile verbatim (used by the "撤销清除" action). */
export function persistCognitiveProfile(profile: CognitiveProfile, lang: Lang = 'zh'): SaveOutcome {
  return writeProfile(normalizeProfile(profile), lang);
}

function validitySuffix(
  result: { validity?: SessionValidityRecord },
  lang: Lang
): string {
  const validity = result.validity;
  if (!validity || validity.interruptions === 0) return '';
  return translate(lang, 'storage.validitySuffix', { count: validity.interruptions });
}

export function saveNBackResult(result: NBackResult, lang: Lang = 'zh'): SaveOutcome {
  const profile = loadCognitiveProfile();
  profile.lastNBackResult = result;
  profile.history.unshift({
    id: makeId('nback'),
    timestamp: Date.now(),
    type: 'nback',
    scoreDisplay: translate(lang, 'storage.record.nbackScore', {
      n: result.n,
      percent: (result.accuracy * 100).toFixed(0),
      dPrime: result.dPrime,
    }),
    detail:
      translate(lang, 'storage.record.nbackDetail', {
        hits: result.hits,
        falseAlarms: result.falseAlarms,
        rt: Math.round(result.meanReactionTimeMs),
      }) + validitySuffix(result, lang),
  });
  return writeProfile(profile, lang);
}

export function saveOSPANResult(result: OSPANResult, lang: Lang = 'zh'): SaveOutcome {
  const profile = loadCognitiveProfile();
  profile.lastOSPANResult = result;
  profile.history.unshift({
    id: makeId('ospan'),
    timestamp: Date.now(),
    type: 'ospan',
    scoreDisplay: translate(lang, 'storage.record.ospanScore', {
      score: result.absoluteScore,
      max: result.maxPossibleScore,
      percent: (result.mathAccuracy * 100).toFixed(0),
    }),
    detail:
      translate(lang, 'storage.record.ospanDetail', {
        total: result.totalScore,
        rt: Math.round(result.meanMathRT),
      }) + validitySuffix(result, lang),
  });
  return writeProfile(profile, lang);
}

export function saveChangeDetectionResult(
  result: ChangeDetectionResult,
  lang: Lang = 'zh'
): SaveOutcome {
  const profile = loadCognitiveProfile();
  profile.lastChangeDetectionResult = result;
  // Derived from the session's own breakdown instead of a hardcoded 4/6/8.
  const setSizes = (result.breakdownBySetSize ?? []).map((b) => b.setSize).filter((s) => s > 0);
  const arraySizes =
    setSizes.length > 0
      ? translate(lang, 'storage.record.arraySizes', { sizes: setSizes.join('/') })
      : translate(lang, 'storage.record.arraySizesNone');
  const arrayScale = result.breakdownBySetSize?.length
    ? translate(lang, 'storage.record.arrayScaleSuffix', {
        count: result.breakdownBySetSize.length,
      })
    : '';
  profile.history.unshift({
    id: makeId('cd'),
    timestamp: Date.now(),
    type: 'change_detection',
    scoreDisplay: translate(lang, 'storage.record.cdScore', {
      k: result.meanCowanK.toFixed(2),
      percent: (result.overallAccuracy * 100).toFixed(0),
    }),
    detail:
      translate(lang, 'storage.record.cdDetail', {
        arrayText: `${arraySizes}${arrayScale}`,
        rt: Math.round(result.meanReactionTimeMs),
      }) + validitySuffix(result, lang),
  });
  return writeProfile(profile, lang);
}

export function clearCognitiveHistory(lang: Lang = 'zh'): SaveOutcome {
  return writeProfile(createEmptyProfile(), lang);
}
