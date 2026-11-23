/**
 * The infinity curve used across the homepage (hero ribbon, reviews loop, FAQ lens).
 *
 * Lemniscate of Bernoulli with x in [-1, 1]. `b` stretches the lobes vertically.
 * y is flipped so that, with increasing u, the path runs:
 *   centre → bottom of the right lobe → up the right extreme → top of the right lobe →
 *   centre → bottom of the left lobe → up the left extreme → top of the left lobe → centre.
 * Words therefore cross the centre (where the device sits) in both directions.
 */
export function lemniscate(u: number, b = 1): [number, number] {
  const s = Math.sin(u);
  const c = Math.cos(u);
  const k = 1 / (1 + c * c);
  return [s * k, -b * s * c * k];
}

export type CurvePoint = { x: number; y: number; tx: number; ty: number; u: number };

export type ArcTable = {
  /** Total length of the unit curve. */
  length: number;
  /** Point and unit tangent at arc length `s` (wraps). */
  at: (s: number) => CurvePoint;
};

/** Arc-length parametrisation, so things placed along the curve keep even spacing. */
export function arcTable(b = 1, samples = 2048): ArcTable {
  const us = new Float64Array(samples + 1);
  const ss = new Float64Array(samples + 1);
  let [px, py] = lemniscate(0, b);
  let acc = 0;
  for (let i = 0; i <= samples; i++) {
    const u = (i / samples) * Math.PI * 2;
    const [x, y] = lemniscate(u, b);
    if (i) acc += Math.hypot(x - px, y - py);
    us[i] = u;
    ss[i] = acc;
    px = x;
    py = y;
  }
  const length = acc;

  const uAt = (sIn: number) => {
    const s = ((sIn % length) + length) % length;
    let lo = 0;
    let hi = samples;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (ss[mid] <= s) lo = mid;
      else hi = mid;
    }
    const span = ss[hi] - ss[lo] || 1;
    return us[lo] + ((s - ss[lo]) / span) * (us[hi] - us[lo]);
  };

  return {
    length,
    at(s: number) {
      const u = uAt(s);
      const [x, y] = lemniscate(u, b);
      const [x2, y2] = lemniscate(u + 1e-4, b);
      const dx = x2 - x;
      const dy = y2 - y;
      const l = Math.hypot(dx, dy) || 1;
      return { x, y, tx: dx / l, ty: dy / l, u };
    },
  };
}

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
