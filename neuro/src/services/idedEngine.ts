import { IDEDStage, IDEDStats, IDEDTrial } from '../types';

export type IDEDShapeType = 'polygon' | 'oval' | 'star' | 'crescent' | 'cross' | 'hex';
export type IDEDLineType = 'wavy' | 'zigzag' | 'dashed' | 'spiral' | 'dots' | 'crosshatch';

export interface IDEDStimulusVisual {
  id: string;
  shapeType: IDEDShapeType;
  lineType: IDEDLineType | 'none';
  color: string;
  lineColor: string;
}

export interface IDEDStageDefinition {
  stage: IDEDStage;
  name: string;
  description: string;
  relevantDimension: 'shape' | 'line';
  /**
   * Index inside the pair returned by `getStimuliForStage` whose RELEVANT
   * dimension is reinforced. The on-screen left/right position of that stimulus is
   * randomised independently on every trial (see IDEDView), so this index never
   * corresponds to a fixed side.
   */
  reinforcedIndexInPair: 0 | 1;
  consecutiveRequired: number; // usually 6
}

/** CANTAB caps every stage at 50 trials; exceeding the cap fails the stage. */
export const MAX_TRIALS_PER_STAGE = 50;

export const IDED_STAGES_CONFIG: IDEDStageDefinition[] = [
  {
    stage: 'SD',
    name: '简单辨别 (Simple Discrimination)',
    description: '学习在两个基础图形中识别出受奖励的目标项。',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 0,
    consecutiveRequired: 6,
  },
  {
    stage: 'SR',
    name: '简单逆转 (Simple Reversal)',
    description: '同一图形下奖励规则突然对调，测量初级逆转学习。',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 1,
    consecutiveRequired: 6,
  },
  {
    stage: 'CD',
    name: '复合辨别 (Compound Discrimination)',
    description: '引入不相关的线条干扰项（每试次变化），需维持对图形维度的选择性注意。',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 1,
    consecutiveRequired: 6,
  },
  {
    stage: 'IDS',
    name: '维度内定势转移 (Intra-Dimensional Shift)',
    description: '出现全新图形和全新线条，但分类关键维度仍然是“图形”。',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 0,
    consecutiveRequired: 6,
  },
  {
    stage: 'IDR',
    name: '维度内逆转 (ID Reversal)',
    description: '新图形中的正确目标对调。',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 1,
    consecutiveRequired: 6,
  },
  {
    stage: 'EDS',
    name: '维度间定势转移 (Extra-Dimensional Shift)',
    description: '核心测试：注意定势必须从“图形”打破，转移至之前无关的“线条”（图形每试次变化）。',
    relevantDimension: 'line',
    reinforcedIndexInPair: 0,
    consecutiveRequired: 6,
  },
  {
    stage: 'EDR',
    name: '维度间逆转 (ED Reversal)',
    description: '在线条规则下奖励对调，验证前额叶对新维度的稳定抑制与灵活调控。',
    relevantDimension: 'line',
    reinforcedIndexInPair: 1,
    consecutiveRequired: 6,
  },
];

// ---------------------------------------------------------------------------
// Stimulus construction
//
// Validity rules implemented here:
//  * the RELEVANT dimension exemplars are fixed inside a stage (the discrimination
//    the participant must learn stays constant);
//  * the IRRELEVANT dimension is varied across trials with an exactly balanced
//    rotation, so it can never become a reliable predictor of the answer;
//  * left/right position is randomised per trial in the view;
//  * everything is fully determined by (stage, trial index inside the stage), so a
//    session is reproducible and auditable.
// ---------------------------------------------------------------------------

const SHAPE_POOL: IDEDShapeType[] = ['polygon', 'oval', 'star', 'crescent', 'hex', 'cross'];
const LINE_POOL: IDEDLineType[] = ['wavy', 'zigzag', 'dashed', 'spiral', 'dots', 'crosshatch'];
const IRRELEVANT_OFFSET = 3; // coprime with the pool length (6) -> the two stimuli always differ

const SHAPE_NAMES: Record<IDEDShapeType, string> = {
  polygon: '三角形',
  oval: '椭圆',
  star: '星形',
  crescent: '月牙',
  cross: '十字',
  hex: '六边形',
};

const LINE_NAMES: Record<IDEDLineType | 'none', string> = {
  wavy: '波浪线',
  zigzag: '锯齿线',
  dashed: '虚线',
  spiral: '螺旋线',
  dots: '点线圈',
  crosshatch: '交叉线',
  none: '无线条',
};

export function describeIDEDStimulus(stimulus: IDEDStimulusVisual): string {
  const shape = SHAPE_NAMES[stimulus.shapeType];
  const line = stimulus.lineType === 'none' ? '' : `，叠加${LINE_NAMES[stimulus.lineType]}`;
  return `${shape}${line}`;
}

