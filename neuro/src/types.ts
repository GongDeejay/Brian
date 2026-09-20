/**
 * Cognitive Neuroscience Classification & Pattern Recognition Task Types
 * Grounded in WCST, WPT, CANTAB ID/ED, COVIS (Ashby), and Prototype Distortion Literature
 *
 * NOTE ON DATA HONESTY:
 * Every metric that can be missing is typed as `number | null` (or `undefined`).
 * `null` / `undefined` means "this measurement was not obtained" and MUST be rendered
 * as 暂无数据 / 未测得 — never replaced by a plausible-looking constant.
 */

export type TaskId = 'wcst' | 'wpt' | 'ided' | 'gabor' | 'prototype';

export interface CognitiveLoadConfig {
  timeLimitSeconds: number; // 0 = unlimited, 1.5, 2.0, 3.0, 5.0
  workingMemoryDistractor: boolean; // Dual-task digit probe (WCST only)
  perceptualNoiseLevel: number; // 0 to 100% visual noise
  distractorInterference: boolean; // Overlaid irrelevant visual patterns
  presetName?: 'baseline' | 'high_load' | 'wm_stress' | 'perceptual_noise' | 'custom';
}

/** Payload a paradigm sends upwards when a session is finished. */
export interface SessionReport<TStats> {
  stats: TStats;
  durationSeconds: number;
  /** Genuinely measured extras (e.g. dual-task WM probe accuracy). Never invented. */
  extraMetrics?: Record<string, number | string | null>;
}

// ---------------- WCST Types ----------------
export type WCSTColor = 'red' | 'green' | 'yellow' | 'blue';
export type WCSTShape = 'triangle' | 'star' | 'cross' | 'circle';
export type WCSTNumber = 1 | 2 | 3 | 4;
export type WCSTRule = 'color' | 'shape' | 'number';

export interface WCSTCard {
  id: string;
  color: WCSTColor;
  shape: WCSTShape;
  number: WCSTNumber;
}

export interface WCSTTrial {
  trialNumber: number;
  testCard: WCSTCard;
  /** -1 = omission (the participant did not respond) */
  chosenReferenceIndex: number;
  /** null = omission — no card was chosen, so no fake card is stored */
  chosenCard: WCSTCard | null;
  currentActiveRule: WCSTRule;
  matchedRules: WCSTRule[];
  /** true when the trial ended without a response (time limit expired) */
  isOmission: boolean;
  isCorrect: boolean;
  isPerseverativeResponse: boolean;
  isPerseverativeError: boolean;
  isNonPerseverativeError: boolean;
  /** true elapsed time in ms; null for omissions (no response time exists) */
  reactionTimeMs: number | null;
  consecutiveCorrect: number;
  ruleShiftOccurred: boolean;
}

export interface WCSTStats {
  totalTrials: number;
  correctTrials: number;
  accuracy: number;
  categoriesCompleted: number; // Max 6 (C-S-N-C-S-N)
  perseverativeResponses: number;
  perseverativeErrors: number;
  perseverativeErrorRate: number; // PE / Total Trials %
  nonPerseverativeErrors: number;
  /** No-response trials. Counted separately: an omission is not an NPE response. */
  omissions: number;
  /** Omissions / total trials % */
  omissionRate: number;
  conceptualLevelResponses: number; // Runs of >= 3 correct
  failureToMaintainSet: number; // Error after 5+ correct
  trialsToFirstCategory: number;
  /** Mean RT over trials that actually have a measured RT; null when none exist */
  avgReactionTimeMs: number | null;
  rtSampleCount: number;
}

// ---------------- WPT (Weather Prediction Task) Types ----------------
export type WeatherOutcome = 'rain' | 'sun';

export interface WPTCardCue {
  id: number; // 1, 2, 3, 4
  name: string;
  pattern: 'geometric_grid' | 'nested_diamonds' | 'radiating_stars' | 'triangular_mosaic';
  independentRainProb: number; // Standard: 0.756, 0.575, 0.425, 0.244
}

export interface WPTTrial {
  trialNumber: number;
  activeCards: number[]; // e.g. [1, 3]
  pRain: number; // Calculated Bayesian probability for this specific combination
  optimalChoice: WeatherOutcome; // Whichever outcome has p > 0.5
  /** null = no response was given (time limit expired) */
  userChoice: WeatherOutcome | null;
  actualOutcome: WeatherOutcome; // Sampled probabilistically
  isOptimal: boolean;
  isCorrect: boolean;
  /** true when the time limit expired without a response */
  isTimeout: boolean;
  reactionTimeMs: number | null;
  blockNumber: number;
}

export interface WPTStats {
  totalTrials: number;
  /** Trials where the participant actually responded (totalTrials - timeouts) */
  respondedTrials: number;
  timeouts: number;
  optimalRate: number; // % of RESPONDED trials where the higher-prob outcome was chosen
  actualAccuracy: number; // % of RESPONDED trials matching the probabilistic outcome
  blockAccuracies: { block: number; optimalRate: number; actualRate: number }[];
  basalGangliaImplicitIndex: number; // Score 0-100 reflecting implicit rule extraction
  avgReactionTimeMs: number | null;
  rtSampleCount: number;
}

// ---------------- ID/ED (Set-Shifting) Types ----------------
export type IDEDStage =
  | 'SD'   // Simple Discrimination
  | 'SR'   // Simple Reversal
  | 'CD'   // Compound Discrimination (irrelevant line added)
  | 'IDS'  // Intra-Dimensional Shift (new shapes, shape still relevant)
  | 'IDR'  // ID Reversal
  | 'EDS'  // Extra-Dimensional Shift (line dimension becomes relevant!)
  | 'EDR'; // ED Reversal

