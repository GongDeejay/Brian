/**
 * Cognitive Psychology Statistical Algorithms
 * Signal Detection Theory (SDT), Cowan's K, and OSPAN Metrics
 */

// Approximate inverse standard normal distribution (probit function)
// Based on Abramowitz & Stegun / Winitzki approximation
export function normInv(p: number): number {
  if (p <= 0) p = 0.0001;
  if (p >= 1) p = 0.9999;

  // Beasley-Springer-Moro rational approximation
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.383577518672690e2,
    -3.066479806614716e1,
    2.506628277459239e0,
  ];

  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];

  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
    4.374664141464968e0,
    2.938163982698783e0,
  ];

  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e0,
    3.754408661907416e0,
  ];

  const p_low = 0.02425;
  const p_high = 1 - p_low;
  let q: number, r: number;

  if (p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]
    ) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= p_high) {
    q = p - 0.5;
    r = q * q;
    return (
      (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q
    ) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]
    ) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

/**
 * Calculates Signal Detection Theory d' (d-prime)
 * Incorporates log-linear / half-trial correction for extreme rates (Macmillan & Kaplan, 1985)
 *
 * The valid psychometric range used to be clamped to [-1.0, 4.5], which silently
 * rewrote real data: a participant with no hits and false alarms on every trial
 * has a true d' of about -3.11 (with the half-trial correction below), and that
 * value was displayed as -1.0 — hiding genuinely poor performance. The bounds
 * are therefore widened to [-5, 5] purely as a finite/NaN guard; they are wide
 * enough that no achievable hit/false-alarm combination is truncated.
 */
export const D_PRIME_BOUND = 5.0;

export function calculateDPrime(
  hits: number,
  targetCount: number,
  falseAlarms: number,
  nonTargetCount: number
): number {
  if (targetCount === 0 || nonTargetCount === 0) return 0;

  // Half-trial correction
  let hitRate = hits / targetCount;
  let faRate = falseAlarms / nonTargetCount;

  if (hitRate <= 0) hitRate = 0.5 / targetCount;
  if (hitRate >= 1) hitRate = (targetCount - 0.5) / targetCount;

  if (faRate <= 0) faRate = 0.5 / nonTargetCount;
  if (faRate >= 1) faRate = (nonTargetCount - 0.5) / nonTargetCount;

  const zHit = normInv(hitRate);
  const zFA = normInv(faRate);

  const dPrime = zHit - zFA;
  if (!Number.isFinite(dPrime)) return 0;
  const bounded = Math.max(-D_PRIME_BOUND, Math.min(D_PRIME_BOUND, dPrime));
  return Number(bounded.toFixed(2));
}

/**
 * Cowan's K formula: K = N * (H - F)
 * Where N is the set size, H is Hit rate (correct detection of change),
 * and F is False alarm rate (reporting change when identical).
 * Academically proven to measure true number of retained object representations.
 *
 * K is intentionally allowed to be NEGATIVE. The previous `Math.max(0, ...)`
 * raised legitimate below-chance performance (F > H, i.e. "worse than guessing")
 * to 0 and presented it as a neutral capacity estimate. Negative K is now
 * reported honestly. Only the mathematical upper bound is enforced: since H <= 1
 * and F >= 0, K can never exceed the set size N — that clamp is a numeric guard,
 * not a value rewrite.
 */
export function calculateCowanK(
  setSize: number,
  hits: number,
  totalChangedTrials: number,
  falseAlarms: number,
  totalSameTrials: number
): { cowanK: number; hitRate: number; faRate: number } {
  const hitRate = totalChangedTrials > 0 ? hits / totalChangedTrials : 0;
  const faRate = totalSameTrials > 0 ? falseAlarms / totalSameTrials : 0;

  const rawK = setSize * (hitRate - faRate);
  const cowanK = Number.isFinite(rawK)
    ? Number(Math.min(setSize, rawK).toFixed(2))
    : 0;

  return {
    cowanK,
    hitRate: Number((hitRate * 100).toFixed(1)),
    faRate: Number((faRate * 100).toFixed(1)),
  };
}

/**
 * Evaluates Working Memory Capacity grade
 */
export function evaluateKScore(k: number): {
  rating: string;
  badgeColor: string;
  description: string;
} {
  if (!Number.isFinite(k)) {
    return {
      rating: '数据不足 (No Data)',
      badgeColor: 'text-slate-300 bg-slate-900 border-slate-700',
      description: '本会话没有产生可用的判定数据，无法估计容量上限，建议重新测量。',
    };
  }
  if (k < 0) {
    // Kept as an explicit, honest category: K < 0 means F > H.
    return {
      rating: '低于随机水平 (Below Chance)',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
      description: 'K 为负值，说明虚报率高于命中率，判别表现低于随机猜测水平。常见原因：作答过快、未理解按键含义、或维持期内明显分心。建议仔细阅读指导语后重新测量。',
    };
  }
  if (k >= 3.8) {
    return {
      rating: '优异 (Superior)',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
      description: '视觉空间工作记忆容量远超成年人常模，多客体并行表征与抗干扰能力极强。',
    };
  } else if (k >= 3.0) {
    return {
      rating: '良好 (High Normal)',
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-500/30',
      description: '符合典型健康成人的认知神经心理学常模水平（约 3~4 个独立客体）。',
    };
  } else if (k >= 2.0) {
    return {
      rating: '中等 (Normal)',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
      description: '处于基础工作记忆容量区间，建议增加视觉变化检测与干扰抑制的日常训练。',
    };
  } else {
    return {
      rating: '需提升 (Needs Training)',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
      description: '受瞬时注意力分散或维持期信号衰减影响，可通过渐进式 Set Size 练习增强维持稳定性。',
    };
  }
}
