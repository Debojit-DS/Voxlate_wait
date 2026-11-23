"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The waitlist wall: solid tapes, exactly like the tapes of the gift section, cross the whole page
 * and carry every member's name in random order, each exactly once. Navy tapes sit in front of
 * slate-blue ones.
 *
 * Only names go on the tapes. They are shared across every tape (no name is ever shown twice, and no
 * name is ever on screen twice at once); if there are fewer names than tapes, the spare tapes carry
 * just the ∞ marks so the wall stays full.
 */

type Tone = "slate" | "navy";
type Tape = { angle: number; offset: number; tone: Tone; dir: 1 | -1 };

/* `offset` slides a tape sideways as a fraction of half the wall's diagonal. */
const TAPES: Tape[] = [
  { angle: -18, offset: -0.66, tone: "navy", dir: 1 },
  { angle: 58, offset: 0.34, tone: "slate", dir: -1 },
  { angle: 14, offset: 0.5, tone: "navy", dir: -1 },
  { angle: -58, offset: -0.3, tone: "slate", dir: 1 },
  { angle: -6, offset: 0.1, tone: "slate", dir: -1 },
  { angle: 26, offset: -0.32, tone: "navy", dir: 1 },
  { angle: -66, offset: 0.56, tone: "navy", dir: -1 },
  { angle: 70, offset: -0.62, tone: "slate", dir: 1 },
  { angle: -30, offset: 0.82, tone: "slate", dir: -1 },
  { angle: 6, offset: -0.9, tone: "slate", dir: 1 },
  { angle: 40, offset: 0.78, tone: "navy", dir: 1 },
  { angle: -40, offset: -0.02, tone: "navy", dir: -1 },
  { angle: 84, offset: 0.16, tone: "slate", dir: 1 },
  { angle: -2, offset: 0.34, tone: "navy", dir: 1 },
  { angle: 3, offset: 0.68, tone: "slate", dir: -1 },
  { angle: -76, offset: 0.46, tone: "slate", dir: 1 },
];

/* Straight from the gift section: navy and slate-blue tapes, ink or paper text, blue ∞. */
const TONES: Record<Tone, { height: number; font: number; speed: number; shift: number; z: number; bg: string; text: string; mark: string; shadow: string }> = {
  slate: {
    height: 48,
    font: 18,
    speed: 22,
    shift: 6,
    z: 1,
    bg: "#8D97AD",
    text: "#0D1B2A",
    mark: "#1F3FB8",
    shadow: "0 14px 30px -16px rgba(13,27,42,0.55)",
  },
  navy: {
    height: 56,
    font: 21,
    speed: 30,
    shift: 12,
    z: 2,
    bg: "#0D1B2A",
    text: "#F4F3EF",
    mark: "#6F86FF",
    shadow: "0 18px 40px -18px rgba(13,27,42,0.7)",
  },
};


