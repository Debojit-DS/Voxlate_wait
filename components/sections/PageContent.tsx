"use client";

import Image from "next/image";
import Link from "next/link";
import { AudioLines } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { EarlyTesterBanner } from "@/components/sections/EarlyTesterBanner";
import { FAQSection } from "@/components/sections/FAQSection";

export default function PageContent() {
  return (
    <>
      <Hero />
      {/* Meet Voxlate / What is Voxlate? */}
      <section id="about" aria-labelledby="meet-title" className="border-t border-line bg-mist/60 py-14 sm:py-16 md:py-24">
        <div className="page-container">
          {/* Header matching the reference format */}
          <div className="mx-auto max-w-[800px] text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-4">
              <AudioLines size={14} className="text-primary shrink-0" aria-hidden="true" />
              <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
                MEET VOXLATE
              </span>
            </div>
            <h2 id="meet-title" className="font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight">
              One Meeting. Every Language.
            </h2>
            <p className="mt-3 text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate max-w-[64ch] mx-auto">
              Connect across languages while keeping your voice, tone, and emotion. Make every conversation feel natural, wherever you meet.
            </p>
          </div>

          {/* "What is Voxlate?" and device rendering */}
          <div className="grid items-start gap-8 md:grid-cols-[1.2fr_0.8fr] lg:gap-14">
            <div className="pt-0.5 md:pt-1">
              <h3 id="what-title" className="font-display text-[32px] sm:text-[38px] md:text-[42px] leading-tight text-ink font-bold">
                What is Voxlate?
              </h3>
              <p className="mt-3.5 max-w-[54ch] text-[18px] sm:text-[19px] md:text-[20px] leading-[1.7] text-slate">
                Voxlate is an AI-powered communication platform designed to eliminate language barriers while preserving
                the speaker&apos;s natural voice, tone, and emotions. Whether online or face-to-face, the goal is for
                conversations to feel natural without requiring anyone to learn a new language.
              </p>
              <p className="mt-4 max-w-[54ch] text-[16px] sm:text-[17px] md:text-[18px] leading-[1.65] text-slate">
                Voxlate is available across two professional form factors: an intuitive <Link href="/digital-version" className="font-semibold text-ink hover:text-primary transition-colors">software platform</Link> for seamless virtual meetings (Zoom, Teams, Google Meet), and an intelligent <Link href="/physical-version" className="font-semibold text-ink hover:text-primary transition-colors">wearable hardware device</Link> for spontaneous face-to-face conversations.
              </p>
            </div>
            <figure className="mx-auto w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px]">
              <div className="overflow-hidden rounded-[14px] border border-line/70 bg-[#EEF4FA] p-6 sm:p-7 shadow-xs">
                <Image
                  src="/images/physical/hero-device.png"
                  alt="Concept rendering of the Voxlate Physical wearable translation device"
                  width={2048}
                  height={2062}
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="h-auto w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                  priority
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* Our Products */}
      <ProductsSection />

      {/* Voices of Voxlate / Testimonials */}
      <TestimonialsSection />

      <FAQSection />
      <EarlyTesterBanner source="tester-banner" />
    </>
  );
}
