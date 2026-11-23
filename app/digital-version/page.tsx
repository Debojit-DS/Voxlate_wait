import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistGift } from "@/components/home/WaitlistGift";
import { LaptopStory } from "@/components/product/LaptopStory";

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

export default function DigitalVersionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <LaptopStory />

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

        <div className="pt-16 lg:pt-24">
          <WaitlistGift />
        </div>
      </main>
      <Footer />
    </div>
  );
}
