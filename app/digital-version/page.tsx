import Image from "next/image";
import { Workflow } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EarlyTesterBanner } from "@/components/sections/EarlyTesterBanner";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";
import { Button } from "@/components/ui/Button";
import { WorksOnPlatforms } from "@/components/sections/digital/WorksOnPlatforms";
import { DigitalBentoGrid } from "@/components/sections/digital/DigitalBentoGrid";

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



export default function DigitalVersionPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section aria-labelledby="digital-title" className="pt-10 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24">
          <div className="page-container grid items-stretch gap-10 lg:grid-cols-[0.95fr_1.25fr] lg:gap-12 xl:gap-14">
            <div className="flex flex-col justify-between">
              <div>
                <p className="eyebrow text-[12px] sm:text-[13px] tracking-[0.16em]">Digital Version</p>
                <h1 id="digital-title" className="font-display text-[40px] sm:text-[46px] md:text-[52px] leading-[1.08] text-ink font-normal tracking-tight mt-3 sm:mt-4">
                  One Meeting. <em className="italic">Every Language.</em>
                </h1>
                <div className="mt-4 sm:mt-5 max-w-[50ch] space-y-3.5 text-[16px] sm:text-[17px] leading-relaxed text-slate">
                  <p>Voxlate Digital is real-time AI translation software we&apos;re developing for online meetings, calls and remote collaboration.</p>
                  <p>
                    Speak naturally in your own language and hear others in yours — in real time, designed to preserve your
                    original voice and tone.
                  </p>
                </div>
              </div>

              {/* Two Action Buttons in a Row */}
              <div className="mt-7 sm:mt-8 flex flex-row items-center gap-3.5 sm:gap-4">
                <WaitlistButton source="digital-hero" label="Join Waitlist" />
              </div>
            </div>

            {/* Product Image starting at heading level and ending at button height */}
            <div className="w-full h-full flex flex-col lg:pt-[28px]">
              <div className="relative w-full flex-1 min-h-[280px] sm:min-h-[340px] lg:min-h-0 overflow-hidden rounded-[20px] sm:rounded-[26px] border border-line bg-surface shadow-md transition-transform duration-300 hover:scale-[1.01]">
                <Image
                  src="/images/product-digital.png"
                  alt="Voxlate Digital version software preview on laptop"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Features & Capabilities ("Built for Every Professional Need") */}
        <DigitalBentoGrid />

        {/* How it works */}
        <section aria-labelledby="how-title" className="border-t border-line bg-surface py-16 md:py-24">
          <div className="page-container">
            {/* Section Header */}
            <div className="mx-auto max-w-[800px] text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-4">
                <Workflow size={14} className="text-primary shrink-0" aria-hidden="true" />
                <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
                  HOW IT WORKS
                </span>
              </div>
              <h2 id="how-title" className="font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight">
                Speak Naturally. Understand Instantly.
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate max-w-[64ch] mx-auto">
                Speak in your language while Voxlate translates your words in real time. Stay focused on the conversation, not the language barrier.
              </p>
            </div>
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
              <div className="rounded-[8px] border border-line bg-surface p-6 shadow-xs">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">You → meeting</p>
                <p className="mt-3 text-[17px] leading-relaxed text-ink">
                  You speak Hindi; the meeting hears English through Voxlate Microphone.
                </p>
              </div>
              <div className="rounded-[8px] border border-line bg-surface p-6 shadow-xs">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">Meeting → you</p>
                <p className="mt-3 text-[17px] leading-relaxed text-ink">
                  Others speak English; you hear Hindi from Voxlate Speaker on your own headphones.
                </p>
              </div>
            </div>
            <div className="mt-12">
              <p className="text-[13px] font-medium text-slate">Steps to follows</p>
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

        {/* Works on all major platforms */}
        <WorksOnPlatforms />

        <EarlyTesterBanner source="digital-tester-banner" />
      </main>
      <Footer />
    </>
  );
}
