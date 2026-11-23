"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { TrustLine } from "@/components/home/TrustLine";
import { clamp01, smoothstep } from "@/components/home/lemniscate";
import { DigitalMock, PLATFORMS, type Platform } from "./DigitalMock";
import type { DevicePart, MarkerPoint, StoryScene } from "./scene";

/* Scroll choreography (fractions of the pinned scroll distance). */
const SCROLL_VH = 420; // pinned distance, in svh
const INTRO_FROM = 0.02;
const INTRO_TO = 0.17;
const STATION_FROM = 0.2;
const STATION_STEP = 0.28;
const STATIONS = 3;

const introAt = (p: number) => clamp01((p - INTRO_FROM) / (INTRO_TO - INTRO_FROM));
/** 0..2 with a dwell around each whole number so each station holds still while you read. */
const stationAt = (p: number) => {
  const x = Math.min(STATIONS - 1, Math.max(0, (p - STATION_FROM) / STATION_STEP));
  const i = Math.min(STATIONS - 2, Math.floor(x));
  return i + smoothstep(0.22, 0.78, x - i);
};
/** Scroll fraction at which station i is fully in focus. */
const stationProgress = (i: number) => STATION_FROM + i * STATION_STEP + 0.03;

const MARKERS = [
  { index: "01", label: "Voxlate" },
  { index: "02", label: "Digital" },
  { index: "03", label: "Physical" },
];

const PARTS: { part: DevicePart; label: string; note: string }[] = [
  { part: "touch_pad", label: "Touch pad", note: "The brass disc on the face." },
  { part: "volume_buttons", label: "Volume keys", note: "Two keys on the side." },
  { part: "ear_gel", label: "Ear gel", note: "Soft tip that holds it in place." },
];

function useStationStyle(progress: MotionValue<number>, i: number) {
  const opacity = useTransform(progress, (p) => {
    const a = stationAt(p);
    const fade = clamp01(1 - Math.abs(a - i) * 2.4);
    return i === 0 ? fade * smoothstep(0.75, 1, introAt(p)) : fade;
  });
  const y = useTransform(progress, (p) => (i - stationAt(p)) * 36);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  return { opacity, y, pointerEvents };
}

