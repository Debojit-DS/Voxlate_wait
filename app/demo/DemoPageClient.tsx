"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoCard } from "@/components/sections/digital/DemoCard";

const NOTES = [
  { title: "Your own voice", body: "The reply is spoken in a voice cloned from your clip, not a stock narrator." },
  { title: "Recorded clips", body: "This demo works on short recordings. Live, two-way calls are what we’re building next." },
  { title: "Five tries", body: "Each waitlist account gets five translations while we keep server costs in check." },
];

export default function DemoPageClient() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="pb-24 lg:pb-32">
        <section className="page-container vx-page-head grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="vx-label">Web demo</p>
            <h1 className="vx-display mt-4 text-[clamp(2.8rem,6.6vw,5.5rem)] text-ink">
              Hear yourself
              <br />
              <span className="text-primary">in another language.</span>
            </h1>
          </div>
          <p className="max-w-[42ch] text-[17px] leading-relaxed text-slate lg:pb-3">
            Pick a language, say a sentence, and listen to how someone else would hear you: same voice, same tone, different
            language.
          </p>
        </section>

        <section className="page-container" aria-label="Try the demo">
          <DemoCard />
        </section>

        <section className="page-container mt-16 grid gap-0 border-t border-line md:grid-cols-3" aria-label="About this demo">
          {NOTES.map((n, i) => (
            <div key={n.title} className={`py-8 md:pr-8 ${i > 0 ? "border-t border-line md:border-l md:border-t-0 md:pl-8" : ""}`}>
              <h2 className="text-[17px] font-semibold text-ink">{n.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">{n.body}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
