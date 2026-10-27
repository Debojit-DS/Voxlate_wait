import { DEVELOPMENT_MESSAGE } from "@/lib/productCopy";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DesktopPreview } from "@/components/sections/DesktopPreview";
import { EarlyTesterBanner } from "@/components/sections/EarlyTesterBanner";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";
import { WorksOnPlatforms } from "@/components/sections/digital/WorksOnPlatforms";

export const metadata = {
  title: "Digital Version — Voxlate | Breaking Language Barriers",
  description:
    "Voxlate Digital is being built to bring real-time AI voice translation to your meetings, calls and remote collaboration — speak naturally, hear every language.",
  openGraph: {
    title: "Digital Version — Voxlate | Breaking Language Barriers",
    description:
      "Voxlate Digital is being built to bring real-time AI voice translation to your meetings, calls and remote collaboration — speak naturally, hear every language.",
    type: "website",
  },
};

const SETUP = [
  { title: "Choose devices and languages", body: "Pick your real microphone and headphones, then set My language and Meeting language." },
  { title: "Select Voxlate in the meeting app", body: "In Zoom, Meet or Teams audio settings, choose Voxlate Microphone and Voxlate Speaker." },
  { title: "Start a supported session", body: "Start translation for a supported language pair. You speak in yours; the meeting hears theirs." },
];

const USE_CASES = [
  {
    label: "Business Meeting",
    photo: "/images/use-case-business.png",
    alt: "Business meeting use case",
    caption: "You speak in their language. They speak theirs. Close deals without language barriers.",
  },
  {
    label: "Freelancer & Client",
    photo: "/images/use-case-freelancer.png",
    alt: "Freelancer and client use case",
    caption: "Work with global clients comfortably. Clear communication, better results.",
  },
  {
    label: "HR & Candidate Interview",
    photo: "/images/use-case-interview.png",
    alt: "HR and candidate interview use case",
    caption: "Interview in your language. Candidate answers in theirs. Fair evaluation, no misunderstanding.",
  },
  {
    label: "Student & Teacher",
    photo: "/images/use-case-student.png",
    alt: "Student and teacher use case",
    caption: "Learn in your language, teacher teaches in theirs. Better understanding, better learning.",
  },
];

// Original six features with status (REDESIGN_CONTENT_MAP.md C17–C20).
const FEATURES = [
  { label: "Real-time AI Translation", status: "Core of the product in development" },
  { label: "Voice & Tone Preserved", status: "In development — generic voice first; using your own voice will be optional" },
  { label: "100+ Supported Languages", status: "Long-term goal — Hindi ↔ English pilot first" },
  { label: "Secure & Private", status: "Design goal" },
  { label: "Lightweight & Easy to Use", status: "Design goal" },
  { label: "Works in Background", status: "Planned — runs from the system tray with pause, mute and quit" },
];

const PRIVACY_POINTS = [
  "Background translation while a session is running (planned)",
  "Designed to preserve your original voice, tone & emotion",
  "Security and privacy are design goals",
];

