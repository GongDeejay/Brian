/**
 * Colour palette for the visual change-detection paradigm.
 *
 * The paradigm requires that a "changed" trial really is changed: the probe
 * colour in the test array must differ from the memory array colour at the same
 * position, and it must not duplicate any colour already present in the array
 * (a duplicate would make the array ambiguous and the trial unanswerable).
 *
 * The original code had exactly 10 colours and used `'#ffffff'` as a fallback,
 * which with the `[6, 8, 10]` preset meant that at set size 10 the fallback was
 * used for *every* change trial: ~10% of "changed" trials were actually
 * unchanged (scored as misses) and ~90% of arrays contained a duplicate white
 * square. The palette below is therefore guaranteed to hold at least
 * `2 * MAX_SUPPORTED_SET_SIZE` colours, and `pickChangeColor` never returns a
 * colour that is already in use.
 */

import { pickRandom, sampleWithoutReplacement } from './random';

/** Largest set size reachable from the UI presets ([6, 8, 10]). */
export const MAX_SUPPORTED_SET_SIZE = 10;

/** Minimum palette size required so that a change colour always exists. */
const MIN_PALETTE_SIZE = MAX_SUPPORTED_SET_SIZE * 2;

/**
 * The 10 curated, high-contrast colours that memory arrays are sampled from.
 * Keeping memory arrays on this pool preserves the perceptual difficulty of the
 * original paradigm; the larger generated palette below is the *reservoir* for
 * change colours, which only need to be distinct from the colours in use.
 */
const CURATED_COLORS: readonly string[] = [
  '#ef4444', // Red
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#ffffff', // White
  '#64748b', // Slate
];

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const value = light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0 && Number.isFinite(d)) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function buildPalette(): string[] {
  const palette: string[] = [];
  const seen = new Set<string>();
  const push = (hex: string) => {
    const normalized = hex.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      palette.push(normalized);
    }
  };

  CURATED_COLORS.forEach(push);

  // Generated reservoir: 12 hues x (saturated / dark / light) variants.
  const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  hues.forEach((h) => push(hslToHex(h, 78, 62)));
  hues.forEach((h) => push(hslToHex(h, 72, 38)));
  hues.forEach((h) => push(hslToHex(h, 58, 82)));

  return palette;
}

/** Full palette (curated colours first, followed by generated variants). */
export const COLOR_PALETTE: readonly string[] = buildPalette();

if (COLOR_PALETTE.length < MIN_PALETTE_SIZE) {
  // Programmer error rather than user-facing: fail loudly in development.
  console.error(
    `[color] palette has ${COLOR_PALETTE.length} colours but at least ${MIN_PALETTE_SIZE} are required`
  );
}

/**
 * Draws `setSize` distinct colours for a memory array. Falls back to the whole
 * palette if the requested set size exceeds the curated pool, so the returned
 * array is always free of duplicates.
 */
export function sampleMemoryColors(setSize: number): string[] {
  const pool =
    setSize <= CURATED_COLORS.length ? CURATED_COLORS : COLOR_PALETTE;
  return sampleWithoutReplacement(pool, Math.max(0, Math.min(setSize, pool.length)));
}

/**
 * Picks a change colour that is guaranteed NOT to be present in `usedColors`.
 *
 * This is the function that removes the "no-op change" / "duplicate colour"
 * defect: a returned colour is always a different string from every colour in
 * use, so the probe square visibly changes and no colour is duplicated.
 */
export function pickChangeColor(usedColors: readonly string[]): string {
  const used = new Set(usedColors.map((c) => c.toLowerCase()));
  const candidates = COLOR_PALETTE.filter((c) => !used.has(c));
  if (candidates.length > 0) return pickRandom(candidates);

  // Defensive fallback: every palette colour is already in use. Derive a colour
  // by rotating the hue of a colour in use (never returns '#ffffff' blindly).
  const base = usedColors[0] ?? '#3b82f6';
  const { h, s, l } = hexToHsl(base);
  const saturation = s < 8 ? 85 : Math.min(100, s + 12);
  for (let step = 30; step <= 330; step += 30) {
    const candidate = hslToHex((h + step) % 360, saturation, l > 55 ? Math.max(20, l - 34) : Math.min(88, l + 30));
    if (!used.has(candidate)) return candidate;
  }
  const lastResort = hslToHex((h + 180) % 360, 90, 55);
  return used.has(lastResort) ? hslToHex((h + 90) % 360, 95, 42) : lastResort;
}
