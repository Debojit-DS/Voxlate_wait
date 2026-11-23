"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { DEVELOPMENT_MESSAGE } from "@/lib/productCopy";
import { fetchPublishedFaqs } from "@/lib/publicApi";
import { lemniscate } from "./lemniscate";
import { AskQuestion } from "./AskQuestion";

type Faq = { q: string; a: string; visitor?: boolean };

const BASE_FAQS: Faq[] = [
  {
    q: "What is Voxlate?",
    a: "An AI-powered, real-time voice translation platform being built to keep your natural voice, tone and emotion across languages, in online meetings and face-to-face conversations. Today you can try a recorded-clip web demo; the desktop app and the wearable are still in development.",
  },
  {
    q: "Will it sound like me?",
    a: "That is the point of Voxlate. It is being built to carry your voice, tone and emotion into the other language, so people hear you rather than a robotic narrator. The web demo lets you hear an early version.",
  },
  {
    q: "Which languages?",
    a: "Hindi ↔ English comes first, in both directions. Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese and Urdu ↔ English are on the roadmap, with the long-term goal of covering most of the world’s widely spoken languages. The web demo has its own list of target languages.",
  },
  {
    q: "Digital or Physical?",
    a: "Digital is software for online meetings: choose Voxlate as your microphone and speaker in Zoom, Google Meet or Teams. Physical is a wearable earpiece for face-to-face conversations, designed to auto-connect to other Voxlate devices within 2 m and to run groups of 2 to 200 people.",
  },
  {
    q: "Is Voxlate free?",
    a: "There will be a free tier for basic translation, with paid plans for heavier use and for businesses. Pricing will be announced closer to launch.",
  },
  {
    q: "Can my company use it?",
    a: "Yes. Voxlate is being built for individuals and businesses alike. Teams will be able to use it in global meetings, and fitting it into enterprise communication workflows is part of the plan.",
  },
  {
    q: "When does it launch?",
    a: `${DEVELOPMENT_MESSAGE} Join the waitlist for launch updates and early access.`,
  },
  {
    q: "How does the waitlist work?",
    a: "Create an account, then join with your name and email. Joining also unlocks the web demo. We will email you when Voxlate launches, and selected members get early testing access before the public release.",
  },
];

const ROW_COUNT = 3;
const SPEED = [34, -28, 40]; // px/s; negative moves right
const REPEAT = 3;

