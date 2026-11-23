import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistGift } from "@/components/home/WaitlistGift";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";
import { PlatformMock } from "@/components/product/PlatformMock";

export const metadata = {
  title: "Digital version — Voxlate",
  description:
    "Voxlate Digital is being built to bring natural, voice-preserving translation to Zoom, Google Meet and Microsoft Teams. You speak in yours; the meeting hears theirs.",
  openGraph: {
    title: "Digital version — Voxlate",
    description: "Natural, voice-preserving translation for your online meetings.",
    type: "website",
  },
};

const FEATURES = [
  {
    title: "Real-time voice translation",
    status: "In development",
    body: "Two-way speech translation built for live calls. Speak in your language while everyone else hears you in theirs, with pauses short enough that the conversation keeps its rhythm.",
  },
  {
    title: "Your voice and tone, kept",
    status: "In development",
    body: "Built to carry your inflection, pitch and emotion across. The first release uses high-quality generic voices; using your own voice will be an optional setup step.",
  },
  {
    title: "Works in the background",
    status: "Planned",
    body: "Plugs into Zoom, Google Meet and Microsoft Teams through a virtual microphone and speaker, and runs quietly from the Windows tray with pause, mute and session controls.",
  },
  {
    title: "Private by design",
    status: "Design goal",
    body: "Meeting audio is processed in transit with no permanent storage, and is never sold or used to train public foundation models. Details are in our Privacy Policy.",
  },
  {
    title: "More languages over time",
    status: "Long-term goal",
    body: "Starting with a dedicated Hindi ↔ English pilot for precise, natural phrasing, then expanding across major global and regional languages.",
  },
];

const SETUP = [
  { title: "Choose devices and languages", body: "Pick your real microphone and headphones, then set My language and Meeting language." },
  { title: "Select Voxlate in your meeting app", body: "In Zoom, Meet or Teams audio settings, choose Voxlate Microphone and Voxlate Speaker." },
  { title: "Start a session", body: "Start translation for a supported language pair. You speak in yours; the meeting hears theirs." },
];

export default function DigitalVersionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <section aria-labelledby="digital-title" className="page-container vx-page-head grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="vx-label">Digital version</p>
            <h1 id="digital-title" className="vx-display mt-4 text-[clamp(2.8rem,6vw,5rem)] text-ink">
              Your meeting.
              <br />
              <span className="text-primary">Every language.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-slate">
              Software we’re building for online meetings, calls and remote work. Speak naturally in your language; everyone else
              hears you in theirs, still sounding like you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <WaitlistButton source="digital-hero" label="Join the Waitlist" />
              <Link href="/demo" className="vx-link">
                Try the web demo <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
          <PlatformMock />
        </section>

        <section id="features" aria-labelledby="features-title" className="border-t border-line">
          <div className="page-container grid gap-10 py-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:py-24">
            <div>
              <h2 id="features-title" className="vx-display text-[clamp(2rem,3.8vw,3.25rem)] text-ink lg:sticky lg:top-28">
                What it’s being built to do
              </h2>
            </div>
            <ol>
              {FEATURES.map((f, i) => (
                <li key={f.title} className="grid grid-cols-[40px_1fr] gap-x-4 border-t border-line py-7 first:border-t-0 first:pt-0">
                  <span className="vx-label pt-1.5 text-primary">0{i + 1}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="vx-display text-[24px] text-ink">{f.title}</h3>
                      <span className="rounded-[6px] border border-line px-2 py-0.5 text-[12px] font-medium text-slate">{f.status}</span>
                    </div>
                    <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-slate">{f.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="setup-title" className="bg-surface">
          <div className="page-container py-16 lg:py-24">
            <h2 id="setup-title" className="vx-display text-[clamp(2rem,3.8vw,3.25rem)] text-ink">
              Three steps, then just talk.
            </h2>
            <ol className="mt-10 grid border-t border-line md:grid-cols-3">
              {SETUP.map((s, i) => (
                <li key={s.title} className={`py-8 md:pr-8 ${i > 0 ? "border-t border-line md:border-l md:border-t-0 md:pl-8" : ""}`}>
                  <span className="vx-display text-[48px] leading-none text-line-strong">{i + 1}</span>
                  <h3 className="mt-5 text-[18px] font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="pt-16 lg:pt-24">
          <WaitlistGift />
        </div>
      </main>
      <Footer />
    </div>
  );
}
