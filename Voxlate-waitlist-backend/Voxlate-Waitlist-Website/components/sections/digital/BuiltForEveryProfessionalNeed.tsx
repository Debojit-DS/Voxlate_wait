import { Zap, AudioWaveform, Globe, ShieldCheck, Pin, Paperclip } from "lucide-react";

const ITEMS = [
  { icon: Zap, label: "Real-time AI Translation" },
  { icon: AudioWaveform, label: "Voice & Tone Preserved" },
  { icon: Globe, label: "100+ Supported Languages" },
  { icon: ShieldCheck, label: "Secure & Private" },
  { icon: Pin, label: "Lightweight & Easy to Use" },
  { icon: Paperclip, label: "Works in Background" },
];

export function BuiltForEveryProfessionalNeed() {
  return (
    <section className="bg-bg-page pb-10 md:pb-12">
      <div className="mx-auto max-w-[1500px] px-6 md:px-8">
        <div className="relative rounded-card bg-surface shadow-sm border border-border px-8 py-8 md:px-12 md:py-10">
          <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface px-4 text-center text-lg md:text-xl font-bold text-text-primary whitespace-nowrap">
            BUILT FOR EVERY PROFESSIONAL NEED
          </h2>
          <div className="flex flex-nowrap items-center justify-center gap-4 md:gap-6">
            {ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon size={22} className="text-text-primary" />
                <span className="text-sm md:text-base font-medium text-text-primary whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
