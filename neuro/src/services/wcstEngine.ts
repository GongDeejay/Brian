import { WCSTCard, WCSTColor, WCSTNumber, WCSTRule, WCSTShape, WCSTStats, WCSTTrial } from '../types';

export const WCST_COLORS: WCSTColor[] = ['red', 'green', 'yellow', 'blue'];
export const WCST_SHAPES: WCSTShape[] = ['triangle', 'star', 'cross', 'circle'];
export const WCST_NUMBERS: WCSTNumber[] = [1, 2, 3, 4];

/**
 * Standard 4 WCST Reference Benchmark Cards (Heaton 1993)
 */
export const WCST_REFERENCE_CARDS: WCSTCard[] = [
  { id: 'ref_1', color: 'red', shape: 'triangle', number: 1 },
  { id: 'ref_2', color: 'green', shape: 'star', number: 2 },
  { id: 'ref_3', color: 'yellow', shape: 'cross', number: 3 },
  { id: 'ref_4', color: 'blue', shape: 'circle', number: 4 },
];

export const RULE_SEQUENCE: WCSTRule[] = ['color', 'shape', 'number', 'color', 'shape', 'number'];

/**
 * Generates a full shuffled deck of 64 or 128 unique attribute combinations
 */
export function generateWCSTDeck(cardCount: number = 64): WCSTCard[] {
  const cards: WCSTCard[] = [];
  let idCounter = 1;

  while (cards.length < cardCount) {
    for (const color of WCST_COLORS) {
      for (const shape of WCST_SHAPES) {
        for (const number of WCST_NUMBERS) {
          cards.push({
            id: `wcst_card_${idCounter++}`,
            color,
            shape,
            number,
          });
          if (cards.length >= cardCount) break;
        }
        if (cards.length >= cardCount) break;
      }
      if (cards.length >= cardCount) break;
    }
  }

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

/**
 * Checks which rules match between a test card and a reference card
 */
export function getMatchedRules(testCard: WCSTCard, refCard: WCSTCard): WCSTRule[] {
  const matches: WCSTRule[] = [];
  if (testCard.color === refCard.color) matches.push('color');
  if (testCard.shape === refCard.shape) matches.push('shape');
  if (testCard.number === refCard.number) matches.push('number');
  return matches;
}

/**
 * Calculates complete clinical WCST performance statistics.
 *
 * Honesty rules enforced here:
 *  - omissions (non-responses) are counted as their own category and are NOT
 *    counted as non-perseverative errors;
 *  - the mean RT is computed only over trials with a real measured RT (null when
 *    no such trial exists) instead of substituting a plausible constant;
 *  - accuracy is reported over RESPONDED trials, with the omission count kept
 *    separate so time-limited sessions cannot silently inflate/deflate it.
 */
export function calculateWCSTStats(trials: WCSTTrial[], categoriesCompleted: number): WCSTStats {
  const totalTrials = trials.length;
  if (totalTrials === 0) {
    return {
      totalTrials: 0,
      correctTrials: 0,
      accuracy: 0,
      categoriesCompleted: 0,
      perseverativeResponses: 0,
      perseverativeErrors: 0,
      perseverativeErrorRate: 0,
      nonPerseverativeErrors: 0,
      omissions: 0,
      omissionRate: 0,
      conceptualLevelResponses: 0,
      failureToMaintainSet: 0,
      trialsToFirstCategory: 0,
      avgReactionTimeMs: null,
      rtSampleCount: 0,
    };
  }

  const correctTrials = trials.filter((t) => t.isCorrect).length;
  const perseverativeResponses = trials.filter((t) => t.isPerseverativeResponse).length;
  const perseverativeErrors = trials.filter((t) => t.isPerseverativeError).length;
  const omissions = trials.filter((t) => t.isOmission).length;
  const nonPerseverativeErrors = trials.filter((t) => t.isNonPerseverativeError && !t.isOmission).length;
  const respondedTrials = totalTrials - omissions;

  // Conceptual Level Responses (runs of >= 3 correct)
  let conceptualLevelResponses = 0;
  let currentRun = 0;
  for (const t of trials) {
    if (t.isCorrect) {
      currentRun++;
    } else {
      if (currentRun >= 3) {
        conceptualLevelResponses += currentRun;
      }
      currentRun = 0;
    }
  }
  if (currentRun >= 3) {
    conceptualLevelResponses += currentRun;
  }

  // Failure to Maintain Set (error after 5 or more correct, before category switch)
  let failureToMaintainSet = 0;
  let streak = 0;
  for (const t of trials) {
    if (t.isCorrect) {
      streak++;
    } else {
      if (streak >= 5 && streak < 10) {
        failureToMaintainSet++;
      }
      streak = 0;
    }
    if (t.ruleShiftOccurred) {
      streak = 0;
    }
  }

  // Trials to first category
  const firstCategoryShiftIndex = trials.findIndex((t) => t.ruleShiftOccurred);
  const trialsToFirstCategory = firstCategoryShiftIndex >= 0 ? firstCategoryShiftIndex + 1 : totalTrials;

  // Reaction time: only over trials that actually have a measured RT.
  const rtSamples = trials.filter((t) => typeof t.reactionTimeMs === 'number' && t.reactionTimeMs !== null);
  const rtSampleCount = rtSamples.length;
  const avgReactionTimeMs =
    rtSampleCount > 0
      ? Math.round(rtSamples.reduce((acc, t) => acc + (t.reactionTimeMs as number), 0) / rtSampleCount)
      : null;

  return {
    totalTrials,
    correctTrials,
    accuracy: respondedTrials > 0 ? Math.round((correctTrials / respondedTrials) * 100) : 0,
    categoriesCompleted,
    perseverativeResponses,
    perseverativeErrors,
    perseverativeErrorRate: Math.round((perseverativeErrors / totalTrials) * 100),
    nonPerseverativeErrors,
    omissions,
    omissionRate: Math.round((omissions / totalTrials) * 100),
    conceptualLevelResponses,
    failureToMaintainSet,
    trialsToFirstCategory,
    avgReactionTimeMs,
    rtSampleCount,
  };
}
