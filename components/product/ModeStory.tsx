"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { clamp01, smoothstep } from "@/components/home/lemniscate";
import { LED_COLORS } from "@/components/home/story/earpiece";
import { makeChoreography, StationIndex, StationPanel, useStationStyle } from "@/components/home/story/Station";
import type { MarkerPoint, StoryPalette, StoryScene } from "@/components/home/story/scene";

/*
 * Physical page story: the same infinity ribbon as the homepage. The earpiece floats down beside it,
 * then scrolling zooms into the ribbon's arc, where two circles ride it: P2P (green) and P2E (blue).
 * The ribbon and the device's LED strip take the colour of the mode in focus.
 */

const SCROLL_VH = 300; // pinned distance, in svh
const CHOREO = makeChoreography({ introFrom: 0.02, introTo: 0.22, stationFrom: 0.27, stationStep: 0.5, stations: 2 });
const { introAt, stationAt, stationProgress } = CHOREO;

const P2P_COLOR = "#0C7F4A";
const P2E_COLOR = "#1F3FB8";

/** Hero, then P2P, then P2E. */
const PALETTE: StoryPalette[] = [
  { ribbon: P2E_COLOR, led: LED_COLORS.blue },
  { ribbon: P2P_COLOR, led: LED_COLORS.green },
  { ribbon: P2E_COLOR, led: LED_COLORS.blue },
];

const MODES = [
  {
    id: "p2p",
    code: "P2P",
    name: "Person to Person",
    color: P2P_COLOR,
    title: "Two people. Two languages. One conversation.",
    body: "For a conversation between you and one other person. You speak in your language, they hear theirs, and their reply reaches you in yours, still in their voice.",
    points: ["Face to face, one to one", "Designed to auto-connect within 2 m, no pairing", "Travel, shopping, offices, clinics and campuses"],
    light: "The light strip glows green while P2P is on.",
  },
  {
    id: "p2e",
    code: "P2E",
    name: "Person to Environment",
    color: P2E_COLOR,
    title: "Hear the room in your language.",
    body: "For when one person speaks to many. Voxlate listens to the voice in front of you, a lecturer, a tour guide, a stallholder, and you hear it in your language.",
    points: ["Seminars, lectures and classrooms", "Guided tours and local markets", "Built for groups of 2 to 200"],
    light: "The light strip glows blue while P2E is on.",
  },
] as const;

