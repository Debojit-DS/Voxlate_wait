import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistGift } from "@/components/home/WaitlistGift";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";
import { EarpieceViewer } from "@/components/product/EarpieceViewer";

export const metadata = {
  title: "Physical version — Voxlate",
  description:
    "Voxlate Physical is a wearable translator in development: hear and speak in your own language, face to face, in your own voice. No apps, no typing.",
  openGraph: {
    title: "Physical version — Voxlate",
    description: "A wearable translator for natural, face-to-face conversations.",
    type: "website",
  },
};

const STEPS = [
  { title: "Wear it", body: "Hook the earpiece on; the soft ear gel holds it in place." },
  { title: "Choose your language", body: "Set the language you want to hear and speak once." },
  { title: "Talk naturally", body: "Speak the way you normally would. No app to open, nothing to type." },
  { title: "Hear the reply in yours", body: "The other person’s words reach you in your language, in their voice." },
];

const SPECS = [
  ["Battery life", "Up to 8 hours"],
  ["Standby", "Up to 48 hours"],
  ["Charging case", "Portable and magnetic"],
  ["Connectivity", "Bluetooth 5.3"],
  ["Range", "Up to 10 metres"],
  ["Weight", "Ultra light"],
];

function PersonToPerson() {
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" role="img" aria-label="Two people with Voxlate earpieces, about two metres apart">
      <line x1="70" y1="80" x2="250" y2="80" stroke="var(--color-line-strong)" strokeDasharray="4 6" />
      <text x="160" y="68" textAnchor="middle" className="fill-ink text-[15px] font-semibold">≤ 2 m</text>
      <text x="160" y="106" textAnchor="middle" className="fill-slate text-[12px]">auto-connect</text>
      {[70, 250].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="80" r="30" fill={i ? "var(--color-primary)" : "var(--color-ink)"} />
          <text x={x} y="85" textAnchor="middle" className="fill-white text-[13px] font-semibold">{i ? "EN" : "हिं"}</text>
        </g>
      ))}
    </svg>
  );
}

function OneToMany() {
  const listeners = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (0.15 + (0.7 * i) / 8);
    return { x: 160 + Math.cos(a) * 125, y: 40 + Math.sin(a) * 105 };
  });
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" role="img" aria-label="One speaker connected to a group of listeners">
      {listeners.map((p, i) => (
        <line key={i} x1="160" y1="40" x2={p.x} y2={p.y} stroke="var(--color-line-strong)" strokeDasharray="3 5" />
      ))}
      {listeners.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="10" fill={i % 3 === 0 ? "var(--color-primary)" : i % 3 === 1 ? "var(--color-slate)" : "var(--color-ink)"} />
      ))}
      <circle cx="160" cy="40" r="22" fill="var(--color-ink)" />
      <text x="160" y="45" textAnchor="middle" className="fill-white text-[11px] font-semibold">talk</text>
    </svg>
  );
}

const MODES = [
  {
    code: "P2E",
    name: "Person to environment",
    badge: "Auto-connects within 2 m",
    intro: "For one-to-one or small group conversations in daily life.",
    points: ["Connects to any Voxlate device within 2 metres", "No manual pairing", "Travel, shopping, offices, campuses and casual chats"],
    art: <PersonToPerson />,
  },
  {
    code: "P2P",
    name: "Person to people",
    badge: "2 to 200 people",
    intro: "For structured group communication like classrooms, seminars and events.",
    points: ["Connect 2 to 200 participants at once", "Everyone hears in their own preferred language", "Ask, reply and understand everyone in real time"],
    art: <OneToMany />,
  },
];

export default function PhysicalVersionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <section aria-labelledby="physical-title" className="page-container vx-page-head grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="vx-label">Physical version · in development</p>
            <h1 id="physical-title" className="vx-display mt-4 text-[clamp(2.8rem,6vw,5rem)] text-ink">
              Real world.
              <br />
              <span className="text-primary">Real conversations.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-slate">
              A wearable translator that lets you hear and speak in your own language, face to face and in real time. No app, no
              typing, and the other person still sounds like themselves.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <WaitlistButton source="physical-version-hero" label="Join the Waitlist" />
              <Link href="/demo" className="vx-link">
                Try the web demo <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
          <div>
            <EarpieceViewer className="aspect-[4/5] w-full max-h-[620px] sm:aspect-square lg:aspect-[4/5]" />
            <p className="mt-2 text-[13px] text-slate">The current prototype design. Drag to turn it.</p>
          </div>
        </section>

        <section aria-labelledby="how-title" className="border-t border-line">
          <div className="page-container py-16 lg:py-24">
            <h2 id="how-title" className="vx-display text-[clamp(2rem,3.8vw,3.25rem)] text-ink">
              How it works
            </h2>
            <ol className="mt-10 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`py-8 sm:pr-8 ${i > 0 ? "border-t border-line sm:border-t-0" : ""} ${i % 2 ? "sm:border-l sm:pl-8" : ""} ${i === 2 ? "lg:border-l lg:pl-8" : ""}`}>
                  <span className="vx-display text-[48px] leading-none text-line-strong">{i + 1}</span>
                  <h3 className="mt-5 text-[18px] font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="modes-title" className="bg-surface">
          <div className="page-container py-16 lg:py-24">
            <h2 id="modes-title" className="vx-display max-w-[18ch] text-[clamp(2rem,3.8vw,3.25rem)] text-ink">
              One device, two ways to talk.
            </h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {MODES.map((m) => (
                <article key={m.code} className="rounded-[14px] border border-line bg-page p-6 sm:p-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="vx-display text-[26px] text-ink">
                      {m.code} <span className="text-slate">· {m.name}</span>
                    </h3>
                    <span className="rounded-[6px] bg-ink px-2 py-1 text-[12px] font-medium text-white">{m.badge}</span>
                  </div>
                  <div className="my-8">{m.art}</div>
                  <p className="text-[16px] text-ink">{m.intro}</p>
                  <ul className="mt-4 space-y-2 text-[15px] text-slate">
                    {m.points.map((p) => (
                      <li key={p} className="flex gap-3">
                        <span aria-hidden="true" className="mt-2.5 h-1 w-3 shrink-0 bg-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="specs-title" className="page-container grid gap-8 py-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:py-24">
          <div>
            <h2 id="specs-title" className="vx-display text-[clamp(2rem,3.8vw,3.25rem)] text-ink">
              Target specs
            </h2>
            <p className="mt-3 text-[15px] text-slate">What we’re designing for. Subject to hardware testing.</p>
          </div>
          <dl className="grid border-t border-line sm:grid-cols-2">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-4 sm:pr-8 sm:even:border-l sm:even:pl-8 sm:even:pr-0">
                <dt className="text-[15px] text-slate">{k}</dt>
                <dd className="text-[16px] font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <WaitlistGift />
      </main>
      <Footer />
    </div>
  );
}