/** Length of a tape that is visible on a w × h wall (0 if it misses). */
function visibleLength(t: Tape, w: number, h: number) {
  const a = (t.angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const off = t.offset * (Math.hypot(w, h) / 2);
  const px = w / 2 - Math.sin(a) * off;
  const py = h / 2 + Math.cos(a) * off;
  let lo = -Infinity;
  let hi = Infinity;
  for (const [p, d, max] of [
    [px, dx, w],
    [py, dy, h],
  ] as const) {
    if (Math.abs(d) < 1e-6) {
      if (p < 0 || p > max) return 0;
      continue;
    }
    const t0 = (0 - p) / d;
    const t1 = (max - p) / d;
    lo = Math.max(lo, Math.min(t0, t1));
    hi = Math.min(hi, Math.max(t0, t1));
  }
  return Math.max(0, hi - lo);
}

/** Shuffle with a seed, so the order is random per visit but stays put while the page is open. */
function shuffled<T>(items: T[], seed0: number): T[] {
  const out = items.slice();
  let seed = Math.floor(seed0 * 233280);
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `items` empty: a tape with only ∞ marks (more tapes than names). */
type Lane = { tape: Tape; items: string[]; pad: number; marks: number; loop: number };

export function WaitlistWall({ names, ready }: { names: string[]; ready: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [fontsReady, setFontsReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  const [seed] = useState(() => Math.random());

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) }));
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setSeen(true);
    });
    io.observe(el);
    document.fonts?.ready.then(() => setFontsReady(true));
    // Nearer tapes follow the pointer a little further.
    const move = (e: PointerEvent) => {
      el.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    };
    if (!reduced) window.addEventListener("pointermove", move, { passive: true });
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [reduced]);

  const scale = size.w < 640 ? 0.78 : 1; // slimmer tapes on phones
  const length = Math.ceil(Math.hypot(size.w, size.h) * 1.05 + 80);
  const halfDiagonal = Math.hypot(size.w, size.h) / 2;

  const lanes = useMemo<Lane[]>(() => {
    // Tapes appear only once the names are in (and are measured in the display font), so the wall
    // unrolls once, complete, instead of changing after it has drawn.
    if (!size.w || !size.h || !fontsReady || !ready) return [];
    const ctx = document.createElement("canvas").getContext("2d");
    const measure = (text: string, px: number) => {
      if (!ctx) return text.length * px * 0.56;
      ctx.font = `600 ${px}px "Cabinet Grotesk", "Switzer", sans-serif`;
      return ctx.measureText(text).width;
    };
    // name + its padding (2 × 0.58em) + the 1.6em ∞ + its padding (2 × 0.58 × 1.6em)
    const itemWidth = (text: string, tone: Tone) => {
      const f = TONES[tone].font * scale;
      return measure(text, f) + measure("∞", f * 1.6) + f * 3.02;
    };

    const tapes = TAPES.map((tape) => ({ tape, chord: visibleLength(tape, size.w, size.h) })).filter((t) => t.chord > 160);
    // Random order; the same "First L." twice would read as a repeat, so each distinct name appears once.
    const unique = shuffled(Array.from(new Set(names)), seed);

    const fill = tapes.map(() => 0);
    const groups: string[][] = tapes.map(() => []);
    for (const name of unique) {
      // Each name goes to the tape that is least full for its length, so every tape gets names
      // before any tape gets a second one.
      let pick = 0;
      for (let i = 1; i < tapes.length; i++) if (fill[i] / tapes[i].chord < fill[pick] / tapes[pick].chord) pick = i;
      groups[pick].push(name);
      fill[pick] += itemWidth(name, tapes[pick].tape.tone);
    }

    return tapes.map(({ tape, chord }, i) => {
      // A loop must be longer than the visible part of the tape so nothing shows twice at once.
      const target = chord * 1.08 + 40;
      const list = groups[i];
      if (list.length) {
        const pad = Math.max(0, (target - fill[i]) / list.length);
        return { tape, items: list, pad, marks: 0, loop: fill[i] + pad * list.length };
      }
      // More tapes than names: this tape carries only the ∞ marks, spaced like names would be.
      const slot = itemWidth("Firstname L.", tape.tone);
      const marks = Math.max(2, Math.ceil(target / slot));
      return { tape, items: [], pad: 0, marks, loop: slot * marks };
    });
  }, [size.w, size.h, names, ready, fontsReady, scale, seed]);

  return (
    <div
      ref={rootRef}
      className="vx-wall absolute inset-0 isolate z-0 overflow-hidden"
      data-paused={!inView || undefined}
      data-shown={(seen && lanes.length > 0) || reduced || undefined}
      aria-hidden="true"
    >
      {lanes.map((lane, i) => {
        const tone = TONES[lane.tape.tone];
        const height = Math.round(tone.height * scale);
        const slot = lane.marks ? lane.loop / lane.marks : 0;
        return (
          <div key={i} className="vx-wall-shift absolute left-1/2 top-1/2" style={{ zIndex: tone.z, ["--shift" as string]: `${tone.shift}px` }}>
            <div
              className="vx-wall-tape absolute flex items-center overflow-hidden"
              style={{
                width: length,
                height,
                left: -length / 2,
                top: -height / 2,
                background: tone.bg,
                boxShadow: tone.shadow,
                transform: `rotate(${lane.tape.angle}deg) translateY(${(lane.tape.offset * halfDiagonal).toFixed(1)}px)`,
                ["--i" as string]: i,
              }}
            >
              <span
                className="vx-wall-track flex shrink-0 whitespace-nowrap font-semibold"
                style={{
                  fontFamily: "var(--font-display), var(--font-indic)",
                  fontSize: tone.font * scale,
                  color: tone.text,
                  animationDuration: `${(lane.loop / (tone.speed * scale)).toFixed(1)}s`,
                  animationDirection: lane.tape.dir < 0 ? "reverse" : "normal",
                }}
              >
                {[0, 1].map((copy) => (
                  <span key={copy} className="flex shrink-0 items-center">
                    {lane.items.map((name, k) => (
                      <span key={k} className="flex shrink-0 items-center" style={{ paddingRight: lane.pad }}>
                        <span className="px-[0.58em]">{name}</span>
                        <span className="px-[0.58em] text-[1.6em] leading-none" style={{ color: tone.mark }}>
                          ∞
                        </span>
                      </span>
                    ))}
                    {Array.from({ length: lane.marks }, (_, k) => (
                      <span key={`m${k}`} className="flex shrink-0 items-center justify-center text-[1.6em] leading-none" style={{ width: slot, color: tone.mark }}>
                        ∞
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
