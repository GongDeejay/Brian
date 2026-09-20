import { WPTCardCue, WPTStats, WPTTrial } from '../types';

export const WPT_CUES: WPTCardCue[] = [
  {
    id: 1,
    name: '三角星云 (Triangles)',
    pattern: 'triangular_mosaic',
    independentRainProb: 0.756,
  },
  {
    id: 2,
    name: '嵌套棱形 (Diamonds)',
    pattern: 'nested_diamonds',
    independentRainProb: 0.575,
  },
  {
    id: 3,
    name: '同心圆环 (Circles)',
    pattern: 'radiating_stars',
    independentRainProb: 0.425,
  },
  {
    id: 4,
    name: '方形矩阵 (Squares)',
    pattern: 'geometric_grid',
    independentRainProb: 0.244,
  },
];

// All 14 non-empty combinations of 1 to 3 cards (Knowlton et al. 1996)
export const VALID_CARD_COMBINATIONS: number[][] = [
  // 1 card
  [1], [2], [3], [4],
  // 2 cards
  [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4],
  // 3 cards
  [1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4],
];

/**
 * Calculates Bayesian posterior probability of Rain given the combination of active cards
 * Assuming flat prior P(Rain) = 0.5 and conditional cue independence
 */
export function calculatePRainForCombination(cardIds: number[]): number {
  let logOdds = 0;
  for (const id of cardIds) {
    const cue = WPT_CUES.find((c) => c.id === id);
    if (!cue) continue;
    const p = cue.independentRainProb;
    logOdds += Math.log(p / (1 - p));
  }
  // Convert log odds back to probability: P = 1 / (1 + exp(-logOdds))
  const pRain = 1 / (1 + Math.exp(-logOdds));
  // Keep within reasonable bounds
  return Math.max(0.05, Math.min(0.95, Math.round(pRain * 1000) / 1000));
}

/**
 * Generates a sequence of balanced trials for the Weather Prediction Task.
 * All 14 legal cue combinations (Knowlton 1996) are presented with approximately
 * equal frequency, shuffled — instead of sampling a uniform random combination per
 * trial, which leaves some patterns much rarer than others.
 */
export function generateWPTTrialSequence(trialCount: number = 50): { activeCards: number[]; pRain: number }[] {
  const cycles = Math.ceil(trialCount / VALID_CARD_COMBINATIONS.length);
  const pool: number[][] = [];
  for (let c = 0; c < cycles; c++) {
    for (const combo of VALID_CARD_COMBINATIONS) pool.push(combo);
  }

  // Fisher-Yates shuffle of the whole pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, trialCount).map((combo) => ({
    activeCards: combo,
    pRain: calculatePRainForCombination(combo),
  }));
}

/**
 * Computes WPT performance statistics, block learning curves, and basal ganglia mastery index.
 *
 * Honesty rules:
 *  - timeouts (no response) are excluded from the rate denominators and reported
 *    separately, so a non-response can never masquerade as a strategic choice;
 *  - the mean RT uses only real measured RTs (null when none exist).
 */
export function calculateWPTStats(trials: WPTTrial[]): WPTStats {
  const totalTrials = trials.length;
  if (totalTrials === 0) {
    return {
      totalTrials: 0,
      respondedTrials: 0,
      timeouts: 0,
      optimalRate: 0,
      actualAccuracy: 0,
      blockAccuracies: [],
      basalGangliaImplicitIndex: 0,
      avgReactionTimeMs: null,
      rtSampleCount: 0,
    };
  }

  const responded = trials.filter((t) => !t.isTimeout && t.userChoice !== null);
  const timeouts = totalTrials - responded.length;
  const optimalTrials = responded.filter((t) => t.isOptimal).length;
  const correctTrials = responded.filter((t) => t.isCorrect).length;
  const optimalRate = responded.length > 0 ? Math.round((optimalTrials / responded.length) * 100) : 0;
  const actualAccuracy = responded.length > 0 ? Math.round((correctTrials / responded.length) * 100) : 0;

  // Group trials into blocks of 10 by administered position
  const blockSize = 10;
  const blockAccuracies: { block: number; optimalRate: number; actualRate: number }[] = [];
  const numBlocks = Math.ceil(totalTrials / blockSize);

  for (let b = 0; b < numBlocks; b++) {
    const blockTrials = trials.slice(b * blockSize, (b + 1) * blockSize);
    const blockResponded = blockTrials.filter((t) => !t.isTimeout && t.userChoice !== null);
    if (blockResponded.length === 0) continue;
    const bOptimal = blockResponded.filter((t) => t.isOptimal).length;
    const bCorrect = blockResponded.filter((t) => t.isCorrect).length;
    blockAccuracies.push({
      block: b + 1,
      optimalRate: Math.round((bOptimal / blockResponded.length) * 100),
      actualRate: Math.round((bCorrect / blockResponded.length) * 100),
    });
  }

  // Calculate Basal Ganglia Implicit Index (0 to 100)
  // Higher if:
  // 1. Overall optimal rate exceeds 50% chance level
  // 2. Later blocks show positive learning progression compared to block 1
  let learningGain = 0;
  if (blockAccuracies.length >= 2) {
    const firstBlockOpt = blockAccuracies[0].optimalRate;
    const lastBlockOpt = blockAccuracies[blockAccuracies.length - 1].optimalRate;
    learningGain = Math.max(0, lastBlockOpt - firstBlockOpt);
  }
  
  // Basal ganglia implicit score formula: weighted mix of optimal rate (70%) and learning progression (30%)
  const rawImplicitScore = ((optimalRate - 40) / 45) * 70 + (learningGain / 30) * 30;
  const basalGangliaImplicitIndex = Math.max(10, Math.min(98, Math.round(rawImplicitScore)));
  // Reaction time: only over trials that actually have a measured RT.
  const rtSamples = trials.filter((t) => typeof t.reactionTimeMs === 'number' && t.reactionTimeMs !== null);
  const rtSampleCount = rtSamples.length;
  const avgReactionTimeMs =
    rtSampleCount > 0
      ? Math.round(rtSamples.reduce((acc, t) => acc + (t.reactionTimeMs as number), 0) / rtSampleCount)
      : null;

  return {
    totalTrials,
    respondedTrials: responded.length,
    timeouts,
    optimalRate,
    actualAccuracy,
    blockAccuracies,
    basalGangliaImplicitIndex,
    avgReactionTimeMs,
    rtSampleCount,
  };
}
