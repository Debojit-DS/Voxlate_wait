import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistGift } from "@/components/home/WaitlistGift";
import { ModeStory } from "@/components/product/ModeStory";

export const metadata = {
  title: "Physical version — Voxlate",
  description:
    "Voxlate Physical is a wearable translator in development with two modes: P2P for one-to-one conversations and P2E for lectures, tours and markets. Hear and speak in your own language, face to face.",
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

export default function PhysicalVersionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <ModeStory />

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
