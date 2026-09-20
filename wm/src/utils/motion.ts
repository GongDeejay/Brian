import confetti from 'canvas-confetti';

/** True when the visitor asked the OS/browser for reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

type ConfettiOptions = Parameters<typeof confetti>[0];

/**
 * Fires the completion celebration only when motion is acceptable.
 * Under `prefers-reduced-motion: reduce` the confetti is skipped entirely.
 */
export function fireConfetti(options: ConfettiOptions = {}): void {
  if (prefersReducedMotion()) return;
  try {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, ...options });
  } catch {
    // canvas may be unavailable (e.g. blocked in an embedded frame)
  }
}
