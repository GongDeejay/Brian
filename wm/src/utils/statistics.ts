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
 * Qualitative band of a Cowan's K estimate.
 *
 * The band ids are stable, machine-readable labels — deliberately NOT the
 * rendered text. Before this refactor the function returned Chinese
 * `rating` / `description` strings and the UI had to reverse-map them onto i18n
 * keys by string comparison (`resolveKEvalKeys`), so editing a single character
 * of copy silently broke the localized result banner. Callers now switch on the
 * id and look the copy up under `kEval.<band>.rating` / `.description`.
 *
 * The numeric thresholds below are the research criterion and must not change.
 */
export type KEvalBand =
  | 'noData'
  | 'belowChance'
  | 'superior'
  | 'high'
  | 'normal'
  | 'needsTraining';

export interface KEval {
  band: KEvalBand;
  /**
   * Measured K, carried so the caller can render it alongside the band copy.
   * `null` when the input was not a finite number (the `noData` band).
   */
  k: number | null;
  badgeColor: string;
}

/**
 * Evaluates Working Memory Capacity grade.
 *
 * Returns the band id and the display colour only; all user-facing copy lives in
 * the i18n catalogue (`kEval.*`, src/i18n/messages/utils.ts).
 */
export function evaluateKScore(k: number): KEval {
  if (!Number.isFinite(k)) {
    return {
      band: 'noData',
      k: null,
      badgeColor: 'text-slate-300 bg-slate-900 border-slate-700',
    };
  }
  if (k < 0) {
    // Kept as an explicit, honest category: K < 0 means F > H.
    return {
      band: 'belowChance',
      k,
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
    };
  }
  if (k >= 3.8) {
    return {
      band: 'superior',
      k,
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    };
  } else if (k >= 3.0) {
    return {
      band: 'high',
      k,
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-500/30',
    };
  } else if (k >= 2.0) {
    return {
      band: 'normal',
      k,
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    };
  } else {
    return {
      band: 'needsTraining',
      k,
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
    };
  }
}
