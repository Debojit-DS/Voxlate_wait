import { Zap, AudioWaveform, ShieldCheck, Globe, Users } from "lucide-react";

type TrustStripItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
};

type TrustStripProps = {
  items?: TrustStripItem[];
  singleLine?: boolean;
};

const DEFAULT_ITEMS = [
  { icon: Zap, label: "Real-Time Translation" },
  { icon: AudioWaveform, label: "Original Voice Preserved" },
  { icon: ShieldCheck, label: "Secure & Private" },
  { icon: Globe, label: "100+ Languages" },
  { icon: Users, label: "Natural Conversations" },
];

export function TrustStrip({ items = DEFAULT_ITEMS, singleLine = false }: TrustStripProps) {
  return (
    <section className="bg-bg-page pb-10 md:pb-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className={`rounded-card bg-surface shadow-sm border border-border ${singleLine ? "p-5 md:p-6" : "p-6"}`}>
          <div
            className={`flex items-center justify-center ${
              singleLine ? "flex-nowrap gap-4 md:gap-6" : "flex-wrap gap-6 md:gap-10"
            }`}
          >
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon size={singleLine ? 22 : 20} className="text-text-primary" />
                <span
                  className={`font-medium text-text-primary whitespace-nowrap ${
                    singleLine ? "text-sm md:text-base" : "text-sm"
                  }`}
                >
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
