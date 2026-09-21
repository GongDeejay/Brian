import { IDEDStage, IDEDStats, IDEDTrial } from '../types';
import { translate, type Lang, type MessageKey } from '../i18n';

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
  /** i18n key of the human-readable stage name (resolved via `t` in the view). */
  nameKey: MessageKey;
  /** i18n key of the researcher-facing stage description (never shown to participants). */
  descriptionKey: MessageKey;
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
    nameKey: 'ided.stage.sd.name',
    descriptionKey: 'ided.stage.sd.desc',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 0,
    consecutiveRequired: 6,
  },
  {
    stage: 'SR',
    nameKey: 'ided.stage.sr.name',
    descriptionKey: 'ided.stage.sr.desc',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 1,
    consecutiveRequired: 6,
  },
  {
    stage: 'CD',
    nameKey: 'ided.stage.cd.name',
    descriptionKey: 'ided.stage.cd.desc',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 1,
    consecutiveRequired: 6,
  },
  {
    stage: 'IDS',
    nameKey: 'ided.stage.ids.name',
    descriptionKey: 'ided.stage.ids.desc',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 0,
    consecutiveRequired: 6,
  },
  {
    stage: 'IDR',
    nameKey: 'ided.stage.idr.name',
    descriptionKey: 'ided.stage.idr.desc',
    relevantDimension: 'shape',
    reinforcedIndexInPair: 1,
    consecutiveRequired: 6,
  },
  {
    stage: 'EDS',
    nameKey: 'ided.stage.eds.name',
    descriptionKey: 'ided.stage.eds.desc',
    relevantDimension: 'line',
    reinforcedIndexInPair: 0,
    consecutiveRequired: 6,
  },
  {
    stage: 'EDR',
    nameKey: 'ided.stage.edr.name',
    descriptionKey: 'ided.stage.edr.desc',
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

const SHAPE_NAME_KEYS: Record<IDEDShapeType, MessageKey> = {
  polygon: 'ided.stimulus.shape.polygon',
  oval: 'ided.stimulus.shape.oval',
  star: 'ided.stimulus.shape.star',
  crescent: 'ided.stimulus.shape.crescent',
  cross: 'ided.stimulus.shape.cross',
  hex: 'ided.stimulus.shape.hex',
};

const LINE_NAME_KEYS: Record<IDEDLineType, MessageKey> = {
  wavy: 'ided.stimulus.line.wavy',
  zigzag: 'ided.stimulus.line.zigzag',
  dashed: 'ided.stimulus.line.dashed',
  spiral: 'ided.stimulus.line.spiral',
  dots: 'ided.stimulus.line.dots',
  crosshatch: 'ided.stimulus.line.crosshatch',
};

/** Localised accessible description of a stimulus, e.g. "ellipse with a wavy line overlaid". */
export function describeIDEDStimulus(stimulus: IDEDStimulusVisual, lang: Lang = 'zh'): string {
  const shape = translate(lang, SHAPE_NAME_KEYS[stimulus.shapeType]);
  if (stimulus.lineType === 'none') return shape;
  return translate(lang, 'ided.stimulus.withLine', {
    shape,
    line: translate(lang, LINE_NAME_KEYS[stimulus.lineType]),
  });
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
