"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { Logo } from "@/components/ui/Logo";
import { clamp01, easeInOut, smoothstep } from "@/components/home/lemniscate";
import { MeetingScreen, PLATFORMS, SCREEN_H, SCREEN_W, type Platform, type ScreenFocus } from "@/components/home/story/DigitalMock";

/*
 * Digital page story. A closed laptop sits under the headline; scrolling opens the lid, the headline
 * fades, the screen wakes up on a translated meeting, and three setup steps play out beside it, each
 * pointing at the part of the screen it talks about.
 */

const SCROLL_VH = 320; // pinned distance, in svh

/* Laptop, in its own pixels (scaled to fit). */
const BEZEL = 20;
const LID_W = SCREEN_W + BEZEL * 2;
const LID_H = SCREEN_H + BEZEL * 2;
const DECK_D = LID_H; // the closed lid covers the deck exactly
const LIP = 14; // front edge thickness
const LIFT = 8; // lid sits this far above the deck when closed

/* Choreography (fractions of the pinned scroll distance). */
const OPEN_FROM = 0.04;
const OPEN_TO = 0.34;
const STEP_FROM = 0.46;
const STEP_GAP = 0.19;

const STEPS: { title: string; body: string; focus: ScreenFocus }[] = [
  {
    title: "Choose your languages",
    body: "Set My language and the Meeting language once, and pick the microphone and headphones you already use.",
    focus: "languages",
  },
  {
    title: "Select Voxlate in your meeting app",
    body: "In Zoom, Meet or Teams audio settings, choose Voxlate Microphone and Voxlate Speaker. No bot joins the call.",
    focus: "devices",
  },
  {
    title: "Talk the way you always do",
    body: "You speak in yours and the meeting hears theirs. Everyone else reaches you in your language, still in their own voice.",
    focus: "captions",
  },
];

/** 0..2 with a dwell on each step. */
const stepAt = (p: number) => {
  const x = Math.min(STEPS.length - 1, Math.max(0, (p - STEP_FROM) / STEP_GAP));
  const i = Math.min(STEPS.length - 2, Math.floor(x));
  return i + smoothstep(0.25, 0.75, x - i);
};

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

