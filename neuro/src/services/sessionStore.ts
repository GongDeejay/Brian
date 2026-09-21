import {
  CognitiveLoadConfig,
  NeuroCognitiveProfile,
  ParadigmStats,
  ProfileDimension,
  ProfileResult,
  TaskId,
  TestSessionRecord,
} from '../types';
import { translate, translateList, type Lang, type MessageKey } from '../i18n';

/**
 * Session store + profile derivation.
 *
 * HARD RULE: nothing in this file may invent a measurement.
 * A dimension without a valid underlying measurement resolves to `null`
 * (rendered as 暂无数据) and is reported as unavailable in the export.
 *
 * i18n: this is a plain service, so it cannot use the `useI18n` hook. Every
 * user-facing string is resolved through `translate(lang, key, vars)`.
 * `TASK_LABELS` / `DATA_LIMITATIONS` / `LITERATURE_REFERENCES` hold message
 * keys rather than rendered text, and take a `lang` argument at the call site.
 */

export const SESSION_STORAGE_KEY = 'neuroclassify.sessions.v1';
/**
 * Mirrors i18n's private STORAGE_KEY (`brian.lang`). Kept in sync deliberately:
 * non-component code (the error boundary) has to be able to read the selected
 * language without going through the hook.
 */
export const LANG_STORAGE_KEY = 'brian.lang';
/** Bounded history so sessionStorage cannot grow without limit. */
export const MAX_STORED_SESSIONS = 40;

/**
 * Minimum sample sizes before a paradigm's numbers are considered interpretable.
 * Below these thresholds the dimension is reported as 暂无数据 rather than scored.
 */
export const MIN_TRIALS = {
  wcst: 10,
  wpt: 10,
  ided: 8,
  gaborPerCondition: 10,
  prototypeTest: 6,
} as const;

/**
 * Task label message keys. Resolve at the call site with
 * `t(TASK_LABELS[task])` (components) or `translate(lang, TASK_LABELS[task])`.
 */
export const TASK_LABELS: Record<TaskId, MessageKey> = {
  wcst: 'session.task.wcst',
  wpt: 'session.task.wpt',
  ided: 'session.task.ided',
  gabor: 'session.task.gabor',
  prototype: 'session.task.prototype',
};

/** Compact task labels for the load-resilience comparison line. */
const TASK_SHORT_LABELS: Record<TaskId, MessageKey> = {
  wcst: 'session.taskShort.wcst',
  wpt: 'session.taskShort.wpt',
  ided: 'session.taskShort.ided',
  gabor: 'session.taskShort.gabor',
  prototype: 'session.taskShort.prototype',
};

const TASK_IDS: TaskId[] = ['wcst', 'wpt', 'ided', 'gabor', 'prototype'];

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const signed = (value: number, digits = 1) => `${value > 0 ? '+' : ''}${value.toFixed(digits)}`;

export function isLoadActive(config: CognitiveLoadConfig): boolean {
  return (
    config.timeLimitSeconds > 0 ||
    config.workingMemoryDistractor ||
    config.perceptualNoiseLevel > 0 ||
    config.distractorInterference
  );
}

