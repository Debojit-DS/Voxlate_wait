"use client";

import { ArrowRight, Gift, Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { HeroLaptopMockup } from "./HeroLaptopMockup";

export function HeroDigitalVersion() {
  const { openWaitlist } = useGatedWaitlist();

  return (
    <section className="bg-bg-page pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid gap-10 lg:gap-16 md:grid-cols-2 md:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={16} className="text-accent-blue" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-blue">
                DIGITAL VERSION
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[44px] font-bold leading-[1.15] tracking-tight">
              <span className="block text-text-primary">One Meeting.</span>
              <span className="block text-accent-blue">Every Language.</span>
            </h1>
            <div className="mt-6 space-y-3">
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                Voxlate Digital is a real-time AI translation software for online meetings, calls and remote collaboration.
              </p>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                Speak naturally in your own language and hear others in yours — in real time, with your original voice and tone preserved.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="primary-orange"
                icon={ArrowRight}
                onClick={() => openWaitlist("digital-hero")}
              >
                Join Waitlist
              </Button>
            </div>
            <div className="mt-5 flex items-center gap-2 text-text-muted text-xs">
              <Gift size={14} />
              <span>Join the waitlist today and get a chance to become one of our early product testers.</span>
            </div>
          </div>
          <HeroLaptopMockup />
        </div>
      </div>
    </section>
  );
}