export function LaptopStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const wide = useWide();
  const { openWaitlist } = useGatedWaitlist();
  const [platform, setPlatform] = useState<Platform>("zoom");
  const [step, setStep] = useState(-1);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const open = useTransform(scrollYProgress, (p) => easeInOut(clamp01((p - OPEN_FROM) / (OPEN_TO - OPEN_FROM))));
  const move = useTransform(scrollYProgress, (p) => easeInOut(clamp01((p - 0.14) / 0.28)));
  const introOpacity = useTransform(scrollYProgress, (p) => 1 - smoothstep(0.03, 0.17, p));
  const introY = useTransform(scrollYProgress, (p) => -60 * smoothstep(0, 0.22, p));
  const introPointer = useTransform(introOpacity, (o) => (o > 0.4 ? "auto" : "none"));
  const stepsOpacity = useTransform(scrollYProgress, (p) => smoothstep(0.36, 0.46, p));
  const stepsY = useTransform(scrollYProgress, (p) => 28 * (1 - smoothstep(0.36, 0.46, p)));
  const stepsPointer = useTransform(stepsOpacity, (o) => (o > 0.5 ? "auto" : "none"));

  // Closed: centred under the headline. Open: beside the steps (desktop) or above them (phone).
  const left = useTransform(move, (m) => `${wide ? 50 + 15 * m : 50}%`);
  const top = useTransform(move, (m) => `${wide ? 60 - 6 * m : 64 - 32 * m}%`);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = p < STEP_FROM - 0.06 ? -1 : Math.round(stepAt(p));
    setStep((s) => (s === next ? s : next));
  });

  const scrollToStep = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const distance = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY + (STEP_FROM + i * STEP_GAP + 0.02) * distance;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  const focus = step >= 0 ? STEPS[step].focus : null;

  return (
    <section ref={sectionRef} aria-labelledby="digital-title" className="relative -mt-[72px]" style={{ height: `calc(100svh + ${SCROLL_VH}svh)` }}>
      <span id="how" aria-hidden="true" className="absolute left-0" style={{ top: `calc(${(STEP_FROM + 0.02) * SCROLL_VH}svh + 88px)` }} />

      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="vx-grid pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* ── Headline over the closed laptop ── */}
        <motion.div
          style={{ opacity: introOpacity, y: introY, pointerEvents: introPointer }}
          className="page-container absolute inset-x-0 top-[96px] text-center lg:top-[13svh]"
        >
          <p className="vx-label">Digital version</p>
          <h1 id="digital-title" className="vx-display mx-auto mt-3 text-[clamp(2.4rem,9vw,3.25rem)] text-ink lg:text-[clamp(3rem,4.6vw,4.8rem)]">
            Your meeting. <span className="text-primary">Every language.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-relaxed text-slate sm:text-[18px]">
            Software we’re building for online meetings, calls and remote work. Speak naturally in your language; everyone else hears
            you in theirs, still sounding like you.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <button type="button" className="vx-btn" onClick={() => openWaitlist("digital-hero")}>
              Join the Waitlist
            </button>
            <Link href="/demo" className="vx-link">
              Try the web demo <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </motion.div>

        {/* ── Laptop ── */}
        <motion.div
          style={{ left, top, x: "-50%", y: "-50%" }}
          className="pointer-events-none absolute h-[42svh] w-[min(94vw,560px)] lg:h-[64svh] lg:w-[min(52vw,860px)]"
        >
          <Laptop open={open} platform={platform} animate={step >= 0 && !reduced} focus={focus} />
        </motion.div>

        {/* ── Setup steps ── */}
        <motion.div
          style={{ opacity: stepsOpacity, y: stepsY, pointerEvents: stepsPointer }}
          className="page-container absolute inset-x-0 bottom-6 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <div className="lg:w-[min(30vw,420px)]">
            <h2 className="vx-display text-[clamp(1.7rem,6vw,2.2rem)] text-ink lg:text-[clamp(2.2rem,3vw,3rem)]">Three steps, then just talk.</h2>
            <ol className="mt-4 border-t border-line lg:mt-6">
              {STEPS.map((s, i) => {
                const active = i === step;
                return (
                  <li key={s.title} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => scrollToStep(i)}
                      aria-current={active ? "step" : undefined}
                      className="grid w-full grid-cols-[28px_1fr] gap-x-3 py-3 text-left lg:py-4"
                    >
                      <span className={`vx-display text-[20px] leading-tight transition-colors ${active ? "text-primary" : "text-line-strong"}`}>
                        {i + 1}
                      </span>
                      <span>
                        <span className={`block text-[16px] font-semibold transition-colors lg:text-[17px] ${active ? "text-ink" : "text-slate"}`}>
                          {s.title}
                        </span>
                        <span
                          className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                          style={{ gridTemplateRows: active ? "1fr" : "0fr", opacity: active ? 1 : 0 }}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-1.5 text-[14px] leading-relaxed text-slate lg:text-[15px]">{s.body}</span>
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2 lg:mt-6" role="group" aria-label="Show it in">
              {(Object.keys(PLATFORMS) as Platform[]).map((key) => (
                <button key={key} type="button" className="vx-chip" aria-pressed={platform === key} onClick={() => setPlatform(key)}>
                  <Image src={PLATFORMS[key].logo} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                  <span className="hidden sm:inline">{PLATFORMS[key].label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * A laptop in CSS 3D: a lid hinged on the back edge of the deck. `open` 0 is shut (lid flat on the
 * deck, seen from above), 1 is open and leaning back slightly. The meeting screen is live DOM.
 */
function Laptop({ open, platform, animate, focus }: { open: MotionValue<number>; platform: Platform; animate: boolean; focus: ScreenFocus }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  // CSS rotateX: positive pushes the top edge away. Shut = -90 (lid flat on the deck, screen down), open = leaning back.
  const lidAngle = useTransform(open, (o) => -90 + 102 * o);
  const screenOff = useTransform(open, (o) => 1 - smoothstep(0.72, 0.98, o));
  // Seen from above when shut; the view lowers as the lid opens so the screen faces you.
  const tilt = useTransform(open, (o) => -(26 - 18 * o));
  // Shut, the whole laptop is the deck below the hinge, so lift it to stay centred in its box.
  const raise = useTransform(open, (o) => -0.42 * LID_H * (1 - o));
  // Shut, the near edge is magnified by perspective; keep it inside the same width as the open laptop.
  const fit = useTransform(open, (o) => 0.8 + 0.2 * smoothstep(0, 0.6, o));

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / (LID_W * 1.02), height / (LID_H * 1.32)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="relative h-full w-full" role="img" aria-label="A laptop running a meeting translated by Voxlate">
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: LID_W, height: LID_H, transform: `translate(-50%, -62%) scale(${scale})`, transformOrigin: "50% 62%" }}
        aria-hidden="true"
      >
        <motion.div className="h-full w-full" style={{ y: raise, scale: fit, perspective: 2400, perspectiveOrigin: "50% 40%" }}>
          <motion.div className="relative h-full w-full" style={{ rotateX: tilt, transformStyle: "preserve-3d", transformOrigin: "50% 100%" }}>
            {/* Deck */}
            <div
              className="absolute left-0 top-full"
              style={{ width: LID_W, height: DECK_D, transformOrigin: "50% 0", transform: "rotateX(90deg)", transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 rounded-[22px]"
                style={{ background: "linear-gradient(180deg, #d9dce2 0%, #c9cdd5 100%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55)" }}
              >
                {/* Keyboard */}
                <div
                  className="absolute left-[7%] right-[7%] top-[9%] grid h-[46%] gap-[5px] rounded-[8px] p-[8px]"
                  style={{ gridTemplateColumns: "repeat(14, 1fr)", gridTemplateRows: "repeat(6, 1fr)", background: "#b9bec8" }}
                >
                  {Array.from({ length: 84 }, (_, i) => (
                    <span key={i} className="rounded-[4px]" style={{ background: "#1d222c" }} />
                  ))}
                </div>
                {/* Trackpad */}
                <div className="absolute left-1/2 top-[62%] h-[28%] w-[36%] -translate-x-1/2 rounded-[12px]" style={{ background: "#c2c6ce", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }} />
              </div>
              {/* Front edge */}
              <div
                className="absolute bottom-0 left-[1%] right-[1%] rounded-b-[14px]"
                style={{ height: LIP, transformOrigin: "50% 100%", transform: "rotateX(90deg)", background: "linear-gradient(180deg, #b7bcc5, #8e939d)" }}
              />
            </div>

            {/* Lid */}
            <motion.div
              className="absolute inset-0"
              style={{ rotateX: lidAngle, y: -LIFT, transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
            >
              {/* Screen side */}
              <div className="absolute inset-0 rounded-[22px] bg-[#101319]" style={{ backfaceVisibility: "hidden", padding: BEZEL }}>
                <div className="relative overflow-hidden rounded-[9px]" style={{ width: SCREEN_W, height: SCREEN_H }}>
                  <MeetingScreen platform={platform} animate={animate} focus={focus} />
                  <motion.div className="absolute inset-0 bg-[#07090d]" style={{ opacity: screenOff }} />
                </div>
              </div>
              {/* Outer shell, with the mark */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[22px]"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "linear-gradient(160deg, #e3e6eb 0%, #cdd1d8 55%, #bcc1ca 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
                }}
              >
                <Logo className="h-[88px] w-auto" />
              </div>
              {/* Top edge (the lid's thickness; the front edge when shut) */}
              <div
                className="absolute left-[1.5%] right-[1.5%] top-0 rounded-[3px]"
                style={{ height: LIFT, transformOrigin: "50% 0", transform: "rotateX(90deg)", background: "linear-gradient(180deg, #c9cdd5, #a9aeb8)" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
