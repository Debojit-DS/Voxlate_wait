import Image from "next/image";
import { Headphones, WifiOff, Battery, Feather, Lock, Globe, Share2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const FEATURES = [
  { icon: Headphones, label: "Real-time\nTranslation" },
  { icon: WifiOff, label: "Works Offline\n(Edge Processing)" },
  { icon: Battery, label: "Long Battery\nLife" },
  { icon: Feather, label: "Lightweight\n& Comfortable" },
  { icon: Lock, label: "Secure\n& Private" },
  { icon: Globe, label: "Multi-Language\nSupport" },
  { icon: Share2, label: "One Device,\nMany Possibilities" },
];

const SPECS = [
  { label: "Battery Life", value: "Up to 8 Hours" },
  { label: "Standby Time", value: "Up to 48 Hours" },
  { label: "Charging Case", value: "Portable & Magnetic" },
  { label: "Connectivity", value: "Bluetooth 5.3" },
  { label: "Range", value: "Up to 10 Meters" },
  { label: "Weight", value: "Ultra Light" },
];

export function WhyChoosePhysical() {
  return (
    <section className="bg-bg-page py-10 md:py-12 overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <SectionHeading label="WHY CHOOSE VOXLATE PHYSICAL?" />

        <div className="mt-8 md:mt-10 rounded-2xl border border-border bg-bg-surface-alt/90 p-5 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex flex-col items-center text-center rounded-2xl border border-border bg-bg-surface/95 p-3 md:p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center">
                      <feature.icon size={22} className="text-text-primary" strokeWidth={1.5} />
                    </div>
                    <p className="mt-2 text-xs md:text-sm font-bold text-text-primary leading-snug whitespace-pre-line">
                      {feature.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center gap-5 lg:gap-6">
              <Image
                src="/images/physical/device-case.png"
                alt="Voxlate Physical device coiled inside its open charging case"
                width={180}
                height={180}
                className="w-24 h-24 md:w-32 md:h-32 object-contain shrink-0"
              />
              <div className="space-y-2">
                {SPECS.map((spec) => (
                  <div key={spec.label} className="flex items-baseline gap-2 whitespace-nowrap">
                    <span className="text-xs font-bold text-text-primary">{spec.label}:</span>
                    <span className="text-xs text-text-secondary">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