export function HomeStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<StoryScene | null>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const markerLayer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { openWaitlist } = useGatedWaitlist();
  const [platform, setPlatform] = useState<Platform>("zoom");
  const [part, setPart] = useState<DevicePart | null>(null);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "fallback">("loading");
  const [digitalInView, setDigitalInView] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const heroOpacity = useTransform(scrollYProgress, (p) => 1 - smoothstep(0, 0.45, introAt(p)));
  const heroY = useTransform(scrollYProgress, (p) => introAt(p) * -56);
  const heroPointer = useTransform(heroOpacity, (o) => (o > 0.4 ? "auto" : "none"));
  const s0 = useStationStyle(scrollYProgress, 0);
  const s1 = useStationStyle(scrollYProgress, 1);
  const s2 = useStationStyle(scrollYProgress, 2);
  const mockX = useTransform(scrollYProgress, (p) => (1 - stationAt(p)) * 48);

  // Markers are positioned every frame by the scene; this keeps them in sync without React renders.
  const placeMarkers = useCallback((points: MarkerPoint[], compact: boolean, station: number, intro: number) => {
    const layer = markerLayer.current;
    if (layer) layer.style.opacity = String(smoothstep(0.6, 0.95, intro));
    const h = window.innerHeight;
    points.forEach((pt, i) => {
      const el = markerRefs.current[i];
      if (!el) return;
      const act = clamp01(1 - Math.abs(station - i));
      // Fade out under the navbar and at the bottom edge.
      el.style.opacity = String(smoothstep(70, 140, pt.y) * smoothstep(h + 10, h - 70, pt.y));
      const base = compact ? 84 : 148;
      const size = base * (0.58 + 0.42 * act);
      el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
      el.style.setProperty("--act", act.toFixed(3));
      el.style.setProperty("--marker-size", `${size.toFixed(1)}px`);
      el.style.setProperty("--marker-font", `${(compact ? 11 : 13) + act * (compact ? 4 : 6)}px`);
      el.tabIndex = intro > 0.6 ? 0 : -1;
    });
  }, []);

  // Boot the WebGL scene lazily so three.js stays out of the initial bundle.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let scene: StoryScene | null = null;
    import("./scene")
      .then(({ createStoryScene }) =>
        createStoryScene({
          canvas,
          modelUrl: "/models/voxlate-earpiece.glb",
          reducedMotion: reduced,
          markerCount: MARKERS.length,
          onMarkers: placeMarkers,
        }),
      )
      .then((created) => {
        if (cancelled) return created.dispose();
        scene = created;
        sceneRef.current = created;
        const p = scrollYProgress.get();
        created.setTargets(introAt(p), stationAt(p));
        setSceneState("ready");
      })
      .catch(() => !cancelled && setSceneState("fallback"));
    return () => {
      cancelled = true;
      sceneRef.current = null;
      scene?.dispose();
    };
  }, [placeMarkers, reduced, scrollYProgress]);

  // Only animate while the story is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || sceneState !== "ready") return;
    const io = new IntersectionObserver(([entry]) => sceneRef.current?.setRunning(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(section);
    const onPointer = (e: PointerEvent) => {
      sceneRef.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      sceneRef.current?.setRunning(false);
    };
  }, [sceneState]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    sceneRef.current?.setTargets(introAt(p), stationAt(p));
    const near = Math.abs(stationAt(p) - 1) < 0.6;
    setDigitalInView((v) => (v === near ? v : near));
  });

  useEffect(() => {
    sceneRef.current?.setHighlight(part);
  }, [part]);

  const scrollToStation = useCallback(
    (i: number) => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const distance = section.offsetHeight - stage.offsetHeight;
      const top = section.getBoundingClientRect().top + window.scrollY + stationProgress(i) * distance;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  // Tabbing into a station that isn't on screen brings it into view.
  const focusStation = (i: number) => () => {
    if (Math.abs(stationAt(scrollYProgress.get()) - i) > 0.3 || introAt(scrollYProgress.get()) < 0.9) scrollToStation(i);
  };

  return (
    // Pulled up under the floating navbar (76px) so the pinned stage fills the whole viewport from the first frame.
    <section ref={sectionRef} aria-label="Voxlate" className="relative -mt-[76px]" style={{ height: `calc(100svh + ${SCROLL_VH}svh)` }}>
      {/* In-page anchors used by the navbar and footer */}
      <span id="about" aria-hidden="true" className="absolute left-0" style={{ top: `calc(${stationProgress(0) * SCROLL_VH}svh + 88px)` }} />
      <span id="products" aria-hidden="true" className="absolute left-0" style={{ top: `calc(${stationProgress(1) * SCROLL_VH}svh + 88px)` }} />
      <span id="physical" aria-hidden="true" className="absolute left-0" style={{ top: `calc(${stationProgress(2) * SCROLL_VH}svh + 88px)` }} />

      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div className="vx-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
        {sceneState === "fallback" && <StaticInfinity />}

        {/* ── Hero ── */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointer }}
          className="page-container absolute inset-x-0 top-0 flex h-full flex-col pt-[104px] lg:justify-center lg:pt-[76px]"
        >
          <div className="max-w-[560px] lg:max-w-[52%]">
            <h1 id="hero-title" className="vx-display text-[clamp(2.4rem,10vw,3.25rem)] text-ink lg:text-[clamp(3rem,4.3vw,4.6rem)] lg:whitespace-nowrap">
              {["Speak your language.", "Connect without", "borders."].map((line, i) => (
                <span
                  key={line}
                  className={`vx-line ${i > 0 ? "text-primary" : ""}`}
                  style={{ ["--w-rest" as string]: 600, ["--w-hover" as string]: 820 }}
                >
                  {line}{" "}
                </span>
              ))}
            </h1>
            <div className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-slate sm:text-[18px] lg:mt-7">
              <p className="vx-line" style={{ ["--w-rest" as string]: 400, ["--w-hover" as string]: 560 }}>
                Connect with anyone, in any language, through real-time AI translation.
              </p>
              <p className="vx-line mt-1" style={{ ["--w-rest" as string]: 400, ["--w-hover" as string]: 560 }}>
                Keep the voice, tone, and emotion that make every conversation yours.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 lg:mt-9">
              <button type="button" className="vx-btn" onClick={() => openWaitlist("hero")}>
                Join the Waitlist
              </button>
              <Link href="/demo" className="vx-link">
                Experience the demo <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <TrustLine className="mt-7 lg:mt-10" />
          </div>
        </motion.div>

        {/* ── Station markers riding the ribbon ── */}
        <div ref={markerLayer} className="absolute inset-0" style={{ opacity: 0 }}>
          {MARKERS.map((m, i) => (
            <button
              key={m.label}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              type="button"
              tabIndex={-1}
              className="vx-marker"
              style={sceneState === "fallback" ? { transform: `translate3d(12vw, ${30 + i * 20}svh, 0)` } : undefined}
              onClick={() => scrollToStation(i)}
              aria-label={`Go to ${m.label === "Voxlate" ? "What is Voxlate" : `${m.label} version`}`}
            >
              <span>
                <small>{m.index}</small>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Station 1: What is Voxlate ── */}
        <StationPanel style={s0} labelledBy="station-about" onFocus={focusStation(0)}>
          <StationIndex n="01" of="03" />
          <h2 id="station-about" className="vx-display text-[clamp(1.9rem,6vw,2.4rem)] text-ink lg:text-[clamp(2.4rem,3.4vw,3.4rem)]">
            What is Voxlate?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate lg:mt-4 lg:text-[17px]">
            An AI-powered communication platform being built to remove language barriers while keeping the speaker’s own voice, tone and
            emotion. Online or face to face, the conversation should feel natural, without anyone learning a new language.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 lg:mt-6">
            <button type="button" className="vx-chip" onClick={() => scrollToStation(1)}>
              Online meetings <ArrowRight size={14} aria-hidden />
            </button>
            <button type="button" className="vx-chip" onClick={() => scrollToStation(2)}>
              Face to face <ArrowRight size={14} aria-hidden />
            </button>
          </div>
        </StationPanel>

        {/* ── Station 2: Digital ── */}
        <StationPanel style={s1} labelledBy="station-digital" onFocus={focusStation(1)}>
          <StationIndex n="02" of="03" note="Two ways to connect. One shared language." />
          <h2 id="station-digital" className="vx-display text-[clamp(1.9rem,6vw,2.4rem)] text-ink lg:text-[clamp(2.4rem,3.4vw,3.4rem)]">
            Your meeting. Every language.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate lg:mt-4 lg:text-[17px]">
            Software for online meetings. Pick Voxlate as your microphone and speaker in your meeting app: you speak in yours, the meeting
            hears theirs. Built for freelancers, IT teams, BPOs and global teams.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 lg:mt-6" role="group" aria-label="Show it in">
            {(Object.keys(PLATFORMS) as Platform[]).map((key) => (
              <button key={key} type="button" className="vx-chip" aria-pressed={platform === key} onClick={() => setPlatform(key)}>
                <Image src={PLATFORMS[key].logo} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                {PLATFORMS[key].label}
              </button>
            ))}
          </div>
          <StationActions href="/digital-version" onJoin={() => openWaitlist("product-digital")} />
        </StationPanel>

        <motion.div
          style={{ opacity: s1.opacity, x: mockX }}
          className="pointer-events-none absolute left-[26vw] right-[4vw] top-[84px] h-[38%] lg:left-auto lg:right-[2.5vw] lg:top-1/2 lg:h-[70%] lg:w-[36vw] lg:-translate-y-1/2"
        >
          <DigitalMock platform={platform} animate={digitalInView && !reduced} />
        </motion.div>

        {/* ── Station 3: Physical ── */}
        <StationPanel style={s2} labelledBy="station-physical" onFocus={focusStation(2)}>
          <StationIndex n="03" of="03" note="Two ways to connect. One shared language." />
          <h2 id="station-physical" className="vx-display text-[clamp(1.9rem,6vw,2.4rem)] text-ink lg:text-[clamp(2.4rem,3.4vw,3.4rem)]">
            Real conversations. No language barrier.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate lg:mt-4 lg:text-[17px]">
            A wearable translator in development for travel, classrooms, seminars and everyday talk. Wear it, choose your language, talk
            naturally, and hear the reply in yours.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 lg:mt-6" role="group" aria-label="Look closer at">
            {PARTS.map((p) => (
              <button
                key={p.part}
                type="button"
                className="vx-chip"
                aria-pressed={part === p.part}
                title={p.note}
                onClick={() => setPart((cur) => (cur === p.part ? null : p.part))}
                onPointerEnter={(e) => e.pointerType === "mouse" && setPart(p.part)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setPart(null)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-4 hidden text-[14px] text-slate sm:block">Designed to auto-connect within 2 m, for groups of 2 to 200.</p>
          <StationActions href="/physical-version" onJoin={() => openWaitlist("product-physical")} />
        </StationPanel>
      </div>
    </section>
  );
}

function StationPanel({
  style,
  labelledBy,
  onFocus,
  children,
}: {
  style: ReturnType<typeof useStationStyle>;
  labelledBy: string;
  onFocus: () => void;
  children: ReactNode;
}) {
  return (
    <motion.article
      aria-labelledby={labelledBy}
      onFocusCapture={onFocus}
      style={style}
      className="absolute bottom-6 left-[26vw] right-4 top-[46%] flex flex-col justify-start sm:bottom-10 lg:bottom-auto lg:left-[31vw] lg:right-auto lg:top-1/2 lg:w-[min(28vw,440px)] lg:-translate-y-1/2"
    >
      {children}
    </motion.article>
  );
}

function StationIndex({ n, of, note }: { n: string; of: string; note?: string }) {
  return (
    <p className="vx-label mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 lg:mb-4">
      <span className="text-ink">
        {n} <span className="text-line-strong">/ {of}</span>
      </span>
      {note && (
        <>
          <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
          <span>{note}</span>
        </>
      )}
    </p>
  );
}

function StationActions({ href, onJoin }: { href: string; onJoin: () => void }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-7">
      <button type="button" className="vx-btn vx-btn-sm" onClick={onJoin}>
        Join the Waitlist
      </button>
      <Link href={href} className="vx-link text-[15px]">
        See details <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}

/** Shown only when WebGL is unavailable. */
function StaticInfinity() {
  return (
    <svg viewBox="-1.1 -0.6 2.2 1.2" className="pointer-events-none absolute bottom-[8%] right-[4%] w-[46vw] max-w-[640px] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2" aria-hidden="true">
      <path
        d="M0 0 C0.25 0.35 0.75 0.45 0.95 0.12 C1.08 -0.1 0.9 -0.42 0.6 -0.4 C0.35 -0.38 0.18 -0.18 0 0 C-0.18 0.18 -0.35 0.38 -0.6 0.4 C-0.9 0.42 -1.08 0.1 -0.95 -0.12 C-0.75 -0.45 -0.25 -0.35 0 0 Z"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="0.07"
        strokeLinejoin="round"
      />
    </svg>
  );
}
