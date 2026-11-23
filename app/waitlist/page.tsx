"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistWall } from "@/components/waitlist/WaitlistWall";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { fetchWaitlistNames, type WaitlistNames } from "@/lib/publicApi";

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
 * The waitlist wall: every member's name (first name and last initial, never dates or emails) runs
 * along the tapes behind a thank-you, and the invitation is to put your own name up with theirs.
 */
export default function WaitlistPage() {
  const { openWaitlist } = useGatedWaitlist();
  const reduced = useReducedMotion() ?? false;
  const [list, setList] = useState<WaitlistNames | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let alive = true;
    fetchWaitlistNames()
      .then((data) => {
        if (!alive) return;
        setList(data);
        setState("ready");
      })
      .catch(() => alive && setState("failed"));
    return () => {
      alive = false;
    };
  }, []);

  // Rounded down, so the claim stays true as people join.
  const rounded = list ? (list.total >= 20 ? Math.floor(list.total / 10) * 10 : list.total) : null;
  const counted = useCountUp(rounded, reduced);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* The wall runs from under the navbar all the way down to the footer. */}
      <main aria-labelledby="wall-title" className="vx-wall-paper relative flex-1 border-t border-line" style={{ minHeight: "max(170svh, 1100px)" }}>
        <WaitlistWall names={list?.names ?? []} ready={state !== "loading"} />

        {/* The thank-you plaque stays in view on desktop while the names scroll past; on phones it scrolls away so the wall shows. */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="flex h-[calc(100svh-72px)] items-center justify-center px-4 py-6 lg:sticky lg:top-[72px]">
            <div className="vx-plaque pointer-events-auto w-full max-w-[620px] px-6 py-10 text-center sm:px-12 sm:py-12">
              <h1 id="wall-title" className="vx-display text-[clamp(2.2rem,9vw,3rem)] uppercase leading-[0.95] text-ink lg:text-[clamp(3rem,4.4vw,4.4rem)]">
                <span className="vx-outline-ink block">Thank you</span>
                <span className="block">for waiting</span>
                <span className="block">with us.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[40ch] text-[16px] leading-relaxed text-slate sm:text-[17px] lg:mt-6">
                Every name on these ribbons belongs to someone who joined Voxlate before launch. We’re building it for you.
              </p>
              <p className="mx-auto mt-3 max-w-[40ch] text-[16px] font-medium leading-relaxed text-ink sm:text-[17px]">
                Anyone can join, free. Join the waitlist and your name goes up on the wall too.
              </p>
              <button type="button" className="vx-btn mt-7" onClick={() => openWaitlist("waitlist-page")}>
                Join the Waitlist <ArrowRight size={17} aria-hidden />
              </button>
              <p className="mt-4 h-5 text-[14px] text-slate" aria-live="polite">
                {state === "ready" && rounded !== null && (
                  <>
                    <span className="font-semibold tabular-nums text-ink">{counted.toLocaleString("en-IN")}+</span> people on the waitlist
                  </>
                )}
                {state === "failed" && "The wall is waking up. Refresh in a moment to see everyone."}
              </p>
            </div>
          </div>
        </div>

        {state === "ready" && list && list.names.length > 0 && (
          <ul className="sr-only" aria-label="Everyone on the waitlist">
            {Array.from(new Set(list.names)).map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