/** Questions drift past in rows; a lens wanders an infinity path over them and follows the cursor. */
export function FaqLens() {
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState(0);
  const [faqs, setFaqs] = useState<Faq[]>(BASE_FAQS);
  // Questions visitors asked and the team answered (and chose to publish) join the rows.
  const rows = useMemo(() => Array.from({ length: ROW_COUNT }, (_, r) => faqs.map((_, i) => i).filter((i) => i % ROW_COUNT === r)), [faqs]);

  useEffect(() => {
    let alive = true;
    fetchPublishedFaqs().then((published) => {
      if (!alive || !published.length) return;
      const seen = new Set(BASE_FAQS.map((f) => f.q.toLowerCase()));
      const extra = published.filter((f) => !seen.has(f.q.toLowerCase())).map((f) => ({ q: f.q, a: f.a, visitor: true }));
      if (extra.length) setFaqs([...BASE_FAQS, ...extra]);
    });
    return () => {
      alive = false;
    };
  }, []);
  const areaRef = useRef<HTMLDivElement>(null);
  const baseRows = useRef<(HTMLDivElement | null)[]>([]);
  const lensRows = useRef<(HTMLDivElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lensLayer = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const offsets = useRef(Array.from({ length: ROW_COUNT }, () => 0));
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    let frame = 0;
    let last = performance.now();
    let t = 0;
    let lx = 0;
    let ly = 0;
    let first = true;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = area.clientWidth;
      const h = area.clientHeight;
      const r = w < 640 ? 58 : 92;

      for (let i = 0; i < ROW_COUNT; i++) {
        const copyW = copyRefs.current[i]?.offsetWidth ?? 1;
        if (!paused.current && !reduced) offsets.current[i] = (offsets.current[i] + SPEED[i] * dt + copyW) % copyW;
        const x = `translate3d(${(-offsets.current[i]).toFixed(1)}px,0,0)`;
        const b = baseRows.current[i];
        const l = lensRows.current[i];
        if (b) b.style.transform = x;
        if (l) l.style.transform = x;
      }

      // Lens: infinity path when idle, eased towards the cursor when hovering.
      if (!reduced) t += dt * 0.32;
      const [ix, iy] = lemniscate(t, 1.4);
      const tx = pointer.current ? pointer.current.x : w / 2 + ix * (w / 2 - r * 1.2);
      const ty = pointer.current ? pointer.current.y : h / 2 + iy * (h / 2 - r * 0.4);
      const ease = first ? 1 : 1 - Math.exp(-dt * (pointer.current ? 14 : 6));
      first = false;
      lx += (tx - lx) * ease;
      ly += (ty - ly) * ease;
      const layer = lensLayer.current;
      if (layer) {
        layer.style.setProperty("--lx", `${lx.toFixed(1)}px`);
        layer.style.setProperty("--ly", `${ly.toFixed(1)}px`);
        layer.style.setProperty("--lr", `${r}px`);
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${(lx - r).toFixed(1)}px, ${(ly - r).toFixed(1)}px, 0)`;
        ring.current.style.width = ring.current.style.height = `${r * 2}px`;
      }
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(area);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const registerRow = useCallback((lens: boolean, row: number, el: HTMLDivElement | null) => {
    (lens ? lensRows : baseRows).current[row] = el;
  }, []);
  const registerCopy = useCallback((row: number, el: HTMLDivElement | null) => {
    copyRefs.current[row] = el;
  }, []);
  const focusItem = useCallback((row: number, el: HTMLElement) => {
    paused.current = true;
    offsets.current[row] = Math.max(0, el.offsetLeft - 24);
  }, []);
  const blurItem = useCallback(() => {
    paused.current = false;
  }, []);
  const rowProps = { rows, faqs, open, onOpen: setOpen, registerRow, registerCopy, focusItem, blurItem };

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line pt-20 lg:pt-28">
      <div className="page-container flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="vx-label mb-4">FAQ</p>
          <h2 id="faq-title" className="vx-display text-[clamp(2.25rem,7vw,3rem)] text-ink lg:text-[clamp(3rem,4.4vw,4.5rem)]">
            Questions, answered.
          </h2>
        </div>
        <p className="max-w-[38ch] text-[16px] leading-relaxed text-slate lg:text-[17px]">
          Pick any question as it drifts by. Move your cursor over the rows and the lens follows.
        </p>
      </div>

      <div
        ref={areaRef}
        className="relative mt-10 cursor-default overflow-hidden text-ink select-none lg:mt-14"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && (paused.current = true)}
        onPointerLeave={() => {
          pointer.current = null;
          paused.current = false;
        }}
      >
        <FaqRows lens={false} {...rowProps} />
        <div ref={lensLayer} className="vx-faq-lens-layer bg-page" aria-hidden="true">
          <FaqRows lens {...rowProps} />
        </div>
        <div
          ref={ring}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 rounded-full border-[1.5px] border-ink shadow-[inset_0_0_0_6px_rgb(243_241_236/0.35)]"
        />
      </div>

      <div className="page-container mt-10 grid gap-6 border-t border-line pt-8 lg:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <h3 className="vx-display text-[clamp(1.6rem,4vw,2.25rem)] text-ink">{faqs[open].q}</h3>
          {faqs[open].visitor && <p className="vx-label mt-3">Asked by a visitor · answered by the team</p>}
        </div>
        <p id="faq-answer" aria-live="polite" className="max-w-[60ch] text-[17px] leading-relaxed text-slate">
          {faqs[open].a}
        </p>
      </div>

      <AskQuestion />
    </section>
  );
}

type FaqRowsProps = {
  lens: boolean;
  rows: number[][];
  faqs: Faq[];
  open: number;
  onOpen: (id: number) => void;
  registerRow: (lens: boolean, row: number, el: HTMLDivElement | null) => void;
  registerCopy: (row: number, el: HTMLDivElement | null) => void;
  focusItem: (row: number, el: HTMLElement) => void;
  blurItem: () => void;
};

/** Each row holds two copies of its questions so it can loop seamlessly; only the first copy is focusable. */
function FaqRows({ lens, rows, faqs, open, onOpen, registerRow, registerCopy, focusItem, blurItem }: FaqRowsProps) {
  return rows.map((ids, row) => (
    <div key={row} ref={(el) => registerRow(lens, row, el)} className="vx-faq-row py-1 sm:py-2">
      {[0, 1].map((copy) => (
        <div
          key={copy}
          ref={!lens && copy === 0 ? (el) => registerCopy(row, el) : undefined}
          className="flex shrink-0"
          aria-hidden={lens || copy > 0 ? true : undefined}
        >
          {Array.from({ length: REPEAT }).flatMap((_, rep) =>
            ids.map((id) => {
              const real = !lens && copy === 0 && rep === 0;
              return (
                <span key={`${rep}-${id}`} className="flex shrink-0 items-center">
                  <button
                    type="button"
                    tabIndex={real ? 0 : -1}
                    aria-expanded={!lens ? open === id : undefined}
                    aria-controls={!lens ? "faq-answer" : undefined}
                    onClick={() => onOpen(id)}
                    onFocus={real ? (e) => focusItem(row, e.currentTarget.parentElement as HTMLElement) : undefined}
                    onBlur={real ? blurItem : undefined}
                    className="vx-faq-q cursor-pointer text-[clamp(1.75rem,4.6vw,4rem)] leading-[1.15]"
                  >
                    {faqs[id].q}
                  </button>
                  <span aria-hidden="true" className="mx-[0.45em] text-[clamp(1.4rem,3.4vw,3rem)] text-line-strong">
                    ∞
                  </span>
                </span>
              );
            }),
          )}
        </div>
      ))}
    </div>
  ));
}
