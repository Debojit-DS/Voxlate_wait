import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact — Voxlate",
  description: "Talk to the Voxlate team: for your team or freelance work, or to invest in natural, voice-preserving translation.",
};

const PATHS = [
  {
    title: "Customers and freelancers",
    body: "Running calls across languages, or working with clients who speak another one? Tell us how you’d use Voxlate and we’ll show you where it’s heading.",
  },
  {
    title: "Investors",
    body: "We’re building translation that keeps a person’s voice, tone and intent. If that’s a future you want to back, the founders would like to hear from you.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="page-container grid gap-14 pb-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:pb-32">
        <div className="vx-page-head lg:sticky lg:top-24 lg:self-start">
          <p className="vx-label">Contact</p>
          <h1 className="vx-display mt-4 text-[clamp(3rem,7vw,5.5rem)] text-ink">
            Let’s talk.
          </h1>
          <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed text-slate">
            Messages here go straight to the founding team, not a ticket queue.
          </p>
          <div className="mt-10 space-y-7 border-t border-line pt-8">
            {PATHS.map((p, i) => (
              <div key={p.title} className="grid grid-cols-[28px_1fr] gap-x-3">
                <span className="vx-label pt-0.5 text-ink">0{i + 1}</span>
                <div>
                  <h2 className="text-[17px] font-semibold text-ink">{p.title}</h2>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[15px] text-slate">
            Prefer email?{" "}
            <a href="mailto:voxlatesn@gmail.com" className="vx-link">
              voxlatesn@gmail.com
            </a>
          </p>
        </div>

        <div className="lg:pt-[clamp(48px,9vh,96px)]">
          <Suspense fallback={<div className="h-[640px]" aria-hidden="true" />}>
            <ContactForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
