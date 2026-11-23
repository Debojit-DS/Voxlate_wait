"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MonitorUp, PhoneOff, Video } from "lucide-react";

export type Platform = "zoom" | "meet" | "teams";

export const PLATFORMS: Record<Platform, { label: string; title: string; accent: string; logo: string }> = {
  zoom: { label: "Zoom", title: "Zoom Meeting", accent: "#0b5cff", logo: "/images/platforms/zoom.svg" },
  meet: { label: "Google Meet", title: "meet.google.com · roadmap-sync", accent: "#1e8e3e", logo: "/images/platforms/google-meet-icon.png" },
  teams: { label: "Microsoft Teams", title: "Microsoft Teams · Weekly sync", accent: "#5b5fc7", logo: "/images/platforms/microsoft-teams.webp" },
};

/** Each participant speaks their own language; the viewer hears English. Translations are accurate. */
const PEOPLE = [
  { name: "Ananya", lang: "Hindi", tone: "#2340d8", said: "नमस्ते, चलिए शुरू करते हैं।", heard: "Hello, let’s get started.", script: "hi" },
  { name: "Arjun", lang: "Bengali", tone: "#b08a55", said: "আমি স্লাইডগুলো শেয়ার করছি।", heard: "I’m sharing the slides.", script: "bn" },
  { name: "Lucía", lang: "Spanish", tone: "#4e566a", said: "¿Me escuchan bien?", heard: "Can you all hear me?", script: "es" },
  { name: "Meera", lang: "Tamil", tone: "#0b1430", said: "நன்றி, அடுத்த பக்கத்தைப் பார்க்கலாம்.", heard: "Thanks, let’s look at the next page.", script: "ta" },
] as const;

const BASE_W = 720;
const BASE_H = 452;

/**
 * Coded stand-in for the old AI-generated laptop picture: a meeting window where
 * whoever is talking is captioned in their language and heard in English.
 */
export function DigitalMock({ platform, animate }: { platform: Platform; animate: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [speaker, setSpeaker] = useState(0);
  const p = PLATFORMS[platform];
  const line = PEOPLE[speaker];

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / BASE_W, height / (BASE_H + 40)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!animate) return;
    const id = window.setInterval(() => setSpeaker((s) => (s + 1) % PEOPLE.length), 3400);
    return () => window.clearInterval(id);
  }, [animate]);

  return (
    <div ref={frameRef} className="relative h-full w-full" aria-label="Illustration of a meeting translated by Voxlate" role="img">
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: BASE_W, height: BASE_H + 40, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }}
        aria-hidden="true"
      >
        {/* Lid */}
        <div className="rounded-[18px] bg-[#16181d] p-[10px] shadow-[0_30px_60px_-30px_rgba(11,20,48,0.55)]">
          <div className="flex h-[432px] flex-col overflow-hidden rounded-[9px] bg-[#0d1322] text-[#e9ecf5]">
            {/* Window bar */}
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 px-3 text-[12px]">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-3 h-2 w-2 rounded-full" style={{ background: p.accent }} />
              <span className="font-medium text-white/80">{p.title}</span>
              <span className="ml-auto tabular-nums text-white/45">12:04</span>
            </div>

            <div className="flex min-h-0 flex-1">
              {/* Tiles + caption */}
              <div className="flex min-w-0 flex-1 flex-col p-3">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  {PEOPLE.map((person, i) => {
                    const talking = i === speaker;
                    return (
                      <div
                        key={person.name}
                        className="relative flex items-center justify-center rounded-[8px] bg-[#18203a] transition-shadow duration-300"
                        style={{ boxShadow: talking ? "inset 0 0 0 2px #6f86ff" : "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                      >
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-full text-[22px] font-semibold text-white"
                          style={{ background: person.tone, fontFamily: "var(--font-display)" }}
                        >
                          {person.name[0]}
                        </span>
                        <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-[5px] bg-black/40 px-2 py-1 text-[11px]">
                          {person.name}
                          <span className="text-white/50">· {person.lang}</span>
                        </span>
                        {talking && (
                          <span className="vx-bars absolute right-2.5 top-2.5 flex items-center gap-[3px] text-[#8fa0ff]">
                            <i />
                            <i />
                            <i />
                            <i />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Live caption: original → what you hear */}
                <div key={speaker} className="vx-caption-in mt-2 rounded-[8px] bg-black/35 px-3.5 py-2.5">
                  <p className="text-[12px] text-white/55" lang={line.script} style={{ fontFamily: "var(--font-indic)" }}>
                    {line.name} said · <span className="text-white/75">{line.said}</span>
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-white">
                    <span className="mr-1.5 text-[#8fa0ff]">You hear</span>“{line.heard}”
                    <span className="ml-2 text-[11px] font-normal text-white/45">in {line.name}’s voice</span>
                  </p>
                </div>

                {/* Controls */}
                <div className="mt-2 flex items-center justify-center gap-2.5">
                  {[Mic, Video, MonitorUp].map((Icon, i) => (
                    <span key={i} className="flex h-8 w-10 items-center justify-center rounded-[7px] bg-white/8 text-white/80">
                      <Icon size={15} />
                    </span>
                  ))}
                  <span className="flex h-8 w-12 items-center justify-center rounded-[7px] bg-[#d93a3a] text-white">
                    <PhoneOff size={15} />
                  </span>
                </div>
              </div>

              {/* Voxlate panel */}
              <div className="flex w-[196px] shrink-0 flex-col gap-2 border-l border-white/10 bg-[#0a0f1c] p-3 text-[11.5px]">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                  <span className="h-2 w-2 rounded-full bg-[#6f86ff]" /> Voxlate
                </p>
                {[
                  ["My language", "English"],
                  ["Meeting language", "Auto-detect"],
                  ["Microphone", "Voxlate Microphone"],
                  ["Speaker", "Voxlate Speaker"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[6px] bg-white/5 px-2.5 py-2">
                    <p className="text-white/45">{k}</p>
                    <p className="mt-0.5 font-medium text-white/90">{v}</p>
                  </div>
                ))}
                <p className="mt-auto flex items-center gap-2 text-white/60">
                  <span className="vx-bars flex items-center gap-[3px] text-[#6f86ff]">
                    <i />
                    <i />
                    <i />
                  </span>
                  Translating · voice kept
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Base */}
        <div className="mx-auto h-[14px] w-[108%] -translate-x-[3.7%] rounded-b-[14px] rounded-t-[3px] bg-gradient-to-b from-[#c9ccd3] to-[#9a9ea8]" />
        <div className="mx-auto h-[5px] w-[22%] rounded-b-[6px] bg-[#8b8f99]" />
      </div>
    </div>
  );
}
