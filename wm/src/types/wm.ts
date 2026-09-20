export type TaskType = 'nback' | 'ospan' | 'change_detection' | 'dashboard';

/**
 * 'assessment' (default): no per-trial correctness feedback, as in standard
 * assessment versions of these paradigms — feedback invites strategy change and
 * emotional arousal that contaminate the measurement.
 * 'practice': full per-trial feedback (text and sound) for training.
 */
export type TaskFeedbackMode = 'practice' | 'assessment';

/**
 * Data-validity indicators recorded while a task runs (focus loss, restarts).
 * Reported with the result so the numbers can be interpreted honestly.
 */
export interface SessionValidityRecord {
  /** Times the page lost focus during the session. */
  interruptions: number;
  /** Accumulated time (ms) spent away from the page while running. */
  totalAwayMs: number;
  /** Trials re-presented from the start because of an interruption. */
  trialRestarts: number;
  /** true only when the session ran without any interruption. */
  isValid: boolean;
}

// N-Back Types
export type NBackStimulusMode = 'spatial' | 'letter' | 'symbol';

export interface NBackConfig {
  n: number; // 1, 2, 3
  stimulusMode: NBackStimulusMode;
  totalTrials: number; // e.g. 20
  stimulusDuration: number; // ms, e.g. 500
  isiDuration: number; // inter-stimulus interval ms, e.g. 1500
  targetRatio: number; // 0.3 (30% target matches)
}

export interface NBackTrial {
  trialIndex: number;
  stimulus: string | number; // position 0-8 or letter 'A', 'K', etc.
  isTarget: boolean; // is it identical to N steps back
  userResponded: boolean;
  userSaidMatch: boolean;
  responseTimeMs: number | null;
  result: 'hit' | 'miss' | 'false_alarm' | 'correct_rejection';
}

export interface NBackResult {
  date: string;
  n: number;
  mode: NBackStimulusMode;
  totalTrials: number;
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  accuracy: number; // (hits + CR) / total
  dPrime: number; // sensitivity index
  meanReactionTimeMs: number;
  validity?: SessionValidityRecord;
}

// OSPAN Types
export interface MathProblem {
  equation: string;
  displayedAnswer: number;
  isCorrect: boolean;
}

export interface OSPANItem {
  problem: MathProblem;
  targetLetter: string;
  userAnsweredCorrectMath?: boolean;
  mathResponseTimeMs?: number;
}

export interface OSPANSet {
  setIndex: number;
  spanLength: number; // 2 to 5 items
  items: OSPANItem[];
  userRecalledLetters: string[];
  isAllCorrectRecall: boolean;
  correctRecallCount: number;
}

export interface OSPANConfig {
  spans: number[]; // e.g. [2, 3, 4, 5]
  practiceMathCount: number;
}

export interface OSPANResult {
  date: string;
  absoluteScore: number; // sum of spanLength for completely correct sets
  totalScore: number; // total correctly recalled letters at correct positions
  maxPossibleScore: number;
  mathAccuracy: number; // percentage, must be >= 85% for validity
  meanMathRT: number;
  sets: {
    spanLength: number;
    targetLetters: string[];
    recalledLetters: string[];
    allCorrect: boolean;
  }[];
  validity?: SessionValidityRecord;
}

// Visual Change Detection Types
export interface ColorSquare {
  id: number;
  x: number; // percentage 10-90%
  y: number; // percentage 10-90%
  color: string;
}

export interface ChangeDetectionTrial {
  trialIndex: number;
  setSize: number; // 4, 6, 8
  memorySquares: ColorSquare[];
  testSquares: ColorSquare[];
  changedIndex: number | null; // which square changed, or null if identical
  probeIndex: number; // index highlighted in test phase
  isChanged: boolean;
  userResponseChanged: boolean | null;
  responseTimeMs: number | null;
  isCorrect: boolean;
  isHit: boolean;
  isFalseAlarm: boolean;
}

export interface ChangeDetectionConfig {
  setSizes: number[]; // [4, 6, 8]
  trialsPerSetSize: number; // e.g. 4 (total 12)
  sampleDurationMs: number; // e.g. 180ms flash duration
  delayDurationMs: number; // e.g. 900ms blank retention
  difficultyPreset?: 'easy' | 'standard' | 'hard' | 'custom';
  probeType?: 'single' | 'whole'; // single: only probe square is highlighted with ?; whole: probe highlighted among array
}

export interface ChangeDetectionResult {
  date: string;
  totalTrials: number;
  overallAccuracy: number;
  meanCowanK: number; // K = N * (H - F)
  breakdownBySetSize: {
    setSize: number;
    trials: number;
    hits: number;
    misses: number;
    falseAlarms: number;
    correctRejections: number;
    hitRate: number;
    falseAlarmRate: number;
    cowanK: number;
  }[];
  meanReactionTimeMs: number;
  validity?: SessionValidityRecord;
}

// Combined Assessment Profile
export interface HistoryRecord {
  id: string;
  timestamp: number;
  type: 'nback' | 'ospan' | 'change_detection';
  scoreDisplay: string;
  detail: string;
}

export interface CognitiveProfile {
  /** Persisted-shape version; older payloads are normalised on read. */
  schemaVersion: number;
  lastNBackResult: NBackResult | null;
  lastOSPANResult: OSPANResult | null;
  lastChangeDetectionResult: ChangeDetectionResult | null;
  history: HistoryRecord[];
}
