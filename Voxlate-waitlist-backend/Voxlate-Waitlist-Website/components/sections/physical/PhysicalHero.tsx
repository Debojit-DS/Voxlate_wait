"use client";

import { ArrowRight, Gift, Headphones, Globe, AudioLines, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";

export function PhysicalHero() {
  const { openWaitlist } = useGatedWaitlist();

  return (
    <section className="bg-bg-page pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-4 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Headphones size={16} className="text-text-muted" />
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Physical Version
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              <span className="block text-text-primary">Real World.</span>
              <span className="block text-headline-accent-blue">Real Conversations.</span>
            </h1>
            <div className="space-y-4">
              <p className="text-base text-text-secondary">
                Voxlate Physical is a wearable translation device that lets you{" "}
                <span className="font-semibold text-text-secondary">
                  hear and speak in your own language — in real time.
                </span>
              </p>
              <p className="text-base text-text-secondary">
                Designed for face-to-face communication in the real world. No apps. No typing. Just natural conversations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary-orange" onClick={() => openWaitlist("physical-version-hero")} icon={ArrowRight}>
                Join Waitlist
              </Button>
            </div>
            <p className="flex items-center gap-2 text-text-muted text-sm">
              <Gift size={16} />
              Join the waitlist today and get a chance to become one of our early product testers.
            </p>
          </div>

          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[360px] aspect-[3/4]">
              <Image
                src="/images/physical/hero-device.png"
                alt="Voxlate Physical wearable translation device"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 80vw, 360px"
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-8">
            {[
              { icon: Globe, text: "Hear any language in your language in real time." },
              { icon: AudioLines, text: "Your original voice, tone & emotion are preserved." },
              { icon: Users, text: "Communicate naturally, anywhere, anytime." },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt text-text-primary">
                  <item.icon size={20} />
                </div>
                <p className="text-sm text-text-primary leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
