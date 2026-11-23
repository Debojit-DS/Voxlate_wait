"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { fetchReviews, type PublicReview } from "@/lib/publicApi";
import { arcTable } from "./lemniscate";
import { ReviewForm } from "./ReviewForm";

const LOOP = arcTable(1.6);
const TONES = [
  { bg: "#2340d8", fg: "#ffffff" },
  { bg: "#0b1430", fg: "#ffffff" },
  { bg: "#b08a55", fg: "#ffffff" },
  { bg: "#e7ebf6", fg: "#0b1430" },
  { bg: "#fbfaf8", fg: "#2340d8" },
];

type Plate = { key: string; review: PublicReview | null; add?: boolean; focusable: boolean };
type Active = { index: number; x: number; y: number } | null;

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

  const plates = useMemo<Plate[]>(() => {
    const spacing = dims.w + (dims.compact ? 10 : 18);
    const count = Math.max(10, Math.min(40, Math.round((LOOP.length * dims.a) / spacing)));
    const list: Plate[] = [];
    const source = reviews ?? [];
    for (let i = 0; i < count - 1; i++) {
      const review = source.length ? source[i % source.length] : null;
      list.push({ key: `p${i}`, review, focusable: Boolean(review) && i < source.length });
    }
    // One plate in the loop is always yours to fill.
    list.splice(Math.floor(count / 2), 0, { key: "add", review: null, add: true, focusable: true });
    return list;
  }, [reviews, dims]);

  // Flow the plates along the loop.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let offset = 0;
    let boost = 0;
    let lastScroll = window.scrollY;
    let frame = 0;
    let last = performance.now();
    let visible = false;
    const n = plates.length;

    const place = () => {
      for (let i = 0; i < n; i++) {
        const el = plateRefs.current[i];
        if (!el) continue;
        const p = LOOP.at((i / n) * LOOP.length + offset);
        const x = p.x * dims.a;
        const z = -p.y * dims.a;
        // Face perpendicular to the path, so plates turn as they round each lobe.
        const yaw = Math.atan2(p.ty, p.tx);
        el.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${yaw.toFixed(4)}rad)`;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const y = window.scrollY;
      boost = boost * Math.exp(-dt * 3) + Math.abs(y - lastScroll) * 0.0009;
      lastScroll = y;
      if (!activeRef.current && !reduced) offset += dt * (26 / dims.a + boost);
      place();
      frame = requestAnimationFrame(tick);
    };

    place();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) {
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
  }, [plates, dims, reduced]);

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

  const onPosted = (review: PublicReview) => setReviews((prev) => [review, ...(prev ?? [])]);

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

        {active && activeReview && (
          <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden="true">
            <line
              x1={active.x}
              y1={active.y}
              x2={active.x > stageW / 2 ? cardLeft + cardW : cardLeft}
              y2={cardTop + 36}
              stroke="var(--color-ink)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle cx={active.x} cy={active.y} r="3.5" fill="var(--color-ink)" />
          </svg>
        )}
        {active && activeReview && (
          <div
            data-review-card
            className="pointer-events-auto absolute z-10 rounded-[10px] border border-ink/15 bg-surface p-5 shadow-[0_24px_60px_-28px_rgba(11,20,48,0.5)]"
            style={{ left: cardLeft, top: cardTop, width: cardW }}
            role="status"
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
                  className={n <= activeReview.rating ? "fill-[var(--color-brass)] text-[var(--color-brass)]" : "text-line"}
                />
              ))}
            </div>
            <p className="mt-2.5 line-clamp-6 text-[15px] leading-relaxed text-ink">“{activeReview.text}”</p>
          </div>
        )}

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
