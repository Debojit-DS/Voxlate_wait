import Image from "next/image";
import { RadioTower } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EarlyTesterBanner } from "@/components/sections/EarlyTesterBanner";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Voxlate Physical — Real World. Real Conversations.",
  description:
    "Voxlate Physical is a wearable translation device in development, designed to let you hear and speak in your own language, in real time. No apps, no typing — just natural conversations.",
  openGraph: {
    title: "Voxlate Physical — Real World. Real Conversations.",
    description:
      "Voxlate Physical is a wearable translation device in development, designed to let you hear and speak in your own language, in real time. No apps, no typing — just natural conversations.",
    type: "website",
  },
};



const STEPS = ["Wear Voxlate Device", "Choose Your Language", "Talk Naturally", "Hear Translation"];

const MODES = [
  {
    name: "P2E — Person to Environment",
    badge: "Auto-connect within 2 m",
    image: { src: "/images/physical/modes/p2e.png", alt: "Illustration: two people wearing Voxlate devices talking within about two metres", w: 2582, h: 1664 },
    intro: "Perfect for dynamic, one-to-one or small group conversations in daily life.",
    items: [
      "Auto-connects to any Voxlate device within 2 meters",
      "No manual pairing required",
      "Ideal for tourists, shopping, offices, campuses & casual conversations",
    ],
  },
  {
    name: "P2P — Person to Person",
    badge: "Connect 2 to 200 people",
    image: { src: "/images/physical/modes/p2p.png", alt: "Illustration: a presenter connected to several listeners wearing Voxlate devices", w: 2468, h: 1696 },
    intro: "Designed for structured group communication like classrooms, seminars & events.",
    items: [
      "Connect 2 to 200 participants at once",
      "Everyone hears in their own preferred language",
      "Ask questions, reply and understand everyone in real time",
    ],
  },
];

const FEATURES = [
  { label: "Real-time Translation" },
  { label: "Works Offline (Edge Processing)" },
  { label: "Long Battery Life" },
  { label: "Lightweight & Comfortable" },
  { label: "Secure & Private", note: "design goal" },
  { label: "Multi-Language Support" },
  { label: "One Device, Many Possibilities" },
];

const SPECS = [
  { label: "Battery Life", value: "Up to 8 Hours" },
  { label: "Standby Time", value: "Up to 48 Hours" },
  { label: "Charging Case", value: "Portable & Magnetic" },
  { label: "Connectivity", value: "Bluetooth 5.3" },
  { label: "Range", value: "Up to 10 Meters" },
  { label: "Weight", value: "Ultra Light" },
];

