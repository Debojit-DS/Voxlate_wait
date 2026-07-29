"use client";

import { Rocket, Gift, Bell, Award, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";

const PERKS = [
  { icon: Rocket, label: "Early Access" },
  { icon: Gift, label: "Free Product Testing", sub: "(Selected Users)" },
  { icon: Bell, label: "Priority Updates" },
  { icon: Award, label: "Founding Community Badge" },
];

export function EarlyTesterBanner({ source = "tester-banner" }: { source?: string }) {
  const { openModal } = useWaitlistModal();

  return (
    <section className="bg-bg-page pb-10 md:pb-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="rounded-card bg-bg-surface-alt p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-cta text-white">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Become an Early Tester</h3>
                <p className="mt-2 text-text-secondary text-sm md:text-base max-w-md">
                  Join today and selected users will receive early product testing access before the official public release.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 md:gap-8">
              {PERKS.map((perk) => (
                <div key={perk.label} className="flex flex-col items-center text-center">
                  <perk.icon size={28} className="text-navy-cta mb-2" strokeWidth={1.5} />
                  <p className="text-xs font-medium text-text-primary leading-tight">{perk.label}</p>
                  {perk.sub && <p className="text-[10px] text-text-muted leading-tight mt-0.5">{perk.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="primary-orange" onClick={() => openModal(source)} icon={ArrowRight}>
              Join Waitlist Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
