import { GaborStimulus, GaborStats, GaborTaskType, GaborTrial } from '../types';

/** Paint size of the Gabor patch in CSS pixels (the backing store is DPR-scaled). */
export const GABOR_SIZE_PX = 220;

/** Deterministic PRNG so a given noise level always reproduces the same image. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates Gabor Stimuli for RB and II tasks
 */
export function generateGaborStimulus(taskType: GaborTaskType): GaborStimulus {
  const sf = Math.round((2.0 + Math.random() * 6.0) * 10) / 10; // Spatial frequency 2.0 - 8.0
  const orient = Math.round(15 + Math.random() * 60); // Orientation degrees 15° - 75°

  let category: 'A' | 'B';

  if (taskType === 'rule_based') {
    // Single dimensional boundary: Spatial frequency > 5.0 -> Category B, else Category A
    category = sf >= 5.0 ? 'B' : 'A';
  } else {
    // Diagonal Information-Integration boundary: sf * 10 + orient > 95 -> Category B
    const combinedVal = sf * 10 + orient;
    category = combinedVal >= 95 ? 'B' : 'A';
  }

  return {
    id: `gabor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    spatialFrequency: sf,
    orientationDegrees: orient,
    category,
    // Seeded per trial so the exact rendered stimulus can be reproduced later.
    noiseSeed: Math.floor(Math.random() * 2147483647),
  };
}

/**
 * Renders a mathematical Gabor patch onto an HTML5 Canvas element.
 * Formula: I(x,y) = L0 * [1 + C * exp(-(x'^2 + y'^2)/(2*sigma^2)) * cos(2*pi*f*x' + phi)]
 *
 * The canvas backing store must already be sized (width/height) by the caller —
 * the view multiplies GABOR_SIZE_PX by devicePixelRatio so the grating is rendered
 * at native resolution instead of being upscaled (which would blur and attenuate
 * the spatial frequency, i.e. the very property being manipulated).
 *
 * Noise is deterministically seeded from `noiseSeed`, so the same trial always
 * produces exactly the same image.
 *
 * @returns false when a 2D context is unavailable, so the caller can show a fallback.
 */
export function renderGaborOnCanvas(
  canvas: HTMLCanvasElement,
  spatialFrequency: number,
  orientationDegrees: number,
  noiseLevel: number = 0,
  noiseSeed: number = 1
): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const width = canvas.width;
  const height = canvas.height;
  if (width <= 0 || height <= 0) return false;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const rng = mulberry32(noiseSeed || 1);

  const centerX = width / 2;
  const centerY = height / 2;
  const sigma = width / 4.2; // Gaussian envelope radius
  const thetaRad = (orientationDegrees * Math.PI) / 180;
  const freq = (spatialFrequency / width) * 2.8; // Normalized cycles

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;

      // Rotate coordinates
      const xPrime = dx * Math.cos(thetaRad) + dy * Math.sin(thetaRad);
      const yPrime = -dx * Math.sin(thetaRad) + dy * Math.cos(thetaRad);

      // Gaussian envelope
      const distSq = xPrime * xPrime + yPrime * yPrime;
      const envelope = Math.exp(-distSq / (2 * sigma * sigma));

      // Sinusoidal carrier
      const carrier = Math.cos(2 * Math.PI * freq * xPrime);

      // Base gray 128
      let val = 128 + 115 * envelope * carrier;

      // Deterministic visual noise if cognitive load requires
      if (noiseLevel > 0) {
        val += (rng() - 0.5) * (noiseLevel * 1.5);
      }

      const clamped = Math.max(0, Math.min(255, Math.round(val)));
      const pixelIdx = (y * width + x) * 4;

      data[pixelIdx] = clamped;     // Red
      data[pixelIdx + 1] = clamped; // Green
      data[pixelIdx + 2] = clamped; // Blue
      data[pixelIdx + 3] = 255;     // Alpha
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return true;
}

/**
 * Statistics for a set of Gabor trials (normally the trials completed since the
 * last submission). Only measured values; accuracy is null when a condition has
 * no trials at all.
 */
export function calculateGaborStats(trials: GaborTrial[]): GaborStats {
  const build = (list: GaborTrial[]) => ({
    trials: list.length,
    correctTrials: list.filter((t) => t.isCorrect).length,
    accuracy: list.length > 0 ? Math.round((list.filter((t) => t.isCorrect).length / list.length) * 100) : null,
  });

  const rb = build(trials.filter((t) => t.taskType === 'rule_based'));
  const ii = build(trials.filter((t) => t.taskType === 'information_integration'));

  const rtSamples = trials.filter((t) => typeof t.reactionTimeMs === 'number' && t.reactionTimeMs !== null);
  const avgReactionTimeMs =
    rtSamples.length > 0
      ? Math.round(rtSamples.reduce((acc, t) => acc + (t.reactionTimeMs as number), 0) / rtSamples.length)
      : null;

  return {
    totalTrials: trials.length,
    accuracy: trials.length > 0 ? Math.round((trials.filter((t) => t.isCorrect).length / trials.length) * 100) : 0,
    rb,
    ii,
    avgReactionTimeMs,
    rtSampleCount: rtSamples.length,
  };
}
