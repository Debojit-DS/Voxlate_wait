"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { fetchWaitlistPulse } from "@/lib/publicApi";

const TONES = [
  { bg: "var(--color-primary)", fg: "#fff" },
  { bg: "var(--color-ink)", fg: "#fff" },
  { bg: "var(--color-brass)", fg: "#fff" },
  { bg: "var(--color-mist)", fg: "var(--color-ink)" },
  { bg: "var(--color-surface)", fg: "var(--color-primary)" },
];

/** Shown while loading or if the API is unreachable; the live total has been above this since launch. */
const FALLBACK_TOTAL = 100;

/** Live member count, rounded down so the claim is always true. Initials only — no faces or names. */
export function TrustLine({ className = "" }: { className?: string }) {
  const [pulse, setPulse] = useState<{ total: number; initials: string[] } | null>(null);

  useEffect(() => {
    let alive = true;
    fetchWaitlistPulse()
      .then((data) => alive && setPulse(data))
      .catch(() => alive && setPulse({ total: FALLBACK_TOTAL, initials: [] }));
    return () => {
      alive = false;
    };
  }, []);

  const total = pulse?.total ?? FALLBACK_TOTAL;
  const shown = total >= 20 ? Math.floor(total / 10) * 10 : total;
  const initials = pulse?.initials ?? [];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex -space-x-2" aria-hidden="true">
        {TONES.map((tone, i) => (
          <span
            key={i}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-page text-[12px] font-semibold transition-opacity duration-500"
            style={{ background: tone.bg, color: tone.fg, fontFamily: "var(--font-display)", zIndex: TONES.length - i }}
          >
            {initials[i] ?? <User size={14} strokeWidth={2.2} style={{ opacity: pulse ? 0.85 : 0 }} />}
          </span>
        ))}
      </div>
      <p className="text-[14px] text-slate">
        Trusted by <strong className="font-semibold text-ink tabular-nums">{shown.toLocaleString("en-IN")}+</strong> members
      </p>
    </div>
  );
}
