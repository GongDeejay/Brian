import { DotPattern, Point2D, PrototypeStats, PrototypeTrial } from '../types';

/**
 * Idealized 9-dot prototypes for Category A and Category B (Posner & Keele 1968)
 */
export const PROTOTYPE_A_DOTS: Point2D[] = [
  { x: 100, y: 35 },
  { x: 55, y: 70 },
  { x: 145, y: 70 },
  { x: 40, y: 120 },
  { x: 160, y: 120 },
  { x: 75, y: 155 },
  { x: 125, y: 155 },
  { x: 90, y: 100 },
  { x: 110, y: 100 },
];

export const PROTOTYPE_B_DOTS: Point2D[] = [
  { x: 50, y: 40 },
  { x: 150, y: 40 },
  { x: 80, y: 75 },
  { x: 120, y: 75 },
  { x: 100, y: 110 },
  { x: 60, y: 145 },
  { x: 140, y: 145 },
  { x: 40, y: 170 },
  { x: 160, y: 170 },
];

/** Learning phase length (feedback provided). */
export const LEARNING_TRIAL_COUNT = 16;
/** Test phase length (NO feedback — the original paradigm gives none). */
export const TEST_TRIAL_COUNT = 24;
/** Minimum learning trials before the participant may start the test phase early. */
export const MIN_LEARNING_BEFORE_EARLY_TEST = 8;

const TRAINING_DISTORTION = 3.5;

const baseDotsFor = (category: 'A' | 'B') => (category === 'A' ? PROTOTYPE_A_DOTS : PROTOTYPE_B_DOTS);

/**
 * Applies Gaussian-distributed perturbation to generate a distortion of a prototype
 */
export function generateDistortion(
  baseDots: Point2D[],
  category: 'A' | 'B',
  type: 'prototype' | 'training_distortion' | 'novel_distortion',
  distortionLevel: number = 3,
  idSuffix?: string
): DotPattern {
  const suffix = idSuffix ?? `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  if (distortionLevel === 0 || type === 'prototype') {
    return {
      id: `proto_${category}_${suffix}`,
      category,
      type: 'prototype',
      distortionLevel: 0,
      dots: baseDots.map((d) => ({ ...d })),
    };
  }

  // Sigma determines spread of perturbation
  const sigma = distortionLevel * 5.5;

  const distortedDots = baseDots.map((pt) => {
    // Box-Muller transform for normal distribution
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

    const nx = Math.max(15, Math.min(185, pt.x + z0 * sigma));
    const ny = Math.max(15, Math.min(185, pt.y + z1 * sigma));

    return { x: Math.round(nx), y: Math.round(ny) };
  });

  return {
    id: `dist_${category}_${suffix}`,
    category,
    type,
    distortionLevel,
    dots: distortedDots,
  };
}

/**
 * Learning-phase trial N: a fixed, balanced alternation of categories
 * (8 A / 8 B over 16 trials) instead of a per-trial coin flip, so A/B base rates
 * and ordering are controlled.
 */
export function generateLearningPattern(trialIndex: number): DotPattern {
  const category: 'A' | 'B' = trialIndex % 2 === 0 ? 'A' : 'B';
  return generateDistortion(
    baseDotsFor(category),
    category,
    'training_distortion',
    TRAINING_DISTORTION,
    `learn_${trialIndex}`
  );
}

/**
 * Pre-generated, fixed, balanced test sequence:
 *  count/3 never-seen prototypes, count/3 novel distortions, count/3 repeated
 *  training distortions, with an even A/B split inside every type. The order is
 *  shuffled ONCE per session and then held fixed, so the test phase has a stated
 *  length, balanced base rates, and no run-away loop.
 */
export function generatePrototypeTestSequence(count: number = TEST_TRIAL_COUNT): DotPattern[] {
  const perType = Math.floor(count / 3);
  const types: DotPattern['type'][] = ['prototype', 'novel_distortion', 'training_distortion'];
  const patterns: DotPattern[] = [];
  let toggle = 0;

  for (const type of types) {
    for (let i = 0; i < perType; i++) {
      const category: 'A' | 'B' = toggle++ % 2 === 0 ? 'A' : 'B';
      const level = type === 'prototype' ? 0 : TRAINING_DISTORTION;
      patterns.push(generateDistortion(baseDotsFor(category), category, type, level, `test_${type}_${i}`));
    }
  }

  // Fisher-Yates shuffle (order fixed for the whole session once generated)
  for (let i = patterns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [patterns[i], patterns[j]] = [patterns[j], patterns[i]];
  }

  return patterns;
}

export function calculatePrototypeStats(trials: PrototypeTrial[]): PrototypeStats {
  const learningTrials = trials.filter((t) => t.phase === 'learning');
  const testTrials = trials.filter((t) => t.phase === 'test');

  const pct = (list: PrototypeTrial[]) =>
    list.length > 0 ? Math.round((list.filter((t) => t.isCorrect).length / list.length) * 100) : 0;

  const learningAcc = pct(learningTrials);
  const protoTrials = testTrials.filter((t) => t.pattern.type === 'prototype');
  const novelTrials = testTrials.filter((t) => t.pattern.type === 'novel_distortion');
  const protoAcc = pct(protoTrials);
  const novelAcc = pct(novelTrials);

  const rtSamples = trials.filter((t) => typeof t.reactionTimeMs === 'number' && t.reactionTimeMs !== null);
  const avgReactionTimeMs =
    rtSamples.length > 0
      ? Math.round(rtSamples.reduce((acc, t) => acc + (t.reactionTimeMs as number), 0) / rtSamples.length)
      : null;

  return {
    overallAccuracy: pct(trials),
    learningAccuracy: learningAcc,
    prototypeAccuracy: protoAcc, // Accuracy on never-seen prototypes
    novelDistortionAccuracy: novelAcc,
    // Prototype enhancement: never-seen prototype vs novel distortions
    prototypeEnhancementEffect: protoAcc - novelAcc,
    learningTrialCount: learningTrials.length,
    testTrialCount: testTrials.length,
    prototypeTrialCount: protoTrials.length,
    novelDistortionTrialCount: novelTrials.length,
    avgReactionTimeMs,
    rtSampleCount: rtSamples.length,
  };
}