/** Fixed relevant-dimension exemplars per stage. */
const RELEVANT_EXEMPLARS: Record<IDEDStage, { shapeA: IDEDShapeType; shapeB: IDEDShapeType; colorA: string; colorB: string; lineA: IDEDLineType | 'none'; lineB: IDEDLineType | 'none'; lineColorA: string; lineColorB: string }> = {
  SD: { shapeA: 'oval', shapeB: 'polygon', colorA: '#3b82f6', colorB: '#10b981', lineA: 'none', lineB: 'none', lineColorA: 'transparent', lineColorB: 'transparent' },
  SR: { shapeA: 'oval', shapeB: 'polygon', colorA: '#3b82f6', colorB: '#10b981', lineA: 'none', lineB: 'none', lineColorA: 'transparent', lineColorB: 'transparent' },
  CD: { shapeA: 'oval', shapeB: 'polygon', colorA: '#3b82f6', colorB: '#10b981', lineA: 'wavy', lineB: 'zigzag', lineColorA: '#64748b', lineColorB: '#64748b' },
  IDS: { shapeA: 'star', shapeB: 'crescent', colorA: '#f59e0b', colorB: '#8b5cf6', lineA: 'dashed', lineB: 'dots', lineColorA: '#94a3b8', lineColorB: '#94a3b8' },
  IDR: { shapeA: 'star', shapeB: 'crescent', colorA: '#f59e0b', colorB: '#8b5cf6', lineA: 'dashed', lineB: 'dots', lineColorA: '#94a3b8', lineColorB: '#94a3b8' },
  EDS: { shapeA: 'hex', shapeB: 'cross', colorA: '#ec4899', colorB: '#6366f1', lineA: 'spiral', lineB: 'crosshatch', lineColorA: '#0ea5e9', lineColorB: '#f43f5e' },
  EDR: { shapeA: 'hex', shapeB: 'cross', colorA: '#ec4899', colorB: '#6366f1', lineA: 'spiral', lineB: 'crosshatch', lineColorA: '#0ea5e9', lineColorB: '#f43f5e' },
};

/**
 * Returns the two stimuli for the given stage and trial position inside that stage.
 * Index `IDED_STAGES_CONFIG[..].reinforcedIndexInPair` holds the reinforced exemplar.
 */
export function getStimuliForStage(stage: IDEDStage, trialIndexInStage: number = 0): [IDEDStimulusVisual, IDEDStimulusVisual] {
  const exemplars = RELEVANT_EXEMPLARS[stage];
  const step = Math.max(0, Math.floor(trialIndexInStage));

  const variantShapeA = SHAPE_POOL[step % SHAPE_POOL.length];
  const variantShapeB = SHAPE_POOL[(step + IRRELEVANT_OFFSET) % SHAPE_POOL.length];
  const variantLineA = LINE_POOL[step % LINE_POOL.length];
  const variantLineB = LINE_POOL[(step + IRRELEVANT_OFFSET) % LINE_POOL.length];

  const definition = IDED_STAGES_CONFIG.find((s) => s.stage === stage);
  const lineIsRelevant = definition?.relevantDimension === 'line';

  if (lineIsRelevant) {
    // Relevant = line (fixed exemplars); irrelevant = shape (balanced variation).
    return [
      {
        id: `${stage}_lineA_${variantShapeA}`,
        shapeType: variantShapeA,
        lineType: exemplars.lineA,
        color: exemplars.colorA,
        lineColor: exemplars.lineColorA,
      },
      {
        id: `${stage}_lineB_${variantShapeB}`,
        shapeType: variantShapeB,
        lineType: exemplars.lineB,
        color: exemplars.colorB,
        lineColor: exemplars.lineColorB,
      },
    ];
  }

  // Relevant = shape (fixed exemplars); irrelevant = line (balanced variation).
  // SD/SR present no lines at all (the line dimension does not exist yet).
  const noLines = exemplars.lineA === 'none' && exemplars.lineB === 'none';
  return [
    {
      id: `${stage}_shapeA_${noLines ? 'none' : variantLineA}`,
      shapeType: exemplars.shapeA,
      lineType: noLines ? 'none' : variantLineA,
      color: exemplars.colorA,
      lineColor: noLines ? 'transparent' : exemplars.lineColorA,
    },
    {
      id: `${stage}_shapeB_${noLines ? 'none' : variantLineB}`,
      shapeType: exemplars.shapeB,
      lineType: noLines ? 'none' : variantLineB,
      color: exemplars.colorB,
      lineColor: noLines ? 'transparent' : exemplars.lineColorB,
    },
  ];
}

/**
 * ID/ED statistics. `stagesCompleted` counts fully passed stages (0-7);
 * `failedStage` is the stage that hit the 50-trial cap without reaching criterion.
 */
export function calculateIDEDStats(
  trials: IDEDTrial[],
  stagesCompleted: number,
  failedStage: IDEDStage | null = null
): IDEDStats {
  const totalErrors = trials.filter((t) => !t.isCorrect).length;
  const edsTrials = trials.filter((t) => t.stage === 'EDS');
  const edsErrors = edsTrials.filter((t) => !t.isCorrect).length;
  const idsTrials = trials.filter((t) => t.stage === 'IDS');
  const idsErrors = idsTrials.filter((t) => !t.isCorrect).length;

  const passedEDS = stagesCompleted >= 6 && failedStage === null;
  const edsShiftCost = Math.max(0, edsErrors - idsErrors);

  const currentStage = failedStage ?? IDED_STAGES_CONFIG[stagesCompleted]?.stage ?? null;
  const trialsInCurrentStage = currentStage ? trials.filter((t) => t.stage === currentStage).length : 0;

  return {
    currentStageIndex: stagesCompleted,
    stagesCompleted,
    totalErrors,
    edsErrors,
    idsErrors,
    edsShiftCost,
    passedEDS,
    failedStage,
    failedStageErrors: failedStage ? trials.filter((t) => t.stage === failedStage && !t.isCorrect).length : null,
    trialsInCurrentStage,
    maxTrialsPerStage: MAX_TRIALS_PER_STAGE,
    accuracy: trials.length > 0 ? Math.round((trials.filter((t) => t.isCorrect).length / trials.length) * 100) : 0,
  };
}
