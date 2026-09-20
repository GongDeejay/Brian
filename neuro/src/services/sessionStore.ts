import {
  CognitiveLoadConfig,
  NeuroCognitiveProfile,
  ParadigmStats,
  ProfileDimension,
  ProfileResult,
  TaskId,
  TestSessionRecord,
} from '../types';

/**
 * Session store + profile derivation.
 *
 * HARD RULE: nothing in this file may invent a measurement.
 * A dimension without a valid underlying measurement resolves to `null`
 * (rendered as 暂无数据) and is reported as unavailable in the export.
 */

export const SESSION_STORAGE_KEY = 'neuroclassify.sessions.v1';
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

export const TASK_LABELS: Record<TaskId, string> = {
  wcst: '威斯康星卡片分类测验 (WCST)',
  wpt: '天气预测任务 (WPT)',
  ided: '注意定势转移测验 (ID/ED)',
  gabor: 'Gabor 斑点分类 (RB / II)',
  prototype: '点阵原型畸变测验 (Posner)',
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

export function describeLoad(config: CognitiveLoadConfig): string {
  const parts: string[] = [];
  if (config.timeLimitSeconds > 0) parts.push(`限时 ${config.timeLimitSeconds}s`);
  if (config.workingMemoryDistractor) parts.push('双任务数字探测');
  if (config.perceptualNoiseLevel > 0) parts.push(`知觉噪声 ${config.perceptualNoiseLevel}%`);
  if (config.distractorInterference) parts.push('无关特征干扰');
  return parts.length > 0 ? parts.join(' · ') : '标准基线（无附加负荷）';
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
}

/**
 * The single "key metric" headline for a session, plus the overall accuracy.
 * Both are derived from measured values only.
 */
export function describeSession(
  metrics: ParadigmStats
): { accuracy: number; keyMetricName: string; keyMetricValue: string } {
  switch (metrics.task) {
    case 'wcst': {
      const s = metrics.wcst;
      return {
        accuracy: s.accuracy,
        keyMetricName: '持续性错误率 (PE Rate)',
        keyMetricValue: `${s.perseverativeErrorRate}%（PE ${s.perseverativeErrors} 次 / 共 ${s.totalTrials} 次试验）`,
      };
    }
    case 'wpt': {
      const s = metrics.wpt;
      return {
        accuracy: s.actualAccuracy,
        keyMetricName: '最优选择率 (Optimal Rate)',
        keyMetricValue: `${s.optimalRate}%（实际命中率 ${s.actualAccuracy}%）`,
      };
    }
    case 'ided': {
      const s = metrics.ided;
      return {
        accuracy: s.accuracy,
        keyMetricName: 'EDS 维度间错误数',
        keyMetricValue: `${s.edsErrors} 次（完成阶段 ${s.stagesCompleted}/7${
          s.failedStage ? `，${s.failedStage} 阶段达到 ${s.maxTrialsPerStage} 次上限未通过` : ''
        }）`,
      };
    }
    case 'gabor': {
      const s = metrics.gabor;
      return {
        accuracy: s.accuracy,
        keyMetricName: '信息整合 (II) 条件正确率',
        keyMetricValue:
          s.ii.accuracy === null ? '未测得（本次未完成 II 条件试验）' : `${s.ii.accuracy}%（${s.ii.trials} 次试验）`,
      };
    }
    case 'prototype':
    default: {
      const s = metrics.prototype;
      return {
        accuracy: s.overallAccuracy,
        keyMetricName: '原型优势效应 (Prototype Enhancement)',
        keyMetricValue: `${signed(s.prototypeEnhancementEffect, 0)}pp（原型 ${s.prototypeAccuracy}% / 新畸变 ${s.novelDistortionAccuracy}%）`,
      };
    }
  }
}

export function createSessionRecord(input: SessionRecordInput): TestSessionRecord {
  const described = describeSession(input.metrics);
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

export function computeProfile(sessions: TestSessionRecord[]): ProfileResult {
  const dimensions: ProfileDimension[] = [];

  // 1) WCST — prefrontal flexibility --------------------------------------
  {
    const record = latestOf(sessions, 'wcst');
    const stats = record && record.metrics.task === 'wcst' ? record.metrics.wcst : null;
    const dim: ProfileDimension = {
      key: 'prefrontalFlexibility',
      label: '前额叶灵活性 (WCST)',
      brain: '背外侧前额叶 (DLPFC)',
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.totalTrials < MIN_TRIALS.wcst) {
      dim.explanation = UNAVAILABLE(
        `暂无数据：需要一个至少 ${MIN_TRIALS.wcst} 次试验的 WCST 完整记录（当前${
          stats ? `仅 ${stats.totalTrials} 次` : '无记录'
        }）`
      );
    } else {
      const categoryPart = (stats.categoriesCompleted / 6) * 100;
      const pePenalty = Math.min(100, stats.perseverativeErrorRate * 3);
      dim.score = Math.round(clamp(categoryPart * 0.6 + (100 - pePenalty) * 0.4));
      dim.available = true;
      dim.explanation =
        '完成分类数（权重 60%）与持续性错误率（权重 40%，PE 率 33% 时该项计 0 分）的加权内部指数';
      dim.detail = `${stats.totalTrials} 次试验 · 完成分类 ${stats.categoriesCompleted}/6 · PE ${stats.perseverativeErrors} 次 (${stats.perseverativeErrorRate}%) · 非持续错误 ${stats.nonPerseverativeErrors} 次 · 未反应 ${stats.omissions} 次`;
    }
    dimensions.push(dim);
  }

  // 2) WPT — striatal implicit extraction ---------------------------------
  {
    const record = latestOf(sessions, 'wpt');
    const stats = record && record.metrics.task === 'wpt' ? record.metrics.wpt : null;
    const dim: ProfileDimension = {
      key: 'striatalImplicitExtraction',
      label: '基底节内隐提取 (WPT)',
      brain: '纹状体 / 基底核 (Striatum)',
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.totalTrials < MIN_TRIALS.wpt) {
      dim.explanation = UNAVAILABLE(
        `暂无数据：需要一个至少 ${MIN_TRIALS.wpt} 次试验的 WPT 完整记录（当前${
          stats ? `仅 ${stats.totalTrials} 次` : '无记录'
        }）`
      );
    } else {
      const first = stats.blockAccuracies[0]?.optimalRate ?? null;
      const last = stats.blockAccuracies[stats.blockAccuracies.length - 1]?.optimalRate ?? null;
      dim.score = stats.basalGangliaImplicitIndex;
      dim.available = true;
      dim.explanation =
        '直接采用 WPT 引擎的内隐指数（最优选择率占 70%、末区块相对首区块的学习增益占 30%，引擎内截断于 10–98）';
      dim.detail = `${stats.totalTrials} 次试验 · 最优选择率 ${stats.optimalRate}% · 实际命中率 ${stats.actualAccuracy}%${
        first !== null && last !== null ? ` · 首/末区块最优率 ${first}% → ${last}%` : ''
      }`;
    }
    dimensions.push(dim);
  }

  // 3) ID/ED — attentional set shifting -----------------------------------
  {
    const record = latestOf(sessions, 'ided');
    const stats = record && record.metrics.task === 'ided' ? record.metrics.ided : null;
    const dim: ProfileDimension = {
      key: 'attentionalSetShifting',
      label: '注意定势转移 (ID/ED)',
      brain: '外侧前额叶 / 眶额叶 (OFC)',
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.stagesCompleted + (stats.failedStage ? 1 : 0) < 1) {
      dim.explanation = UNAVAILABLE('暂无数据：需要一段完成至少 1 个 ID/ED 阶段的记录');
    } else {
      const stagePart = (stats.stagesCompleted / 7) * 100 * 0.7;
      const edsBonus = stats.passedEDS ? 30 : 0;
      const shiftPenalty = Math.min(30, stats.edsShiftCost * 5);
      dim.score = Math.round(clamp(stagePart + edsBonus - shiftPenalty));
      dim.available = true;
      dim.explanation =
        '阶段完成度（满分 70 分）+ 通过 EDS 奖励 30 分 − EDS/IDS 转移代价惩罚（每 1 次扣 5 分，上限 30 分）';
      dim.detail = `完成 ${stats.stagesCompleted}/7 阶段 · EDS 错误 ${stats.edsErrors} 次 · IDS 错误 ${stats.idsErrors} 次 · 转移代价 ${stats.edsShiftCost} · 总错误 ${stats.totalErrors} 次${
        stats.failedStage ? ` · ${stats.failedStage} 阶段达 ${stats.maxTrialsPerStage} 次上限未通过` : ''
      }`;
    }
    dimensions.push(dim);
  }

  // 4) Prototype — abstraction --------------------------------------------
  {
    const record = latestOf(sessions, 'prototype');
    const stats = record && record.metrics.task === 'prototype' ? record.metrics.prototype : null;
    const dim: ProfileDimension = {
      key: 'perceptualPrototypeAbstraction',
      label: '原型模式抽象 (Posner)',
      brain: '腹侧视觉通路 (IT Cortex)',
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
        `暂无数据：测试阶段需要 ≥${MIN_TRIALS.prototypeTest} 次试验，且同时包含未见原型与新畸变试次（当前测试 ${
          stats?.testTrialCount ?? 0
        } 次 / 原型 ${stats?.prototypeTrialCount ?? 0} 次 / 新畸变 ${stats?.novelDistortionTrialCount ?? 0} 次）`
      );
    } else {
      dim.score = Math.round(clamp(50 + stats.prototypeEnhancementEffect));
      dim.available = true;
      dim.explanation = '以“原型正确率 − 新畸变正确率”（原型优势效应）线性映射：50 分 = 无优势，每 +1pp 加 1 分';
      dim.detail = `学习阶段正确率 ${stats.learningAccuracy}%（${stats.learningTrialCount} 次）· 未见原型 ${stats.prototypeAccuracy}%（${stats.prototypeTrialCount} 次）· 新畸变 ${stats.novelDistortionAccuracy}%（${stats.novelDistortionTrialCount} 次）· 优势 ${signed(
        stats.prototypeEnhancementEffect,
        0
      )}pp`;
    }
    dimensions.push(dim);
  }

  // 5) Gabor — information integration ------------------------------------
  {
    const record = latestOf(sessions, 'gabor');
    const stats = record && record.metrics.task === 'gabor' ? record.metrics.gabor : null;
    const dim: ProfileDimension = {
      key: 'informationIntegrationMastery',
      label: '非言语信息整合 (Gabor)',
      brain: '皮层-纹状体突触 (COVIS)',
      score: null,
      available: false,
      explanation: '',
      detail: '',
    };
    if (!stats || stats.ii.trials < MIN_TRIALS.gaborPerCondition || stats.ii.accuracy === null) {
      dim.explanation = UNAVAILABLE(
        `暂无数据：需要至少 ${MIN_TRIALS.gaborPerCondition} 次信息整合 (II) 条件试验（当前 ${
          stats?.ii.trials ?? 0
        } 次）`
      );
    } else {
      dim.score = stats.ii.accuracy;
      dim.available = true;
      dim.explanation = '直接采用信息整合 (II) 条件正确率（百分制，随机猜测水平 = 50 分），未做常模或阈值校正';
      dim.detail = `II 条件 ${stats.ii.accuracy}%（${stats.ii.trials} 次）· RB 条件 ${
        stats.rb.accuracy === null ? '未测得' : `${stats.rb.accuracy}%（${stats.rb.trials} 次）`
      }`;
    }
    dimensions.push(dim);
  }

  // 6) Load resilience — baseline vs loaded -------------------------------
  {
    const dim: ProfileDimension = {
      key: 'cognitiveLoadResilience',
      label: '高负荷抗压度 (Load)',
      brain: '前扣带回皮层 (ACC)',
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
      const mean = (list: TestSessionRecord[]) => list.reduce((acc, r) => acc + r.accuracy, 0) / list.length;
      deltas.push({ task, delta: mean(entry.loaded) - mean(entry.baseline) });
    });

    if (deltas.length === 0) {
      dim.explanation = UNAVAILABLE(
        '暂无数据：需要在同一任务下同时具备“标准基线”与至少一项负荷开关（限时/双任务/噪声/干扰）的完整记录，才能比较负荷前后正确率'
      );
    } else {
      const meanDelta = deltas.reduce((acc, d) => acc + d.delta, 0) / deltas.length;
      dim.score = Math.round(clamp(70 + meanDelta * 2));
      dim.available = true;
      dim.explanation = '以 70 分为“负荷下无差异”基准，正确率每变化 1 个百分点计 ±2 分（线性近似）';
      dim.detail = `比较任务：${deltas
        .map((d) => `${TASK_LABELS[d.task].split(' ')[0]} ${signed(d.delta)}pp`)
        .join('、')} · 平均 ${signed(meanDelta)}pp`;
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

export const DATA_LIMITATIONS: string[] = [
  '本系统不提供任何临床常模：所有 0–100 数值均为本系统内部指数，未经年龄/教育/性别校正，不具备诊断效力，不能替代标准化临床评估。',
  'WCST：使用 Heaton 标准的 128 卡（两副完整 64 张牌组）与最多 6 个分类的上限，规则转换为“连续 10 次正确”；但未实现手工施测程序与部分计分衍生指标（如学习到学会、60 卡后停止规则），卡组顺序为程序伪随机生成而非标准固定顺序。',
  '反应时：仅测量“刺激呈现至按键”的浏览器端时间，包含显示器刷新、输入设备与事件调度延迟，未做硬件时标校准；未反应的试次（omission）不产生反应时。',
  'Gabor：条纹以像素频率生成，未按视角（cycles/degree）标定，屏幕尺寸与观看距离不受控，也未实现阶梯法/恒定刺激法的阈值测量，因此空间频率与对比度不具备跨设备可比性。',
  'ID/ED：阶段内正确维度示例固定、无关维度随机变化，左右位置逐试次随机化；刺激为简化几何图形而非 CANTAB 标准刺激集；每阶段上限 50 次试验，达上限即判定该阶段未通过；未实现 CD_D 阶段。',
  '原型畸变：测试阶段使用固定的平衡序列（无反馈），学习阶段为交替平衡序列；点阵扰动为高斯微扰，σ 未经心理测量学标定。',
  '认知负荷操控：知觉噪声为像素级叠加、无关特征干扰为静态图形叠加，均未做操控效度检验；双任务为 3 位数字瞬时保持的简化版本。',
  '数据仅保存在当前浏览器的 sessionStorage 中（上限 40 条），关闭标签页即清除，不上传、不跨设备汇总，也不做去重或受试者编号管理。',
];

export const LITERATURE_REFERENCES: string[] = [
  'Grant, D. A., & Berg, E. (1948). A behavioral analysis of degree of reinforcement and ease of shifting to new responses in a Weigl-type card-sorting problem. Journal of Experimental Psychology, 38(4), 404-411.',
  'Heaton, R. K., Chelune, G. J., Talley, J. L., Kay, G. G., & Curtiss, G. (1993). Wisconsin Card Sorting Test Manual: Revised and Expanded. Psychological Assessment Resources.',
  'Knowlton, B. J., Mangels, J. A., & Squire, L. R. (1996). A neostriatal habit learning system in humans. Science, 273(5280), 1399-1402.',
  'Robbins, T. W., James, M., Owen, A. M., Sahakian, B. J., Lawrence, A. D., McInnes, L., & Rabbitt, P. M. (1998). A study of performance on tests from the CANTAB battery sensitive to frontal lobe dysfunction. Journal of the International Neuropsychological Society, 4(5), 474-490.',
  'Ashby, F. G., & Maddox, W. T. (2005). Human category learning. Annual Review of Psychology, 56, 149-178.',
  'Posner, M. I., & Keele, S. W. (1968). On the genesis of abstract ideas. Journal of Experimental Psychology, 77(3), 353-363.',
];

export function buildReport(sessions: TestSessionRecord[], cognitiveLoad: CognitiveLoadConfig): ExportedReport {
  const profileResult = computeProfile(sessions);
  const unavailable = profileResult.unavailableLabels;

  const dataStatus: ExportedReport['dataStatus'] =
    sessions.length === 0 || profileResult.compositeSampleCount === 0
      ? 'insufficient'
      : unavailable.length > 0
      ? 'partial'
      : 'complete';

  const dataStatusNote =
    dataStatus === 'insufficient'
      ? '数据不足：本报告中没有任何维度具备可解释的最小样本量，因此不存在任何能力分数或临床结论。请先完成至少一项完整测验。'
      : dataStatus === 'partial'
      ? `部分数据：${unavailable.length} 个维度缺少可解释的最小样本量，这些维度在报告中为 null 并已逐条说明原因；其余维度由实际测量值计算。`
      : '数据完整：全部 6 个维度均由实际测量值计算得出。';

  return {
    app: 'NeuroClassify 认知神经科学分类与模式识别测评系统',
    reportSchema: 'neuroclassify-report/2.0',
    generatedAt: new Date().toISOString(),
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
      clinicalIndicators:
        '本系统不产生临床判定语句（如“正常”“优异”“极低耗损”）。此类结论需要标准化常模与临床访谈，工具本身无法给出。',
      normativeComparison: '未提供常模百分位/标准分对照，因为没有本工具对应的常模数据。',
      diagnosis: '本工具为科研与教学演示用途，不用于诊断、分级或任何临床决策。',
    },
    limitations: DATA_LIMITATIONS,
    literatureReferences: LITERATURE_REFERENCES,
  };
}