export default function PhysicalVersionPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section aria-labelledby="physical-title" className="pt-10 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24">
          <div className="page-container grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 xl:gap-14">
            <div>
              <p className="eyebrow text-[12px] sm:text-[13px] tracking-[0.16em]">Physical Version</p>
              <h1 id="physical-title" className="font-display text-[40px] sm:text-[46px] md:text-[52px] leading-[1.08] text-ink font-normal tracking-tight mt-3 sm:mt-4">
                Real World. <em className="italic">Real Conversations.</em>
              </h1>
              <div className="mt-4 sm:mt-5 max-w-[50ch] space-y-3.5 text-[16px] sm:text-[17px] leading-relaxed text-slate">
                <p>
                  Voxlate Physical is a wearable translation device in development that helps you hear and speak in your own language, in real time. Designed for face-to-face conversations in the real world.
                </p>
                <p>
                  It lets you communicate naturally across languages without apps or typing. With a focus on preserving voice, tone, and emotion, Voxlate aims to make every conversation feel effortless, wherever you go.
                </p>
              </div>

              {/* Two Action Buttons in a Row */}
              <div className="mt-7 sm:mt-8 flex flex-row items-center gap-3.5 sm:gap-4">
                <WaitlistButton source="physical-version-hero" label="Join Waitlist" />
                <Button href="/demo" variant="secondary">
                  View Demo
                </Button>
              </div>
            </div>

            {/* Product Image */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[340px] sm:max-w-[370px] lg:max-w-[390px] overflow-hidden rounded-[20px] sm:rounded-[24px] border border-line bg-[#EEF4FA] p-6 sm:p-7 shadow-sm transition-transform duration-300 hover:scale-[1.01]">
                <Image
                  src="/images/physical/hero-device.png"
                  alt="Concept rendering of the Voxlate Physical wearable translation device"
                  width={2048}
                  height={2062}
                  priority
                  sizes="(max-width: 1024px) 100vw, 390px"
                  className="h-auto w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" className="border-t border-line bg-surface py-16 md:py-24">
          <div className="page-container">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 id="how-title" className="display-section">How It Works</h2>
              <p className="text-[14px] text-slate">Proposed interaction · not yet built</p>
            </div>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
              <ol className="grid gap-px overflow-hidden rounded-[8px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((step, i) => (
                  <li key={step} className="bg-surface p-5">
                    <span className="font-display text-[34px] leading-none text-primary">{i + 1}</span>
                    <p className="mt-3 text-[16px] font-semibold leading-snug text-ink">{step}</p>
                  </li>
                ))}
              </ol>
              <blockquote className="border-l-2 border-primary pl-5">
                <p lang="hi-Latn" className="font-display text-[22px] leading-snug text-ink">
                  “Sunne waale ko pata bhi nahi chalega ki aapko unki language aati bhi hai ya nahi.”
                </p>
                <p className="mt-3 text-[14px] text-slate">The goal: conversations that feel natural and effortless.</p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Communication modes */}
        <section aria-labelledby="modes-title" className="border-t border-line bg-mist/60 py-16 md:py-24">
          <div className="page-container">
            {/* Section Header */}
            <div className="mx-auto max-w-[800px] text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-4">
                <RadioTower size={14} className="text-primary shrink-0" aria-hidden="true" />
                <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
                  COMMUNICATION MODES
                </span>
              </div>
              <h2 id="modes-title" className="font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight">
                One Device. Every Conversation.
              </h2>
              <p className="mt-3 text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate max-w-[64ch] mx-auto">
                From one-to-one conversations to large group settings, Voxlate Physical is designed to help people communicate naturally across language barriers.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {MODES.map((m) => (
                <article key={m.name} className="border-t border-line pt-6 sm:pt-8">
                  <h3 className="text-[19px] font-semibold text-ink">{m.name}</h3>
                  <p className="mt-1 text-[13px] text-slate">{m.badge}</p>
                  <Image
                    src={m.image.src}
                    alt={m.image.alt}
                    width={m.image.w}
                    height={m.image.h}
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="mt-5 h-auto w-full rounded-[6px] bg-mist"
                  />
                  <p className="mt-5 text-[16px] leading-relaxed text-slate">{m.intro}</p>
                  <ul className="mt-4 space-y-2 text-[15px] text-ink">
                    {m.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose */}
        <section aria-labelledby="why-title" className="py-16 md:py-24">
          <div className="page-container grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 id="why-title" className="display-section">Why Choose Voxlate Physical?</h2>
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {FEATURES.map((f) => (
                  <li key={f.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                    <span className="text-[16px] font-medium text-ink">{f.label}</span>
                    {f.note && <span className="text-[13px] text-slate">{f.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[19px] font-semibold text-ink">Specifications</h3>
              <p className="mt-2 text-[15px] text-slate">These are the specifications we are working toward as development progresses.</p>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-[15px]">
                  <thead>
                    <tr className="border-b border-ink text-[13px] text-slate">
                      <th scope="col" className="py-2 pr-4 font-medium">Topic</th>
                      <th scope="col" className="py-2 pr-4 font-medium">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {SPECS.map((s) => (
                      <tr key={s.label}>
                        <th scope="row" className="py-3 pr-4 font-medium text-ink">{s.label}</th>
                        <td className="py-3 pr-4 text-ink">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-[14px] text-slate">
                The web demo translates recorded clips in a browser; it does not demonstrate this device.
              </p>
            </div>
          </div>
        </section>

        <EarlyTesterBanner source="physical-tester-banner" />
      </main>
      <Footer />
    </>
  );
}
