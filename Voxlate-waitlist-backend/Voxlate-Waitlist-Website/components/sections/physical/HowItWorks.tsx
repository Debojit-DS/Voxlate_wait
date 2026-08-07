import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  { src: "/images/physical/how-it-works/wear-device.png", label: "Wear Voxlate\nDevice", alt: "Wear Voxlate Device" },
  { src: "/images/physical/how-it-works/choose-language.png", label: "Choose Your\nLanguage", alt: "Choose Your Language" },
  { src: "/images/physical/how-it-works/talk-naturally.png", label: "Talk\nNaturally", alt: "Talk Naturally" },
  { src: "/images/physical/how-it-works/hear-translation.png", label: "Hear Translation\nInstantly", alt: "Hear Translation Instantly" },
];

export function HowItWorks() {
  return (
    <section className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <SectionHeading label="HOW IT WORKS" />
        
        <div className="mt-4 md:mt-6 flex flex-col lg:flex-row lg:items-start gap-8">
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
            {STEPS.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-2xl border border-border bg-bg-surface shadow-sm">
                    <Image
                      src={step.src}
                      alt={step.alt}
                      width={80}
                      height={80}
                      className="h-16 w-16 md:h-20 md:w-20 object-contain"
                    />
                  </div>
                  <p className="mt-3 text-xs md:text-sm font-bold text-text-primary leading-tight whitespace-pre-line text-center">
                    {step.label}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:flex items-center justify-center px-2 lg:px-4">
                    <ArrowRight size={24} className="text-text-muted" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="w-full lg:w-80 xl:w-96 rounded-2xl border border-border bg-bg-surface-alt p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg-surface">
                <ShieldCheck size={20} className="text-text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary leading-snug">
                  Sunne waale ko pata bhi nahi chalega ki aapko unki language aati bhi hai ya nahi.
                </p>
                <p className="mt-2 text-xs text-text-muted">Conversations feel natural and effortless.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