export function describeLoad(config: CognitiveLoadConfig, lang: Lang): string {
  const parts: string[] = [];
  if (config.timeLimitSeconds > 0) {
    parts.push(translate(lang, 'session.load.timeLimit', { seconds: config.timeLimitSeconds }));
  }
  if (config.workingMemoryDistractor) parts.push(translate(lang, 'session.load.wmProbe'));
  if (config.perceptualNoiseLevel > 0) {
    parts.push(translate(lang, 'session.load.noise', { level: config.perceptualNoiseLevel }));
  }
  if (config.distractorInterference) parts.push(translate(lang, 'session.load.distractor'));
  return parts.length > 0
    ? parts.join(translate(lang, 'session.load.separator'))
    : translate(lang, 'session.load.none');
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

export interface SessionRecordInput {
  task: TaskId;
  durationSeconds: number;
  loadConfig: CognitiveLoadConfig;
  metrics: ParadigmStats;
  extraMetrics?: Record<string, number | string | null>;
  /** Language used to render the stored headline metric strings. */
  lang: Lang;
}

interface SessionDescription {
  /** 记录形状异常时为 null（“未测得”），而不是让页面崩掉。 */
  accuracy: number | null;
  keyMetricName: string;
  keyMetricValue: string;
}

/**
 * The single "key metric" headline for a session, plus the overall accuracy.
 * Both are derived from measured values only.
 *
 * The metric name/value returned here are already rendered in `lang`; they are
 * stored on the record so an export can be read on its own.
 */
/**
 * 取某个范式嵌套在 metrics 下的统计对象。
 *
 * 历史记录来自浏览器存储，可能是旧 schema 或被外部改写的残档；
 * 这里做一次运行时收窄，避免一条坏记录把整个看板拖进错误边界。
 */
function statsOf<T extends TaskId>(metrics: ParadigmStats, task: T): unknown {
  if (!metrics || typeof metrics !== 'object') return null;
  if (metrics.task !== task) return null;
  const nested = (metrics as unknown as Record<string, unknown>)[task];
  return nested && typeof nested === 'object' ? nested : null;
}

export function describeSession(metrics: ParadigmStats, lang: Lang): SessionDescription {
  // 缺失或形状不对时退化为“未测得”，而不是抛异常。
  if (!metrics || typeof metrics !== 'object' || !statsOf(metrics, metrics.task as TaskId)) {
    return {
      accuracy: null,
      keyMetricName: translate(lang, 'session.metric.unavailable'),
      keyMetricValue: '',
    };
  }
  switch (metrics.task) {
    case 'wcst': {
      const s = metrics.wcst;
      return {
        accuracy: s.accuracy,
        keyMetricName: translate(lang, 'session.metric.wcst.name'),
        keyMetricValue: translate(lang, 'session.metric.wcst.value', {
          rate: s.perseverativeErrorRate,
          pe: s.perseverativeErrors,
          total: s.totalTrials,
        }),
      };
    }
    case 'wpt': {
      const s = metrics.wpt;
      return {
        accuracy: s.actualAccuracy,
        keyMetricName: translate(lang, 'session.metric.wpt.name'),
        keyMetricValue: translate(lang, 'session.metric.wpt.value', {
          optimal: s.optimalRate,
          hit: s.actualAccuracy,
        }),
      };
    }
    case 'ided': {
      const s = metrics.ided;
      return {
        accuracy: s.accuracy,
        keyMetricName: translate(lang, 'session.metric.ided.name'),
        keyMetricValue: translate(lang, 'session.metric.ided.value', {
          errors: s.edsErrors,
          stages: s.stagesCompleted,
          tail: s.failedStage
            ? translate(lang, 'session.metric.ided.failedTail', {
                stage: s.failedStage,
                max: s.maxTrialsPerStage,
              })
            : '',
        }),
      };
    }
    case 'gabor': {
      const s = metrics.gabor;
      return {
        accuracy: s.accuracy,
        keyMetricName: translate(lang, 'session.metric.gabor.name'),
        keyMetricValue:
          s.ii.accuracy === null
            ? translate(lang, 'session.metric.gabor.notMeasured')
            : translate(lang, 'session.metric.gabor.value', {
                accuracy: s.ii.accuracy,
                trials: s.ii.trials,
              }),
      };
    }
    case 'prototype':
    default: {
      const s = metrics.prototype;
      return {
        accuracy: s.overallAccuracy,
        keyMetricName: translate(lang, 'session.metric.prototype.name'),
        keyMetricValue: translate(lang, 'session.metric.prototype.value', {
          effect: signed(s.prototypeEnhancementEffect, 0),
          proto: s.prototypeAccuracy,
          novel: s.novelDistortionAccuracy,
        }),
      };
    }
  }
}

export function createSessionRecord(input: SessionRecordInput): TestSessionRecord {
  const described = describeSession(input.metrics, input.lang);
  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    task: input.task,
    durationSeconds: Math.max(0, Math.round(input.durationSeconds)),
    accuracy: described.accuracy,
    loadConfig: input.loadConfig,
    keyMetricName: described.keyMetricName,
    keyMetricValue: described.keyMetricValue,
    metrics: input.metrics,
    extraMetrics: input.extraMetrics,
  };
}

// ---------------------------------------------------------------------------
// Persistence (bounded, best-effort, never throws)
// ---------------------------------------------------------------------------

