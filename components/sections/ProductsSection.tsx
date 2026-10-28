"use client";

import Image from "next/image";
import Link from "next/link";
import { Monitor, Users, Layers } from "lucide-react";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";

export function ProductsSection() {
  const { openWaitlist } = useGatedWaitlist();

  return (
    <section id="products" aria-labelledby="products-heading" className="border-t border-line bg-page py-12 sm:py-16 md:py-20">
      <div className="page-container">
        {/* Section Header */}
        <div className="mx-auto max-w-[800px] text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-4">
            <Layers size={14} className="text-primary shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
              THE VOXLATE ECOSYSTEM
            </span>
          </div>
          <h2 id="products-heading" className="font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight">
            Two Ways to Connect. One Shared Language.
          </h2>
          <p className="mt-3 text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate max-w-[64ch] mx-auto">
            From virtual meetings to face-to-face conversations, Voxlate helps you communicate naturally across language barriers.
          </p>
        </div>

        {/* 2-Column Product Cards */}
        <div className="mx-auto max-w-[1020px] grid gap-5 lg:grid-cols-2 lg:gap-6 items-stretch">
          {/* Card 1: Digital Version */}
          <div className="flex flex-col justify-between rounded-[20px] sm:rounded-[24px] border border-line bg-surface p-5 sm:p-6 md:p-7 shadow-xs hover:shadow-[0_8px_24px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 text-ink">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mist text-primary">
                  <Monitor size={13} aria-hidden />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
                  DIGITAL VERSION
                </span>
              </div>

              {/* Title */}
              <h3 className="mt-3 font-display text-[22px] sm:text-[25px] md:text-[28px] font-bold leading-snug text-ink">
                One Meeting. Every Language.
              </h3>

              {/* Sub-heading */}
              <p className="mt-2 text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate max-w-[46ch]">
                Perfect for freelancers, IT companies, BPOs, online meetings and global teams.
              </p>

              {/* Full-width Image below sub-heading */}
              <div className="relative my-4 sm:my-5 aspect-[16/9] w-full overflow-hidden rounded-[14px] border border-line/60 shadow-xs">
                <Image
                  src="/images/product-digital.png"
                  alt="Voxlate Digital version software preview on laptop"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-auto pt-1">
              <Link
                href="/digital-version"
                className="flex h-10 sm:h-[42px] items-center justify-center rounded-[8px] border border-line bg-mist/70 px-3 text-[13.5px] sm:text-[14px] font-medium text-ink transition-all hover:bg-mist hover:border-line-strong text-center"
              >
                See Details
              </Link>
              <button
                type="button"
                onClick={() => openWaitlist("product-digital")}
                className="flex h-10 sm:h-[42px] items-center justify-center rounded-[8px] bg-primary px-3 text-[13.5px] sm:text-[14px] font-medium text-white shadow-xs transition-all hover:bg-primary-hover text-center cursor-pointer"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Card 2: Physical Version */}
          <div className="flex flex-col justify-between rounded-[20px] sm:rounded-[24px] border border-line bg-surface p-5 sm:p-6 md:p-7 shadow-xs hover:shadow-[0_8px_24px_rgba(24,43,58,0.06)] transition-all duration-300">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 text-ink">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mist text-primary">
                  <Users size={13} aria-hidden />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
                  PHYSICAL VERSION
                </span>
              </div>

              {/* Title */}
              <h3 className="mt-3 font-display text-[22px] sm:text-[25px] md:text-[28px] font-bold leading-snug text-ink">
                Real Conversations. No Language Barrier.
              </h3>

              {/* Sub-heading */}
              <p className="mt-2 text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate max-w-[46ch]">
                Designed for tourists, classrooms, seminars and face-to-face communication.
              </p>

              {/* Full-width Image below sub-heading */}
              <div className="relative my-4 sm:my-5 aspect-[16/9] w-full overflow-hidden rounded-[14px] border border-line/60 shadow-xs">
                <Image
                  src="/images/product-physical.png"
                  alt="In-person meeting with Voxlate Physical"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-auto pt-1">
              <Link
                href="/physical-version"
                className="flex h-10 sm:h-[42px] items-center justify-center rounded-[8px] border border-line bg-mist/70 px-3 text-[13.5px] sm:text-[14px] font-medium text-ink transition-all hover:bg-mist hover:border-line-strong text-center"
              >
                See Details
              </Link>
              <button
                type="button"
                onClick={() => openWaitlist("product-physical")}
                className="flex h-10 sm:h-[42px] items-center justify-center rounded-[8px] bg-primary px-3 text-[13.5px] sm:text-[14px] font-medium text-white shadow-xs transition-all hover:bg-primary-hover text-center cursor-pointer"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductsSection;