export function ModeStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<StoryScene | null>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const markerLayer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { openWaitlist } = useGatedWaitlist();
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "fallback">("loading");

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const heroOpacity = useTransform(scrollYProgress, (p) => 1 - smoothstep(0, 0.45, introAt(p)));
  const heroY = useTransform(scrollYProgress, (p) => introAt(p) * -56);
  const heroPointer = useTransform(heroOpacity, (o) => (o > 0.4 ? "auto" : "none"));
  const s0 = useStationStyle(scrollYProgress, 0, CHOREO);
  const s1 = useStationStyle(scrollYProgress, 1, CHOREO);
  const styles = [s0, s1];

  const placeMarkers = useCallback((points: MarkerPoint[], compact: boolean, station: number, intro: number) => {
    const layer = markerLayer.current;
    if (layer) layer.style.opacity = String(smoothstep(0.6, 0.95, intro));
    const h = window.innerHeight;
    points.forEach((pt, i) => {
      const el = markerRefs.current[i];
      if (!el) return;
      const act = clamp01(1 - Math.abs(station - i));
      el.style.opacity = String(smoothstep(70, 140, pt.y) * smoothstep(h + 10, h - 70, pt.y));
      const base = compact ? 92 : 156;
      const size = base * (0.58 + 0.42 * act);
      el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
      el.style.setProperty("--act", act.toFixed(3));
      el.style.setProperty("--marker-size", `${size.toFixed(1)}px`);
      el.style.setProperty("--marker-font", `${(compact ? 13 : 16) + act * (compact ? 5 : 8)}px`);
      el.tabIndex = intro > 0.6 ? 0 : -1;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let scene: StoryScene | null = null;
    import("@/components/home/story/scene")
      .then(({ createStoryScene }) =>
        createStoryScene({
          canvas,
          modelUrl: "/models/voxlate-earpiece.glb",
          reducedMotion: reduced,
          markerCount: MODES.length,
          variant: "modes",
          palette: PALETTE,
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
  });

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

  const focusStation = (i: number) => () => {
    if (Math.abs(stationAt(scrollYProgress.get()) - i) > 0.3 || introAt(scrollYProgress.get()) < 0.9) scrollToStation(i);
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="physical-title"
      className="relative -mt-[72px]"
      style={{ height: `calc(100svh + ${SCROLL_VH}svh)` }}
    >
      {MODES.map((m, i) => (
        <span
          key={m.id}
          id={m.id}
          aria-hidden="true"
          className="absolute left-0"
          style={{ top: `calc(${stationProgress(i) * SCROLL_VH}svh + 88px)` }}
        />
      ))}

      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div className="vx-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

        {/* ── Hero ── */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointer }}
          className="page-container absolute inset-x-0 top-0 flex h-full flex-col pt-[104px] lg:justify-center lg:pt-[72px]"
        >
          <div className="max-w-[560px] lg:max-w-[50%]">
            <p className="vx-label">Physical version · in development</p>
            <h1 id="physical-title" className="vx-display mt-4 text-[clamp(2.4rem,10vw,3.25rem)] text-ink lg:text-[clamp(3rem,4.3vw,4.6rem)]">
              <span className="vx-line" style={{ ["--w-rest" as string]: 600, ["--w-hover" as string]: 820 }}>
                Real world.
              </span>
              <span className="vx-line text-primary" style={{ ["--w-rest" as string]: 600, ["--w-hover" as string]: 820 }}>
                Real conversations.
              </span>
            </h1>
            <p className="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-slate sm:text-[18px] lg:mt-7">
              A wearable translator that lets you hear and speak in your own language, face to face and in real time. One device,
              two modes: the light around the touch panel tells you which one is on.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 lg:mt-9">
              <button type="button" className="vx-btn" onClick={() => openWaitlist("physical-version-hero")}>
                Join the Waitlist
              </button>
              <button type="button" className="vx-link" onClick={() => scrollToStation(0)}>
                See the two modes <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Mode circles riding the ribbon ── */}
        <div ref={markerLayer} className="absolute inset-0" style={{ opacity: 0 }}>
          {MODES.map((m, i) => (
            <button
              key={m.id}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              type="button"
              tabIndex={-1}
              className="vx-marker"
              style={{
                ["--marker-color" as string]: m.color,
                ...(sceneState === "fallback" ? { transform: `translate3d(12vw, ${36 + i * 24}svh, 0)` } : {}),
              }}
              onClick={() => scrollToStation(i)}
              aria-label={`Go to ${m.code}, ${m.name}`}
            >
              <span>
                <small>0{i + 1}</small>
                {m.code}
                <small className="vx-marker-note">{m.name}</small>
              </span>
            </button>
          ))}
        </div>

        {/* ── Modes ── */}
        {MODES.map((m, i) => (
          <StationPanel key={m.id} style={styles[i]} labelledBy={`mode-${m.id}`} onFocus={focusStation(i)}>
            <StationIndex
              n={`0${i + 1}`}
              of="02"
              note={
                <span className="font-semibold" style={{ color: m.color }}>
                  {m.code} · {m.name}
                </span>
              }
            />
            <h2 id={`mode-${m.id}`} className="vx-display text-[clamp(1.9rem,6vw,2.4rem)] text-ink lg:text-[clamp(2.3rem,3.2vw,3.2rem)]">
              {m.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate lg:mt-4 lg:text-[17px]">{m.body}</p>
            <ul className="mt-4 space-y-2 text-[14px] text-ink lg:mt-5 lg:text-[15px]">
              {m.points.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span aria-hidden="true" className="h-[3px] w-3 shrink-0 rounded-full" style={{ background: m.color }} />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-4 hidden items-center gap-2 text-[14px] text-slate sm:flex">
              <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: m.color }} />
              {m.light}
            </p>
            {i === MODES.length - 1 ? (
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-7">
                <button type="button" className="vx-btn vx-btn-sm" onClick={() => openWaitlist("product-physical")}>
                  Join the Waitlist
                </button>
                <Link href="/demo" className="vx-link text-[15px]">
                  Try the web demo <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            ) : (
              <button type="button" className="vx-chip mt-5 w-fit lg:mt-7" onClick={() => scrollToStation(1)}>
                Next: P2E <ArrowRight size={14} aria-hidden />
              </button>
            )}
          </StationPanel>
        ))}
      </div>
    </section>
  );
}
