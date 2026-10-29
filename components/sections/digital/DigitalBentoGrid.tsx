"use client";

import {
  Cpu,
  Volume2,
  ShieldCheck,
  AppWindow,
  Languages,
  Sparkles,
} from "lucide-react";

type Status = "In Development" | "Planned" | "Long-term Goal" | "Design Goal";

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    "In Development": "bg-primary/10 text-primary border-primary/25",
    "Planned": "bg-mist text-slate border-line-strong/30",
    "Long-term Goal": "bg-amber-500/10 text-amber-800 border-amber-500/25",
    "Design Goal": "bg-emerald-600/10 text-emerald-800 border-emerald-600/25",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function DigitalBentoGrid() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="border-t border-line bg-page py-16 sm:py-20 md:py-24"
    >
      <div className="page-container">
        {/* Section Header */}
        <div className="mx-auto max-w-[800px] text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-4">
            <Sparkles size={14} className="text-primary shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
              FEATURES & CAPABILITIES
            </span>
          </div>
          <h2
            id="features-title"
            className="font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight"
          >
            Built for Every Professional Need
          </h2>
          <p className="mt-3 text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate max-w-[62ch] mx-auto">
            Engineered for privacy, natural conversations, and frictionless integration with your everyday workflow. Each item transparently shows where it stands today.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {/* Card 1: Prominent Feature Card (Real-Time AI Translation) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cpu size={20} aria-hidden />
              </div>
              <StatusBadge status="In Development" />
            </div>

            <h3 className="font-display text-[22px] sm:text-[26px] font-bold text-ink leading-tight">
              Real-Time AI Voice Translation
            </h3>

            <p className="mt-2.5 text-[14.5px] sm:text-[15.5px] leading-relaxed text-slate max-w-[66ch]">
              The core foundation of Voxlate. Bi-directional neural speech translation engineered for live virtual collaboration. Speak naturally in your native language while participants hear you seamlessly in theirs without jarring conversational pauses. Designed for minimal sub-second latency so discussions flow as naturally and immediately as speaking in person.
            </p>
          </div>

          {/* Card 2: Voice & Tone Preserved */}
          <div className="rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Volume2 size={20} aria-hidden />
              </div>
              <StatusBadge status="In Development" />
            </div>

            <h3 className="font-display text-[20px] sm:text-[23px] font-bold text-ink leading-snug">
              Voice & Tone Preserved
            </h3>

            <p className="mt-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-slate">
              Engineered to retain your original voice inflections, pitch, and emotional nuances. Releases with high-fidelity generic voices first; utilizing your own personalized voice will be an optional setup step.
            </p>
          </div>

          {/* Card 3: Works in Background (Meeting App Integration) */}
          <div className="rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <AppWindow size={20} aria-hidden />
              </div>
              <StatusBadge status="Planned" />
            </div>

            <h3 className="font-display text-[20px] sm:text-[23px] font-bold text-ink leading-snug">
              Works in Background
            </h3>

            <p className="mt-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-slate">
              Integrates smoothly with Zoom, Google Meet, and Microsoft Teams through virtual audio routing (Voxlate Microphone and Speaker). Runs quietly from the Windows system tray with quick pause, mute, and session controls.
            </p>
          </div>

          {/* Card 4: Totally Natural. Private by Design */}
          <div className="rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={20} aria-hidden />
              </div>
              <StatusBadge status="Design Goal" />
            </div>

            <h3 className="font-display text-[20px] sm:text-[23px] font-bold text-ink leading-snug">
              Private by Design
            </h3>

            <p className="mt-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-slate">
              Your conversations stay confidential. Meeting audio is processed securely in transit with zero permanent storage, and is never sold or used to train public foundation models. For details, read our Privacy Policy.
            </p>
          </div>

          {/* Card 5: 100+ Languages Roadmap */}
          <div className="rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Languages size={20} aria-hidden />
              </div>
              <StatusBadge status="Long-term Goal" />
            </div>

            <h3 className="font-display text-[20px] sm:text-[23px] font-bold text-ink leading-snug">
              100+ Supported Languages
            </h3>

            <p className="mt-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-slate">
              Starting with a dedicated Hindi ↔ English pilot for precision and natural phrasing, with planned systematic expansion across major global and regional languages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