export default function DigitalVersionPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section aria-labelledby="digital-title" className="pb-14 pt-14 md:pb-20 md:pt-20">
          <div className="page-container grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div>
              <p className="eyebrow">Digital Version</p>
              <h1 id="digital-title" className="display-page mt-5">
                One Meeting. <em className="italic">Every Language.</em>
              </h1>
              <p className="mt-4 text-[14px] text-slate">
                {DEVELOPMENT_MESSAGE}
              </p>
              <div className="mt-6 max-w-[56ch] space-y-3 text-[17px] leading-relaxed text-slate">
                <p>Voxlate Digital is real-time AI translation software we&apos;re developing for online meetings, calls and remote collaboration.</p>
                <p>
                  Speak naturally in your own language and hear others in yours — in real time, designed to preserve your
                  original voice and tone.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <WaitlistButton source="digital-hero" label="Join Waitlist" wide />
                <UnderlineLink href="/demo" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
                  View Our Demo
                </UnderlineLink>
              </div>
              <p className="mt-5 text-[14px] text-slate">
                Join the waitlist today and get a chance to become one of our early product testers.
              </p>
            </div>
            <DesktopPreview />
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" className="border-t border-line bg-surface py-16 md:py-24">
          <div className="page-container">
            <p className="eyebrow">How It Works</p>
            <h2 id="how-title" className="display-section mt-4">Real-time Translation Between Two People</h2>
            <figure className="mt-10">
              <Image
                src="/images/digital-how-it-works.png"
                alt="Person 1 on laptop 1 speaks Hindi and Person 2 on laptop 2 speaks English; Voxlate software (meeting version) translates between them in the background. Both speak in their own language and hear in their own language."
                width={3832}
                height={1120}
                sizes="(max-width: 1200px) 100vw, 1104px"
                className="h-auto w-full rounded-[6px] border border-line"
              />
              <figcaption className="mt-3 text-[13px] text-slate">Concept illustration of the meeting version.</figcaption>
            </figure>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-[6px] border-2 border-primary p-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">You → meeting</p>
                <p className="mt-3 text-[17px] leading-relaxed text-ink">
                  You speak Hindi; the meeting hears English through Voxlate Microphone.
                </p>
              </div>
              <div className="rounded-[6px] border border-line-strong p-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">Meeting → you</p>
                <p className="mt-3 text-[17px] leading-relaxed text-ink">
                  Others speak English; you hear Hindi from Voxlate Speaker on your own headphones.
                </p>
              </div>
            </div>
            <div className="mt-12">
              <p className="text-[13px] font-medium text-slate">Planned setup</p>
              <ol className="mt-4 grid gap-8 md:grid-cols-3">
                {SETUP.map((step, i) => (
                  <li key={step.title} className="border-t border-ink pt-4">
                    <span className="font-display text-[32px] leading-none text-primary">{i + 1}</span>
                    <h3 className="mt-3 text-[17px] font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-slate">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section aria-labelledby="uses-title" className="py-16 md:py-24">
          <div className="page-container">
            <h2 id="uses-title" className="display-section">Use Cases</h2>
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {USE_CASES.map((u) => (
                <li key={u.label} className="grid gap-3 py-6 sm:grid-cols-[minmax(180px,0.8fr)_1.4fr] sm:gap-10">
                  <h3 className="text-[16px] font-medium text-ink">{u.label}</h3>
                  <p className="max-w-[65ch] text-[16px] leading-relaxed text-slate">{u.caption}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Works on all major platforms */}
        <WorksOnPlatforms />

        {/* Built for every professional need */}
        <section id="features" aria-labelledby="features-title" className="border-t border-line py-16 md:py-24">
          <div className="page-container grid gap-10 md:grid-cols-[1fr_1.5fr] md:gap-16">
            <div>
              <h2 id="features-title" className="display-section">Built for Every Professional Need</h2>
              <p className="mt-4 text-[15px] text-slate">Each item shows where it stands today.</p>
            </div>
            <dl className="divide-y divide-line border-y border-line">
              {FEATURES.map((f) => (
                <div key={f.label} className="grid gap-1 py-4 sm:grid-cols-[1fr_1.3fr] sm:gap-6">
                  <dt className="text-[17px] font-medium text-ink">{f.label}</dt>
                  <dd className="text-[15px] text-slate">{f.status}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Privacy */}
        <section aria-labelledby="privacy-title" className="border-t border-line py-16 md:py-24">
          <div className="page-container grid gap-10 md:grid-cols-[1fr_1.5fr] md:gap-16">
            <div>
              <h2 id="privacy-title" className="display-section">Totally Natural. Private by Design.</h2>
            </div>
            <div>
              <p className="text-[18px] leading-relaxed text-ink">
                Voxlate is being designed to work alongside the meeting apps you already use.
              </p>
              <ul className="mt-6 space-y-3 text-[16px] text-slate">
                {PRIVACY_POINTS.map((p) => (
                  <li key={p} className="border-l-2 border-primary pl-4">{p}</li>
                ))}
              </ul>
              <p className="mt-6 text-[15px] text-slate">
                Using your own voice will be a separate, optional setup step. For how account and demo data is handled
                today, read the <UnderlineLink href="/privacy" variant="center">Privacy Policy</UnderlineLink>.
              </p>
            </div>
          </div>
        </section>

        <EarlyTesterBanner source="digital-tester-banner" />
      </main>
      <Footer />
    </>
  );
}
