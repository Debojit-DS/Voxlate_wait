"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistGift } from "@/components/home/WaitlistGift";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { fetchWaitlistPulse, type WaitlistPulse } from "@/lib/publicApi";

const TONES = ["bg-primary text-white", "bg-ink text-white", "bg-slate text-white", "bg-mist text-ink", "bg-surface text-primary"];
const SHOWN = 6;

function ago(iso: string | null) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** Counts up to `to` once it has a value. */
function useCountUp(to: number | null, reduced: boolean) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (to === null || started.current || reduced) return;
    started.current = true;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to, reduced]);
  return reduced ? (to ?? 0) : value;
}

/**
 * Public waitlist page. Only the size of the list and a handful of recent first names are shown;
 * the member list itself stays private (admins see it in the dashboard).
 */
export default function WaitlistPage() {
  const { openWaitlist } = useGatedWaitlist();
  const reduced = useReducedMotion() ?? false;
  const [pulse, setPulse] = useState<WaitlistPulse | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let alive = true;
    fetchWaitlistPulse()
      .then((data) => {
        if (!alive) return;
        setPulse(data);
        setState("ready");
      })
      .catch(() => alive && setState("failed"));
    return () => {
      alive = false;
    };
  }, []);

  // Rounded down, so the claim stays true as people join.
  const rounded = pulse ? (pulse.total >= 20 ? Math.floor(pulse.total / 10) * 10 : pulse.total) : null;
  const counted = useCountUp(rounded, reduced);
  const recent = pulse?.recent.slice(0, SHOWN) ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <section className="page-container vx-page-head grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <p className="vx-label">Waitlist</p>
            <p className="vx-display mt-6 text-[clamp(5rem,16vw,11rem)] leading-[0.85] text-ink tabular-nums" aria-live="polite">
              {state === "loading" ? (
                <span className="inline-block h-[0.8em] w-[2.6em] animate-pulse rounded-[12px] bg-mist align-middle" aria-label="Loading" />
              ) : state === "failed" ? (
                <span className="text-line-strong">—</span>
              ) : (
                <>
                  {counted.toLocaleString("en-IN")}
                  <span className="text-primary">+</span>
                </>
              )}
            </p>
            <h1 className="vx-display mt-6 max-w-[16ch] text-[clamp(2rem,4.4vw,3.5rem)] text-ink">
              people are waiting to be heard <span className="text-primary">as themselves.</span>
            </h1>
            <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-slate">
              Join for launch updates and early access. Joining also unlocks the web demo, so you can hear yourself in another
              language today.
            </p>
            <button type="button" className="vx-btn mt-8" onClick={() => openWaitlist("waitlist-page")}>
              Join the Waitlist <ArrowRight size={17} aria-hidden />
            </button>
          </div>

          <aside aria-label="Recently joined" className="lg:pt-6">
            <p className="vx-label">Recently joined</p>
            {state === "failed" ? (
              <p className="mt-6 text-[15px] text-slate">The list is waking up. Refresh in a moment to see who joined recently.</p>
            ) : (
              <ul
                className="mt-5"
                style={{
                  maskImage: "linear-gradient(to bottom, #000 35%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, #000 35%, transparent 100%)",
                }}
              >
                {(state === "loading" ? Array.from({ length: SHOWN }, () => null) : recent).map((entry, i) => (
                  <li key={i} className="flex items-center gap-4 border-b border-line py-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold ${entry ? TONES[i % TONES.length] : "bg-mist"}`}
                      style={{ fontFamily: "var(--font-display)" }}
                      aria-hidden="true"
                    >
                      {entry?.name.match(/\p{L}/u)?.[0]?.toLocaleUpperCase()}
                    </span>
                    {entry ? (
                      <>
                        <span className="flex-1 text-[17px] font-medium text-ink">{entry.name}</span>
                        <span className="text-[14px] text-slate">{ago(entry.createdAt)}</span>
                      </>
                    ) : (
                      <span className="h-3 w-32 animate-pulse rounded bg-mist" />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {state === "ready" && rounded !== null && rounded > recent.length && (
              <p className="mt-2 text-[15px] text-slate">
                …and {(rounded - recent.length).toLocaleString("en-IN")}+ more. Everyone else stays private.
              </p>
            )}
          </aside>
        </section>

        <WaitlistGift />
      </main>
      <Footer />
    </div>
  );
}
