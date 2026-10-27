"use client";

import Link from "next/link";
import { Sparkle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import styles from "./Hero.module.css";

const WAVE_BARS = [14, 22, 36, 18, 42, 28, 52, 38, 20, 48, 32, 56, 40, 24, 46, 30, 50, 26, 40, 22, 34, 18];

export function Hero() {
  const { openWaitlist } = useGatedWaitlist();

  return (
    <section aria-labelledby="hero-title" className={styles.hero}>
      {/* Background ambient audio waveform visual */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1440px] h-full max-h-[520px] opacity-[0.14] select-none"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M0 200 C 150 110, 260 290, 400 200 C 540 110, 660 290, 800 200 C 940 110, 1060 290, 1200 200"
          stroke="var(--color-primary, #285A78)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M0 200 C 180 270, 290 130, 450 200 C 610 270, 730 130, 900 200 C 1040 260, 1140 150, 1200 200"
          stroke="#06B6D4"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />
        <path
          d="M0 200 C 210 150, 320 250, 520 200 C 720 150, 820 250, 1020 200 C 1110 175, 1160 220, 1200 200"
          stroke="var(--color-primary, #285A78)"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />
      </svg>

      <div className={`page-container ${styles.content}`}>
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-6 sm:mb-8">
          <Sparkle size={13} className="text-primary shrink-0" aria-hidden="true" />
          <span className="text-[12px] sm:text-[13px] font-semibold text-primary tracking-wide">
            AI-Powered Voice Translation
          </span>
        </div>

        {/* Large serif headline */}
        <h1 id="hero-title" className={`${styles.title} font-display font-normal text-ink`}>
          <span className="block">Speak your language.</span>
          <span className="block mt-1 sm:mt-2">Connect without borders.</span>
        </h1>

        {/* Supporting description (two distinct lines) */}
        <div className={`${styles.description} text-slate font-normal`}>
          <p className="block">Connect with anyone, in any language, through real-time AI translation.</p>
          <p className="block mt-1 sm:mt-1.5">Keep the voice, tone, and emotion that make every conversation yours.</p>
        </div>

        {/* Subtle audio waveform visual */}
        <div className={styles.waveformContainer} aria-hidden="true">
          {WAVE_BARS.map((h, i) => (
            <span
              key={i}
              className={styles.waveBar}
              style={{
                height: `${h}px`,
                animationDelay: `${(i * 0.08).toFixed(2)}s`,
              }}
            />
          ))}
        </div>

        {/* Prominent CTA buttons */}
        <div className={styles.actions}>
          <Button
            onClick={() => openWaitlist("hero")}
            wide
            className="!h-13 sm:!h-14 !px-8 sm:!px-10 !text-[16px] sm:!text-[17px] !rounded-[10px] shadow-md shadow-primary/15 transition-transform hover:-translate-y-0.5"
          >
            Join the Waitlist
          </Button>
          <Link
            href="/demo"
            className="inline-flex h-13 sm:h-14 items-center justify-center rounded-[10px] border-2 border-primary bg-surface/90 px-8 sm:px-10 text-[16px] sm:text-[17px] font-semibold text-primary transition-all duration-200 hover:bg-mist/80 hover:text-primary-hover hover:border-primary-hover hover:-translate-y-0.5 select-none whitespace-nowrap no-underline shadow-xs"
          >
            Experience the Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
