"use client";

import Image from "next/image";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { useDemoTransition } from "@/components/transitions/useDemoTransition";

export function Hero() {
  const { openWaitlist } = useGatedWaitlist();
  const { goToDemo } = useDemoTransition();

  return (
    <section id="home" className="bg-bg-page pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="max-w-xl">
            <div className="mb-4">
              <h1 className="text-4xl font-bold leading-tight text-text-primary md:text-5xl">
                Breaking Language Barriers.
              </h1>
              <h2 className="mt-2 text-2xl font-bold text-text-primary md:text-3xl">
                Speak Naturally. Hear Every Language.
              </h2>
            </div>
            <p className="mt-4 text-base text-text-secondary md:text-lg">
              Real-time AI translation that preserves your original voice, tone and emotion.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary-orange" onClick={() => openWaitlist("hero")} icon={ArrowRight}>
                Join Waitlist
              </Button>
              <Button variant="primary-demo" onClick={goToDemo}>
                View Our Demo
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-text-muted">
              <Users size={16} />
              <p className="text-sm">
                Join the waitlist today and get a chance to become one of our early product testers before the official launch.
              </p>
            </div>
          </div>
          <div>
            <Image
              src="/images/hero-laptop.png"
              alt="AI translation interface on a laptop"
              width={600}
              height={400}
              className="w-full max-w-[600px] h-auto object-contain"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
