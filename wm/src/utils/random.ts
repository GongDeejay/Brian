/**
 * Unbiased randomization helpers.
 *
 * IMPORTANT: `array.sort(() => Math.random() - 0.5)` is NOT a uniform shuffle.
 * The comparator is inconsistent (it violates transitivity), so the engine's
 * sort algorithm produces a measurably biased permutation distribution — e.g.
 * the first item of a 12-trial list was drawn from one set size ~43% of the time
 * instead of the expected 33.3%. Every shuffle in this project must go through
 * the Fisher-Yates implementation below.
 */

/** In-place Fisher-Yates (Durstenfeld) shuffle. Returns the same array. */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}

/** Returns a new, uniformly shuffled copy. The input is left untouched. */
export function shuffled<T>(items: readonly T[]): T[] {
  return shuffleInPlace(items.slice());
}

/** Uniformly draws `count` distinct items, preserving no particular order. */
export function sampleWithoutReplacement<T>(items: readonly T[], count: number): T[] {
  if (count <= 0) return [];
  return shuffled(items).slice(0, Math.min(count, items.length));
}

/** Uniformly picks one item (uniform because every index has probability 1/n). */
export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('pickRandom: cannot pick from an empty array');
  }
  return items[Math.floor(Math.random() * items.length)];
}
