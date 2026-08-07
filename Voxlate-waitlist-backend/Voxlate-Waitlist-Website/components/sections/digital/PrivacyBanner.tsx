import { ShieldCheck, Check } from "lucide-react";

const CHECKLIST = [
  "Background translation always active",
  "Your original voice, tone & emotion preserved",
  "Secure, encrypted and 100% private",
];

export function PrivacyBanner() {
  return (
    <section className="bg-bg-page pb-10 md:pb-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="bg-bg-surface-alt rounded-card border border-border p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <ShieldCheck size={32} className="text-accent-blue shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Totally Natural. 100% Private.
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Some conversations don&apos;t need extra tools — no plugins, no bots, no setup required.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {CHECKLIST.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check size={16} className="text-success shrink-0" />
                  <span className="text-xs text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
