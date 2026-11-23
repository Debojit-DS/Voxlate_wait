import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CareersForm } from "@/components/careers/CareersForm";

export const metadata = {
  title: "Join our team — Voxlate",
  description: "Help build translation that keeps people's voice, tone and intent. Apply to join the Voxlate team.",
};

const TEAMS = ["Software and AI", "Hardware", "Design", "Marketing and sales", "Security"];

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="pb-24 lg:pb-32">
        <section className="page-container vx-page-head grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="vx-label">Join our team</p>
            <h1 className="vx-display mt-4 text-[clamp(3rem,7vw,5.75rem)] text-ink">
              Build translation
              <br />
              <span className="text-primary">that sounds human.</span>
            </h1>
          </div>
          <div className="space-y-5 text-[17px] leading-relaxed text-slate lg:pb-3">
            <p>
              We’re a student-founded team working on one hard problem: translating speech while keeping the speaker’s voice,
              tone and intent intact. If that sounds like your kind of problem, apply below.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Teams">
              {TEAMS.map((t) => (
                <li key={t} className="rounded-[8px] border border-line bg-surface px-3 py-1.5 text-[14px] text-ink">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <div className="page-container">
          <CareersForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
