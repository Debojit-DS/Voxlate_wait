import Link from "next/link";
import { Sparkles } from "lucide-react";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

const trustAvatars = [
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=16",
  "https://i.pravatar.cc/150?img=12",
];

/** Closing call to action banner matching the hero-card format with visible #285A78 grid pattern. */
export function EarlyTesterBanner({ source = "tester-banner" }: { source?: string }) {
  return (
    <section
      aria-labelledby={`tester-${source}`}
      className="bg-page py-16 md:py-24"
    >
      <div className="page-container max-w-[1100px] mx-auto">
        <div className="group relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-line/80 bg-surface px-6 py-14 sm:px-12 sm:py-18 md:px-16 md:py-20 text-center shadow-[0_8px_30px_rgba(24,43,58,0.04)] hover:shadow-[0_12px_36px_rgba(40,90,120,0.06)] transition-shadow duration-300">
          {/* Visible #285A78 square grid pattern with light hover brightening */}
          <div
            className="pointer-events-none absolute inset-0 opacity-85 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(40, 90, 120, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(40, 90, 120, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse at center, black 55%, transparent 92%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 92%)",
            }}
            aria-hidden="true"
          />

          {/* Radial soft glow with gentle hover illumination */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(237,241,244,0.65)_0%,transparent_75%)] group-hover:bg-[radial-gradient(circle_at_center,rgba(40,90,120,0.06)_0%,transparent_80%)] transition-colors duration-500"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Tag / Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-5">
              <Sparkles size={14} className="text-primary shrink-0" aria-hidden="true" />
              <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
                START YOUR JOURNEY
              </span>
            </div>

            {/* Heading */}
            <h2
              id={`tester-${source}`}
              className="font-display text-[34px] sm:text-[46px] md:text-[56px] leading-[1.08] text-ink font-normal tracking-tight max-w-[20ch] mx-auto"
            >
              Ready to Speak Any Language in{" "}
              <span className="italic font-display text-primary">Your Voice</span>?
            </h2>

            {/* Subheading */}
            <p className="mt-4 max-w-[56ch] mx-auto text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate">
              Join Voxlate today and let real-time AI voice translation help you connect naturally, collaborate globally, and preserve who you are.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <WaitlistButton source={source} label="Get Started →" wide />
              <Link
                href="/demo"
                className="inline-flex h-12 items-center justify-center rounded-control bg-mist px-7 text-[15px] font-semibold text-primary border border-line hover:bg-mist/80 hover:border-primary/40 transition-all duration-200"
              >
                Watch Demo
              </Link>
            </div>

            {/* Social Trust Stack */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-slate">
              <div className="flex -space-x-2.5 overflow-hidden">
                {trustAvatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Community member"
                    className="inline-block h-8 w-8 rounded-full border-2 border-surface object-cover shadow-xs"
                  />
                ))}
              </div>
              <p className="text-[13px] sm:text-[14px] text-slate">
                Trusted by <strong className="font-semibold text-ink">12,000+ waitlist members</strong> helping shape voice translation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