function isValidRecord(value: unknown): value is TestSessionRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<TestSessionRecord>;
  if (typeof record.id !== 'string' || typeof record.timestamp !== 'string') return false;
  if (!record.task || !TASK_IDS.includes(record.task)) return false;
  if (typeof record.accuracy !== 'number') return false;
  if (!record.metrics || typeof record.metrics !== 'object') return false;
  return true;
}

export function loadSessions(): TestSessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidRecord).slice(-MAX_STORED_SESSIONS);
  } catch {
    return [];
  }
}

export function saveSessions(records: TestSessionRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(records.slice(-MAX_STORED_SESSIONS)));
  } catch {
    // Quota exceeded or storage disabled: keep the in-memory history only.
  }
}

export function clearSessions(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Profile derivation — every number traces back to a stored measurement
// ---------------------------------------------------------------------------

function latestOf(sessions: TestSessionRecord[], task: TaskId): TestSessionRecord | null {
  for (let i = sessions.length - 1; i >= 0; i--) {
    if (sessions[i].task === task) return sessions[i];
  }
  return null;
}

const UNAVAILABLE = (reason: string): ProfileDimension['explanation'] => reason;

/**
 * Derives the six profile dimensions.
 *
 * The score arithmetic is untouched by i18n: `lang` only selects the language
 * of the label / brain / explanation / detail strings that travel with a
 * dimension. Every number still traces back to a stored measurement.
 */
export function computeProfile(sessions: TestSessionRecord[], lang: Lang): ProfileResult {
  const dimensions: ProfileDimension[] = [];

  // 1) WCST — prefrontal flexibility --------------------------------------
  {
    const record = latestOf(sessions, 'wcst');
    const stats = record && record.metrics.task === 'wcst' ? record.metrics.wcst : null;
    const dim: ProfileDimension = {
      key: 'prefrontalFlexibility',
      label: translate(lang, 'session.dim.prefrontalFlexibility.label'),
      brain: translate(lang, 'session.dim.prefrontalFlexibility.brain'),
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.totalTrials < MIN_TRIALS.wcst) {
      dim.explanation = UNAVAILABLE(
        translate(lang, 'session.unavailable.wcst', {
          min: MIN_TRIALS.wcst,
          status: stats
            ? translate(lang, 'session.unavailable.wcst.have', { trials: stats.totalTrials })
            : translate(lang, 'session.unavailable.wcst.none'),
        })
      );
    } else {
      const categoryPart = (stats.categoriesCompleted / 6) * 100;
      const pePenalty = Math.min(100, stats.perseverativeErrorRate * 3);
      dim.score = Math.round(clamp(categoryPart * 0.6 + (100 - pePenalty) * 0.4));
      dim.available = true;
      dim.explanation = translate(lang, 'session.explain.wcst');
      dim.detail = translate(lang, 'session.detail.wcst', {
        trials: stats.totalTrials,
        categories: stats.categoriesCompleted,
        pe: stats.perseverativeErrors,
        peRate: stats.perseverativeErrorRate,
        npe: stats.nonPerseverativeErrors,
        omissions: stats.omissions,
      });
    }
    dimensions.push(dim);
  }

  // 2) WPT — striatal implicit extraction ---------------------------------
  {
    const record = latestOf(sessions, 'wpt');
    const stats = record && record.metrics.task === 'wpt' ? record.metrics.wpt : null;
    const dim: ProfileDimension = {
      key: 'striatalImplicitExtraction',
      label: translate(lang, 'session.dim.striatalImplicitExtraction.label'),
      brain: translate(lang, 'session.dim.striatalImplicitExtraction.brain'),
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.totalTrials < MIN_TRIALS.wpt) {
      dim.explanation = UNAVAILABLE(
        translate(lang, 'session.unavailable.wpt', {
          min: MIN_TRIALS.wpt,
          status: stats
            ? translate(lang, 'session.unavailable.wpt.have', { trials: stats.totalTrials })
            : translate(lang, 'session.unavailable.wpt.none'),
        })
      );
    } else {
      const first = stats.blockAccuracies[0]?.optimalRate ?? null;
      const last = stats.blockAccuracies[stats.blockAccuracies.length - 1]?.optimalRate ?? null;
      dim.score = stats.basalGangliaImplicitIndex;
      dim.available = true;
      dim.explanation = translate(lang, 'session.explain.wpt');
      dim.detail = translate(lang, 'session.detail.wpt', {
        trials: stats.totalTrials,
        optimal: stats.optimalRate,
        accuracy: stats.actualAccuracy,
        blocks:
          first !== null && last !== null
            ? translate(lang, 'session.detail.wpt.blocks', { first, last })
            : '',
      });
    }
    dimensions.push(dim);
  }

  // 3) ID/ED — attentional set shifting -----------------------------------
  {
    const record = latestOf(sessions, 'ided');
    const stats = record && record.metrics.task === 'ided' ? record.metrics.ided : null;
    const dim: ProfileDimension = {
      key: 'attentionalSetShifting',
      label: translate(lang, 'session.dim.attentionalSetShifting.label'),
      brain: translate(lang, 'session.dim.attentionalSetShifting.brain'),
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.stagesCompleted + (stats.failedStage ? 1 : 0) < 1) {
      dim.explanation = UNAVAILABLE(translate(lang, 'session.unavailable.ided'));
    } else {
      const stagePart = (stats.stagesCompleted / 7) * 100 * 0.7;
      const edsBonus = stats.passedEDS ? 30 : 0;
      const shiftPenalty = Math.min(30, stats.edsShiftCost * 5);
      dim.score = Math.round(clamp(stagePart + edsBonus - shiftPenalty));
      dim.available = true;
      dim.explanation = translate(lang, 'session.explain.ided');
      dim.detail = translate(lang, 'session.detail.ided', {
        stages: stats.stagesCompleted,
        edsErrors: stats.edsErrors,
        idsErrors: stats.idsErrors,
        shiftCost: stats.edsShiftCost,
        totalErrors: stats.totalErrors,
        tail: stats.failedStage
          ? translate(lang, 'session.detail.ided.failedTail', {
              stage: stats.failedStage,
              max: stats.maxTrialsPerStage,
            })
          : '',
      });
    }
    dimensions.push(dim);
  }

  // 4) Prototype — abstraction --------------------------------------------
  {
    const record = latestOf(sessions, 'prototype');
    const stats = record && record.metrics.task === 'prototype' ? record.metrics.prototype : null;
    const dim: ProfileDimension = {
      key: 'perceptualPrototypeAbstraction',
      label: translate(lang, 'session.dim.perceptualPrototypeAbstraction.label'),
      brain: translate(lang, 'session.dim.perceptualPrototypeAbstraction.brain'),
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    const enoughTestTrials =
      !!stats &&
      stats.testTrialCount >= MIN_TRIALS.prototypeTest &&
      stats.prototypeTrialCount >= 1 &&
      stats.novelDistortionTrialCount >= 1;
    if (!enoughTestTrials || !stats) {
      dim.explanation = UNAVAILABLE(
        translate(lang, 'session.unavailable.prototype', {
          min: MIN_TRIALS.prototypeTest,
          tests: stats?.testTrialCount ?? 0,
          proto: stats?.prototypeTrialCount ?? 0,
          novel: stats?.novelDistortionTrialCount ?? 0,
        })
      );
    } else {
      dim.score = Math.round(clamp(50 + stats.prototypeEnhancementEffect));
      dim.available = true;
      dim.explanation = translate(lang, 'session.explain.prototype');
      dim.detail = translate(lang, 'session.detail.prototype', {
        learning: stats.learningAccuracy,
        learningTrials: stats.learningTrialCount,
        proto: stats.prototypeAccuracy,
        protoTrials: stats.prototypeTrialCount,
        novel: stats.novelDistortionAccuracy,
        novelTrials: stats.novelDistortionTrialCount,
        effect: signed(stats.prototypeEnhancementEffect, 0),
      });
    }
    dimensions.push(dim);
  }

  // 5) Gabor — information integration ------------------------------------
  {
    const record = latestOf(sessions, 'gabor');
    const stats = record && record.metrics.task === 'gabor' ? record.metrics.gabor : null;
    const dim: ProfileDimension = {
      key: 'informationIntegrationMastery',
      label: translate(lang, 'session.dim.informationIntegrationMastery.label'),
      brain: translate(lang, 'session.dim.informationIntegrationMastery.brain'),
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.ii.trials < MIN_TRIALS.gaborPerCondition || stats.ii.accuracy === null) {
      dim.explanation = UNAVAILABLE(
        translate(lang, 'session.unavailable.gabor', {
          min: MIN_TRIALS.gaborPerCondition,
          trials: stats?.ii.trials ?? 0,
        })
      );
    } else {
      dim.score = stats.ii.accuracy;
      dim.available = true;
      dim.explanation = translate(lang, 'session.explain.gabor');
      dim.detail = translate(lang, 'session.detail.gabor', {
        ii: stats.ii.accuracy,
        iiTrials: stats.ii.trials,
        rb:
          stats.rb.accuracy === null
            ? translate(lang, 'session.detail.gabor.notMeasured')
            : translate(lang, 'session.detail.gabor.rbValue', {
                accuracy: stats.rb.accuracy,
                trials: stats.rb.trials,
              }),
      });
    }
    dimensions.push(dim);
  }

  // 6) Load resilience — baseline vs loaded -------------------------------
  {
    const dim: ProfileDimension = {
      key: 'cognitiveLoadResilience',
      label: translate(lang, 'session.dim.cognitiveLoadResilience.label'),
      brain: translate(lang, 'session.dim.cognitiveLoadResilience.brain'),
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };

    const byTask = new Map<TaskId, { baseline: TestSessionRecord[]; loaded: TestSessionRecord[] }>();
    for (const record of sessions) {
      const entry = byTask.get(record.task) ?? { baseline: [], loaded: [] };
      if (isLoadActive(record.loadConfig)) entry.loaded.push(record);
      else entry.baseline.push(record);
      byTask.set(record.task, entry);
    }

    const deltas: { task: TaskId; delta: number }[] = [];
    byTask.forEach((entry, task) => {
      if (entry.baseline.length === 0 || entry.loaded.length === 0) return;
      // 只统计有有效准确率的记录；一条坏记录不应把整组均值算成 NaN。
      const usable = (list: TestSessionRecord[]) =>
        list.filter((r): r is TestSessionRecord & { accuracy: number } => typeof r.accuracy === 'number');
      const mean = (list: TestSessionRecord[]) => {
        const rows = usable(list);
        return rows.length === 0 ? 0 : rows.reduce((acc, r) => acc + r.accuracy, 0) / rows.length;
      };
      deltas.push({ task, delta: mean(entry.loaded) - mean(entry.baseline) });
    });

    if (deltas.length === 0) {
      dim.explanation = UNAVAILABLE(translate(lang, 'session.unavailable.load'));
    } else {
      const meanDelta = deltas.reduce((acc, d) => acc + d.delta, 0) / deltas.length;
      dim.score = Math.round(clamp(70 + meanDelta * 2));
      dim.available = true;
      dim.explanation = translate(lang, 'session.explain.load');
      // Language-neutral join; the "task +Δpp" fragments already carry their own
      // spacing and sign, so both zh and en read correctly here.
      const taskParts = deltas.map(
        (d) => `${translate(lang, TASK_SHORT_LABELS[d.task])} ${signed(d.delta)}pp`
      );
      dim.detail = translate(lang, 'session.detail.load', {
        tasks: taskParts.join(translate(lang, 'session.load.separator')),
        mean: signed(meanDelta),
      });
    }
    dimensions.push(dim);
  }

  const available = dimensions.filter((d) => d.available && d.score !== null);
  const compositeIndex =
    available.length > 0 ? Math.round(available.reduce((acc, d) => acc + (d.score ?? 0), 0) / available.length) : null;

  return {
    dimensions,
    sessionsUsed: sessions.length,
    compositeIndex,
    compositeSampleCount: available.length,
    unavailableLabels: dimensions.filter((d) => !d.available).map((d) => d.label),
  };
}

export function profileToNeuroCognitiveProfile(result: ProfileResult): NeuroCognitiveProfile {
  const profile: NeuroCognitiveProfile = {
    prefrontalFlexibility: null,
    striatalImplicitExtraction: null,
    attentionalSetShifting: null,
    perceptualPrototypeAbstraction: null,
    informationIntegrationMastery: null,
    cognitiveLoadResilience: null,
  };
  for (const dim of result.dimensions) {
    profile[dim.key] = dim.score;
  }
  return profile;
}

// ---------------------------------------------------------------------------
// Export payload
// ---------------------------------------------------------------------------

export interface ExportedReport {
  app: string;
  reportSchema: string;
  generatedAt: string;
  /** Language the human-readable fields of this report were rendered in. */
  lang: Lang;
  dataStatus: 'insufficient' | 'partial' | 'complete';
  dataStatusNote: string;
  cognitiveLoadConfig: CognitiveLoadConfig;
  sessionCount: number;
  sessions: TestSessionRecord[];
  profile: NeuroCognitiveProfile;
  profileDimensions: ProfileDimension[];
  compositeIndex: number | null;
  compositeSampleCount: number;
  dimensionsUnavailable: string[];
  /** Explicitly NOT produced by this system. */
  notProvided: Record<string, string>;
  limitations: string[];
  literatureReferences: string[];
}

/**
 * Data limitations, as message keys. Research-integrity statement: render every
 * entry with `tList(DATA_LIMITATIONS)` (components) or
 * `translateList(lang, DATA_LIMITATIONS)` (services / exports). Do not drop or
 * soften an entry.
 */
export const DATA_LIMITATIONS: MessageKey[] = [
  'session.limitation.normative',
  'session.limitation.wcst',
  'session.limitation.reactionTime',
  'session.limitation.gabor',
  'session.limitation.ided',
  'session.limitation.prototype',
  'session.limitation.loadManipulation',
  'session.limitation.storage',
];

/** Bibliographic entries: identical in both languages (standard citation format). */
export const LITERATURE_REFERENCES: string[] = [
  'Grant, D. A., & Berg, E. (1948). A behavioral analysis of degree of reinforcement and ease of shifting to new responses in a Weigl-type card-sorting problem. Journal of Experimental Psychology, 38(4), 404-411.',
  'Heaton, R. K., Chelune, G. J., Talley, J. L., Kay, G. G., & Curtiss, G. (1993). Wisconsin Card Sorting Test Manual: Revised and Expanded. Psychological Assessment Resources.',
  'Knowlton, B. J., Mangels, J. A., & Squire, L. R. (1996). A neostriatal habit learning system in humans. Science, 273(5280), 1399-1402.',
  'Robbins, T. W., James, M., Owen, A. M., Sahakian, B. J., Lawrence, A. D., McInnes, L., & Rabbitt, P. M. (1998). A study of performance on tests from the CANTAB battery sensitive to frontal lobe dysfunction. Journal of the International Neuropsychological Society, 4(5), 474-490.',
  'Ashby, F. G., & Maddox, W. T. (2005). Human category learning. Annual Review of Psychology, 56, 149-178.',
  'Posner, M. I., & Keele, S. W. (1968). On the genesis of abstract ideas. Journal of Experimental Psychology, 77(3), 353-363.',
];

export function buildReport(
  sessions: TestSessionRecord[],
  cognitiveLoad: CognitiveLoadConfig,
  lang: Lang
): ExportedReport {
  const profileResult = computeProfile(sessions, lang);
  const unavailable = profileResult.unavailableLabels;

  const dataStatus: ExportedReport['dataStatus'] =
    sessions.length === 0 || profileResult.compositeSampleCount === 0
      ? 'insufficient'
      : unavailable.length > 0
      ? 'partial'
      : 'complete';

  const dataStatusNote = translate(
    lang,
    dataStatus === 'insufficient'
      ? 'report.status.insufficient'
      : dataStatus === 'partial'
      ? 'report.status.partial'
      : 'report.status.complete',
    { count: unavailable.length }
  );

  return {
    app: translate(lang, 'report.app'),
    reportSchema: 'neuroclassify-report/2.0',
    generatedAt: new Date().toISOString(),
    lang,
    dataStatus,
    dataStatusNote,
    cognitiveLoadConfig: cognitiveLoad,
    sessionCount: sessions.length,
    sessions,
    profile: profileToNeuroCognitiveProfile(profileResult),
    profileDimensions: profileResult.dimensions,
    compositeIndex: profileResult.compositeIndex,
    compositeSampleCount: profileResult.compositeSampleCount,
    dimensionsUnavailable: unavailable,
    notProvided: {
      clinicalIndicators: translate(lang, 'report.notProvided.clinicalIndicators'),
      normativeComparison: translate(lang, 'report.notProvided.normativeComparison'),
      diagnosis: translate(lang, 'report.notProvided.diagnosis'),
    },
    limitations: translateList(lang, DATA_LIMITATIONS),
    literatureReferences: LITERATURE_REFERENCES,
  };
}
