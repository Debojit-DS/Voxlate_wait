"use client";

import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";

export function EarlyTesterBanner() {
  const { openModal } = useWaitlistModal();

  return (
    <section className="bg-bg-page pb-10 md:pb-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="rounded-card bg-bg-surface-alt border border-border p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt text-text-primary">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-text-primary">Be an Early Tester</h3>
                <p className="mt-2 text-sm md:text-base text-text-secondary max-w-lg">
                  Join the waitlist and selected users will receive early product testing access before the official launch.
                </p>
              </div>
            </div>
            <div className="md:self-center">
              <Button variant="primary-orange" onClick={() => openModal("physical-version-banner")} icon={ArrowRight}>
                Join Waitlist Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