export interface IDEDTrial {
  trialNumber: number;
  stage: IDEDStage;
  /** Display position that was chosen: 0 = 左侧, 1 = 右侧 */
  chosenIndex: number;
  /** Display position that was reinforced on THIS trial (randomised per trial) */
  reinforcedSide: 0 | 1;
  chosenStimulusId: string;
  reinforcedStimulusId: string;
  isCorrect: boolean;
  reactionTimeMs: number | null;
  consecutiveCorrectInStage: number;
}

export interface IDEDStats {
  currentStageIndex: number;
  stagesCompleted: number;
  totalErrors: number;
  edsErrors: number; // Landmark Cantab measure of attentional set shift failure
  idsErrors: number;
  edsShiftCost: number; // EDS errors - IDS errors
  passedEDS: boolean;
  /** Stage that hit the per-stage trial cap without reaching criterion (null = none) */
  failedStage: IDEDStage | null;
  /** Errors made in the stage that failed the cap (null when no stage failed) */
  failedStageErrors: number | null;
  trialsInCurrentStage: number;
  maxTrialsPerStage: number;
  accuracy: number;
}

// ---------------- Ashby Gabor (II vs RB) Types ----------------
export type GaborTaskType = 'rule_based' | 'information_integration';

export interface GaborStimulus {
  id: string;
  spatialFrequency: number; // 1 to 10
  orientationDegrees: number; // 0 to 90
  category: 'A' | 'B';
  /** Deterministic noise seed so the exact same stimulus image can be reproduced */
  noiseSeed: number;
}

export interface GaborTrial {
  trialNumber: number;
  taskType: GaborTaskType;
  stimulus: GaborStimulus;
  userChoice: 'A' | 'B';
  isCorrect: boolean;
  reactionTimeMs: number | null;
}

export interface GaborConditionStats {
  trials: number;
  correctTrials: number;
  /** null when the condition has no trials at all */
  accuracy: number | null;
}

export interface GaborStats {
  /** Total trials across both task modes in this session */
  totalTrials: number;
  accuracy: number;
  rb: GaborConditionStats;
  ii: GaborConditionStats;
  avgReactionTimeMs: number | null;
  rtSampleCount: number;
}

// ---------------- Prototype Distortion (Posner & Keele) Types ----------------
export interface Point2D {
  x: number;
  y: number;
}

export interface DotPattern {
  id: string;
  category: 'A' | 'B';
  type: 'prototype' | 'training_distortion' | 'novel_distortion';
  distortionLevel: number; // 0 (prototype) to 5 (high distortion)
  dots: Point2D[];
}

export interface PrototypeTrial {
  trialNumber: number;
  phase: 'learning' | 'test';
  pattern: DotPattern;
  userChoice: 'A' | 'B';
  isCorrect: boolean;
  reactionTimeMs: number | null;
}

export interface PrototypeStats {
  /** Accuracy over every recorded trial (learning + test) */
  overallAccuracy: number;
  learningAccuracy: number;
  prototypeAccuracy: number; // Accuracy on never-seen prototypes
  novelDistortionAccuracy: number;
  prototypeEnhancementEffect: number; // Prototype Acc - Novel Distortion Acc (Abstraction index)
  learningTrialCount: number;
  testTrialCount: number;
  prototypeTrialCount: number;
  novelDistortionTrialCount: number;
  avgReactionTimeMs: number | null;
  rtSampleCount: number;
}

// ---------------- Overall Profile / Session History ----------------
/**
 * 0-100 per dimension, or `null` when no valid measurement exists for that
 * dimension. `null` MUST be displayed as 暂无数据 and never as a number.
 */
export interface NeuroCognitiveProfile {
  prefrontalFlexibility: number | null; // WCST PE rate & categories completed
  striatalImplicitExtraction: number | null; // WPT optimal rate & learning slope
  attentionalSetShifting: number | null; // ID/ED EDS outcome & reversal cost
  perceptualPrototypeAbstraction: number | null; // Posner prototype enhancement
  informationIntegrationMastery: number | null; // Ashby Gabor II condition
  cognitiveLoadResilience: number | null; // Baseline vs loaded accuracy delta
}

export type ParadigmStats =
  | { task: 'wcst'; wcst: WCSTStats }
  | { task: 'wpt'; wpt: WPTStats }
  | { task: 'ided'; ided: IDEDStats }
  | { task: 'gabor'; gabor: GaborStats }
  | { task: 'prototype'; prototype: PrototypeStats };

export interface TestSessionRecord {
  id: string;
  timestamp: string;
  task: TaskId;
  durationSeconds: number;
  accuracy: number;
  loadConfig: CognitiveLoadConfig;
  keyMetricName: string;
  keyMetricValue: string;
  /** Full measured statistics of the paradigm run (never synthesised) */
  metrics: ParadigmStats;
  /** Additional genuinely measured values (e.g. dual-task probe accuracy) */
  extraMetrics?: Record<string, number | string | null>;
}

export interface ProfileDimension {
  key: keyof NeuroCognitiveProfile;
  label: string;
  brain: string;
  /** null = 暂无数据 */
  score: number | null;
  available: boolean;
  /** Why the dimension is unavailable, or how the score was derived */
  explanation: string;
  /** Raw measured values backing the score */
  detail: string;
}

export interface ProfileResult {
  dimensions: ProfileDimension[];
  sessionsUsed: number;
  compositeIndex: number | null;
  compositeSampleCount: number;
  /** Dimensions with no usable measurement */
  unavailableLabels: string[];
}
