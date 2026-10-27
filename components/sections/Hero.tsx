"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import styles from "./Hero.module.css";

const PHRASES = ["Speak Naturally.", "Hear Every Language."];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function Hero() {
  const { openWaitlist } = useGatedWaitlist();
  const sectionRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Stop typewriter animation while the section is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const motionReady = reduced === false;
  const running = motionReady && onScreen;

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className={styles.hero}>
      <div className={`page-container ${styles.content}`}>
        <p className="eyebrow">Voxlate · Early access</p>
        <h1 id="hero-title" className={`${styles.title} font-display font-normal text-ink`}>
          Breaking Language <em className="block italic">Barriers.</em>
        </h1>

        <p className={`${styles.tagline} font-medium text-primary`}>
          <span className="sr-only">Speak Naturally. Hear Every Language.</span>
          <TypewriterText phrases={PHRASES} speed={70} waitTime={1800} deleteSpeed={40} cursorChar="_" paused={!running} />
        </p>

        <p className={`${styles.description} text-slate`}>
          We&apos;re building real-time AI translation designed to preserve your original voice, tone and emotion.
        </p>

        <div className={styles.actions}>
          <Button onClick={() => openWaitlist("hero")} wide>
            Join Waitlist
          </Button>
          <UnderlineLink href="/demo" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
            View Our Demo
          </UnderlineLink>
        </div>
      </div>
    </section>
  );
}
