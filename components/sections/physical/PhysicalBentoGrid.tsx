"use client";

import {
  Zap,
  Volume2,
  ShieldCheck,
  WifiOff,
  BatteryCharging,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type Status = "In Development" | "Planned" | "Design Goal" | "Target Specification";

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    "In Development": "bg-primary/10 text-primary border-primary/25",
    "Planned": "bg-mist text-slate border-line-strong/30",
    "Design Goal": "bg-emerald-600/10 text-emerald-800 border-emerald-600/25",
    "Target Specification": "bg-amber-500/10 text-amber-800 border-amber-500/25",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

const SPECS = [
  { label: "Battery Life", value: "Up to 8 Hours" },
  { label: "Standby Time", value: "Up to 48 Hours" },
  { label: "Charging Case", value: "Portable & Magnetic" },
  { label: "Connectivity", value: "Bluetooth 5.3" },
  { label: "Range", value: "Up to 10 Meters" },
  { label: "Weight", value: "Ultra Light" },
];

export function PhysicalBentoGrid() {
  return (
    <section
      id="features"
      aria-labelledby="why-title"
      className="border-t border-line bg-page pt-16 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12"
    >
      <div className="page-container">
        {/* Section Header */}
        <div className="mx-auto max-w-[800px] text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-4">
            <Sparkles size={14} className="text-primary shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
              WHY CHOOSE VOXLATE PHYSICAL
            </span>
          </div>
          <h2
            id="why-title"
            className="font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight"
          >
            Why Choose Voxlate Physical?
          </h2>
          <p className="mt-3 text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate max-w-[64ch] mx-auto">
            Engineered from the ground up for authentic real-world conversations without screens or apps. Each capability transparently shows its development status and engineering benchmarks.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {/* Card 1: Prominent Feature Card (Real-Time Translation) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap size={20} aria-hidden />
              </div>
              <StatusBadge status="In Development" />
            </div>

            <h3 className="font-display text-[22px] sm:text-[26px] font-bold text-ink leading-tight">
              Real-Time AI Voice Translation
            </h3>

            <p className="mt-2.5 text-[14.5px] sm:text-[15.5px] leading-relaxed text-slate max-w-[66ch]">
              Direct, sub-second neural translation engineered for live face-to-face dialogue. Speak naturally in your native language while those around you hear your words seamlessly in theirs without jarring pauses or robotic cadence. Designed so conversations flow as immediately as speaking in person.
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
              Engineered to retain your original voice inflections, emotional cadence, and pitch. You sound authentically like yourself across languages rather than a generic synthetic voice.
            </p>
          </div>

          {/* Card 3: Works Offline (Edge Processing) */}
          <div className="rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <WifiOff size={20} aria-hidden />
              </div>
              <StatusBadge status="Planned" />
            </div>

            <h3 className="font-display text-[20px] sm:text-[23px] font-bold text-ink leading-snug">
              Works Offline (Edge AI)
            </h3>

            <p className="mt-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-slate">
              Autonomous on-device neural processing planned for translations without continuous cellular data or Wi-Fi connectivity. Reliable for international travel, remote transit, and busy markets.
            </p>
          </div>

          {/* Card 4: Secure & Private */}
          <div className="rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={20} aria-hidden />
              </div>
              <StatusBadge status="Design Goal" />
            </div>

            <h3 className="font-display text-[20px] sm:text-[23px] font-bold text-ink leading-snug">
              Private & Secure by Design
            </h3>

            <p className="mt-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-slate">
              Your conversations stay confidential. In-person audio is processed securely in transit with zero permanent storage, never retained, and never used to train public foundation models.
            </p>
          </div>

          {/* Card 5: Long Battery Life */}
          <div className="rounded-[20px] sm:rounded-[22px] border border-line bg-surface p-5 sm:p-6 pb-4 sm:pb-5 shadow-xs hover:shadow-[0_10px_32px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BatteryCharging size={20} aria-hidden />
              </div>
              <StatusBadge status="Target Specification" />
            </div>

            <h3 className="font-display text-[20px] sm:text-[23px] font-bold text-ink leading-snug">
              Long Battery Life
            </h3>

            <p className="mt-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-slate">
              Low-power hardware architecture targeting up to 8 hours of active conversation and 48 hours standby, supplemented by a portable magnetic case for effortless recharging.
            </p>
          </div>
        </div>

        {/* Technical Specifications Panel */}
        <div className="mt-12 sm:mt-16 rounded-[20px] sm:rounded-[24px] border border-line bg-surface p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-line">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontal size={18} aria-hidden />
              </div>
              <div>
                <h3 className="font-display text-[20px] sm:text-[22px] font-bold text-ink">
                  Technical Specifications
                </h3>
                <p className="text-[13px] sm:text-[14px] text-slate">
                  Hardware targets and engineering benchmarks currently in development
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 tracking-wide w-fit">
              Target Benchmarks
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {SPECS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between border-b border-line/60 py-3 sm:py-3.5"
              >
                <span className="text-[14.5px] sm:text-[15px] font-medium text-slate">
                  {s.label}
                </span>
                <span className="text-[14.5px] sm:text-[15px] font-semibold text-ink">
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-line/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[13px] text-slate">
            <p>
              The web demo translates recorded clips in a browser to evaluate speech models; it does not demonstrate this physical device.
            </p>
            <p className="shrink-0 text-slate/80">Subject to hardware testing</p>
          </div>
        </div>
      </div>
    </section>
  );
}

