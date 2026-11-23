"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fetchReviews, type PublicReview } from "@/lib/publicApi";
import { arcTable, smoothstep } from "./lemniscate";
import { ReviewForm } from "./ReviewForm";

const LOOP = arcTable(1.6);
const TONES = [
  { bg: "#1f3fb8", fg: "#ffffff" },
  { bg: "#0d1b2a", fg: "#ffffff" },
  { bg: "#4b5567", fg: "#ffffff" },
  { bg: "#e6eaf4", fg: "#0d1b2a" },
  { bg: "#fbfbf9", fg: "#1f3fb8" },
];

type Plate = { key: string; review: PublicReview | null; add?: boolean; focusable: boolean; slot?: number };
type Active = { index: number; x: number; y: number } | null;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const initialOf = (name: string) => name.match(/\p{L}/u)?.[0]?.toLocaleUpperCase() ?? "V";
const monthYear = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(+d) ? "" : d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

/**
 * Reviews as plates standing on an infinity loop that keeps flowing (faster while you scroll).
 * Hover, tap or focus a plate and it comes alive; a callout card shows the person and their words.
 */
export function ReviewsLoop() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [reviews, setReviews] = useState<PublicReview[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [active, setActive] = useState<Active>(null);
  const [dims, setDims] = useState({ a: 500, w: 112, h: 150, compact: false, stageW: 1000 });
  const activeRef = useRef<Active>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    let alive = true;
    fetchReviews()
      .then((list) => alive && setReviews(list))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const open = () => setFormOpen(true);
    window.addEventListener("review:open-form", open);
    return () => window.removeEventListener("review:open-form", open);
  }, []);

  // Size the loop to the stage.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const compact = width < 720;
      setDims({
        a: compact ? width * 0.46 : Math.min(560, width * 0.4),
        w: compact ? 54 : 112,
        h: compact ? 72 : 150,
        compact,
        stageW: width,
      });
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // How many plates the loop has room for at this size (one of them is the "Share yours" plate).
  const room = useMemo(() => {
    const spacing = dims.w + (dims.compact ? 10 : 18);
    return Math.max(8, Math.min(40, Math.round((LOOP.length * dims.a) / spacing))) - 1;
  }, [dims]);

  // Reviews rotate through the loop: a shuffled queue feeds plates as they pass the crossing,
  // and a review is never on the loop twice at the same time.
  const byId = useMemo(() => new Map((reviews ?? []).map((r) => [r.id, r])), [reviews]);
  const queue = useRef<string[]>([]);
  const nextInQueue = useRef(0);
  const [onLoop, setOnLoop] = useState<string[]>([]);
  const onLoopRef = useRef<string[]>([]);
  const loaded = reviews !== null;

  useEffect(() => {
    if (!loaded) return;
    const ids = shuffle((reviews ?? []).map((r) => r.id));
    // Keep a few reviews off the loop so there is always something new to rotate in.
    const count = ids.length > 6 ? Math.min(room, ids.length - 3) : Math.min(room, ids.length);
    queue.current = ids;
    nextInQueue.current = count;
    onLoopRef.current = ids.slice(0, count);
    setOnLoop(onLoopRef.current);
    // Re-deal only when the reviews first arrive or the loop changes size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, room]);

  const rotateIn = useCallback((slot: number) => {
    const q = queue.current;
    const current = onLoopRef.current;
    if (q.length <= current.length) return;
    for (let tries = 0; tries < q.length; tries++) {
      const id = q[nextInQueue.current % q.length];
      nextInQueue.current += 1;
      if (!current.includes(id)) {
        const next = [...current];
        next[slot] = id;
        onLoopRef.current = next;
        setOnLoop(next);
        return;
      }
    }
  }, []);

  const plates = useMemo<Plate[]>(() => {
    const list: Plate[] = loaded
      ? onLoop.map((id, i) => ({ key: `p${i}`, review: byId.get(id) ?? null, focusable: true, slot: i }))
      : Array.from({ length: room }, (_, i) => ({ key: `p${i}`, review: null, focusable: false }));
    // One plate in the loop is always yours to fill.
    list.splice(Math.ceil(list.length / 2), 0, { key: "add", review: null, add: true, focusable: true });
    return list;
  }, [loaded, onLoop, byId, room]);

  const slotOf = useRef<number[]>([]);
  useEffect(() => {
    slotOf.current = plates.map((p) => (p.slot === undefined ? -1 : p.slot));
  }, [plates]);

  // Flow the plates along the loop. Position lives in a ref so swapping a plate's review never resets it.
  const offsetRef = useRef(0);
  const plateCount = plates.length;
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let boost = 0;
    let lastScroll = window.scrollY;
    let frame = 0;
    let last = performance.now();
    const n = plateCount;
    const prev = new Array<number>(n).fill(-1);

    const place = () => {
      for (let i = 0; i < n; i++) {
        const el = plateRefs.current[i];
        if (!el) continue;
        const t = (((i / n + offsetRef.current / LOOP.length) % 1) + 1) % 1;
        // Crossing the centre of the infinity is the transition point: the plate fades out,
        // takes the next unseen review, and fades back in.
        if (prev[i] >= 0 && t < prev[i] - 0.5 && slotOf.current[i] >= 0) rotateIn(slotOf.current[i]);
        prev[i] = t;
        const fade = smoothstep(0, 0.05, t) * smoothstep(1, 0.95, t);
        const p = LOOP.at(t * LOOP.length);
        const x = p.x * dims.a;
        const z = -p.y * dims.a;
        // Face perpendicular to the path, so plates turn as they round each lobe.
        const yaw = Math.atan2(p.ty, p.tx);
        el.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${yaw.toFixed(4)}rad) scale(${(0.6 + 0.4 * fade).toFixed(3)})`;
        el.style.opacity = fade.toFixed(3);
        el.style.visibility = fade < 0.02 ? "hidden" : "visible";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const y = window.scrollY;
      boost = boost * Math.exp(-dt * 3) + Math.abs(y - lastScroll) * 0.0009;
      lastScroll = y;
      if (!activeRef.current && !reduced) offsetRef.current += dt * (34 / dims.a + boost);
      place();
      frame = requestAnimationFrame(tick);
    };

    place();
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        last = performance.now();
        lastScroll = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(section);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [plateCount, dims, reduced, rotateIn]);

  const activate = useCallback((index: number) => {
    const el = plateRefs.current[index];
    const stage = stageRef.current;
    if (!el || !stage) return;
    const r = el.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    setActive({ index, x: r.left + r.width / 2 - s.left, y: r.top - s.top });
  }, []);

  // Tap outside closes the card on touch screens.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.(".vx-plate, [data-review-card]")) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const activeReview = active ? plates[active.index]?.review : null;
  const stageW = dims.stageW;
  const cardW = dims.compact ? Math.min(300, stageW - 24) : 340;
  const cardLeft = active ? Math.max(12, Math.min(stageW - cardW - 12, active.x + (active.x > stageW / 2 ? -cardW - 48 : 48))) : 0;
  const cardTop = active ? Math.max(0, active.y - (dims.compact ? 150 : 120)) : 0;

  const onPosted = (review: PublicReview) => {
    queue.current.splice(nextInQueue.current % Math.max(1, queue.current.length), 0, review.id);
    setReviews((prev) => [review, ...(prev ?? [])]);
  };

  return (
    <section ref={sectionRef} id="testimonials" aria-labelledby="reviews-title" className="relative overflow-hidden border-t border-line pt-20 pb-16 lg:pt-28 lg:pb-20">
      <div className="page-container grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="vx-label mb-4">Reviews{reviews ? ` · ${reviews.length}` : ""}</p>
          <h2 id="reviews-title" className="vx-display text-[clamp(2.25rem,7vw,3rem)] text-ink lg:text-[clamp(3rem,4.4vw,4.5rem)]">
            Real voices.
            <br />
            Real connections.
          </h2>
        </div>
        <p className="max-w-[44ch] text-[16px] leading-relaxed text-slate lg:justify-self-end lg:text-[17px]">
          Words from people who tried the Voxlate demo, going round the loop. Hover or tap a plate to hear them out.
        </p>
      </div>

      <div ref={stageRef} className="vx-loop-stage relative mx-auto mt-4 h-[360px] w-full max-w-[1400px] sm:h-[440px] lg:mt-0 lg:h-[600px]">
        <div className="vx-loop-world" style={{ transform: dims.compact ? "translateY(36px) rotateX(-34deg)" : "translateY(40px) rotateX(-20deg)" }}>
          {plates.map((plate, i) => {
            const tone = TONES[i % TONES.length];
            const review = plate.review;
            const label = plate.add
              ? "Share your experience"
              : review
                ? `Review by ${review.authorName}, ${review.rating} out of 5 stars: ${review.text}`
                : "Loading review";
            return (
              <button
                key={plate.key}
                ref={(el) => {
                  plateRefs.current[i] = el;
                }}
                type="button"
                className="vx-plate"
                data-add={plate.add ? "" : undefined}
                data-active={active?.index === i}
                tabIndex={plate.focusable ? 0 : -1}
                aria-label={label}
                style={{ ["--plate-w" as string]: `${dims.w}px`, ["--plate-h" as string]: `${dims.h}px` }}
                onPointerEnter={(e) => e.pointerType === "mouse" && review && activate(i)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                onFocus={() => review && activate(i)}
                onBlur={() => setActive(null)}
                onClick={() => (plate.add ? setFormOpen(true) : review && activate(i))}
              >
                {[false, true].map((back) => (
                  <span
                    key={String(back)}
                    className="vx-plate-face flex flex-col"
                    data-back={back ? "" : undefined}
                    style={review ? { ["--plate-bg" as string]: tone.bg, ["--plate-fg" as string]: tone.fg } : undefined}
                    aria-hidden="true"
                  >
                    {plate.add ? (
                      <span className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center">
                        <Plus size={dims.compact ? 18 : 24} />
                        <span className="text-[10px] font-semibold leading-tight sm:text-[13px]">Share yours</span>
                      </span>
                    ) : review ? (
                      <PlateFace review={review} compact={dims.compact} />
                    ) : (
                      <span className="h-full w-full bg-surface" />
                    )}
                  </span>
                ))}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {active && activeReview && (
            <motion.svg
              key={`line-${active.index}`}
              className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <motion.path
                d={`M ${active.x} ${active.y} L ${active.x > stageW / 2 ? cardLeft + cardW : cardLeft} ${cardTop + 36}`}
                stroke="var(--color-ink)"
                strokeWidth="1.25"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              />
              <motion.circle
                cx={active.x}
                cy={active.y}
                r="4"
                fill="var(--color-primary)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 18 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
        {active && activeReview && (
          <motion.div
            key={`card-${active.index}`}
            data-review-card
            className="pointer-events-auto absolute z-10 rounded-[10px] border border-ink/15 bg-surface p-5 shadow-[0_28px_70px_-30px_rgba(13,27,42,0.55)]"
            style={{ left: cardLeft, top: cardTop, width: cardW, transformOrigin: active.x > stageW / 2 ? "100% 30%" : "0% 30%" }}
            role="status"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 6, filter: "blur(4px)", transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.8 }}
          >
            <div className="flex items-center gap-3">
              <Avatar review={activeReview} size={52} />
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold text-ink">{activeReview.authorName}</p>
                <p className="text-[13px] text-slate">{monthYear(activeReview.createdAt)}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-0.5" aria-label={`${activeReview.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={15}
                  aria-hidden
                  className={n <= activeReview.rating ? "fill-primary text-primary" : "text-line"}
                />
              ))}
            </div>
            <motion.p
              className="mt-2.5 line-clamp-6 text-[15px] leading-relaxed text-ink"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
            >
              “{activeReview.text}”
            </motion.p>
          </motion.div>
        )}
        </AnimatePresence>

        {failed && (
          <p className="absolute inset-x-0 top-1/2 text-center text-[15px] text-slate">Reviews couldn’t load right now. Please try again later.</p>
        )}
      </div>

      <div className="page-container mt-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[40ch] text-[15px] text-slate">Tried the demo? Your words join the loop for everyone to read.</p>
        <button type="button" className="vx-btn" onClick={() => setFormOpen(true)}>
          Share your experience
        </button>
      </div>

      <ReviewForm open={formOpen} onClose={() => setFormOpen(false)} onPosted={onPosted} />
    </section>
  );
}

function Avatar({ review, size }: { review: PublicReview; size: number }) {
  if (review.authorPhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote avatars from Google accounts
      <img
        src={review.authorPhotoUrl}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white"
      style={{ width: size, height: size, fontFamily: "var(--font-display)", fontSize: size * 0.42 }}
    >
      {initialOf(review.authorName)}
    </span>
  );
}

function PlateFace({ review, compact }: { review: PublicReview; compact: boolean }) {
  const first = review.authorName.trim().split(/\s+/)[0];
  return (
    <>
      {review.authorPhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatars from Google accounts
        <img src={review.authorPhotoUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="min-h-0 w-full flex-1 object-cover" />
      ) : (
        <span
          className="flex min-h-0 flex-1 items-center justify-center font-bold"
          style={{ fontFamily: "var(--font-display)", fontSize: compact ? 26 : 56, lineHeight: 1 }}
        >
          {initialOf(review.authorName)}
        </span>
      )}
      <span className="block truncate px-2 py-1.5 text-left text-[10px] font-semibold sm:text-[12px]">{first}</span>
    </>
  );
}
