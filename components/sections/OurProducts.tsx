"use client";

import { Monitor, Users } from "lucide-react";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { useDemoTransition } from "@/components/transitions/useDemoTransition";
import { ProductCard } from "@/components/ui/ProductCard";

export function OurProducts() {
  const { openWaitlist } = useGatedWaitlist();
  const { goToDemo } = useDemoTransition();

  return (
    <section id="products" className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange mb-3">Our Products</p>
          <h2 className="text-3xl font-bold text-text-primary md:text-4xl">Our Products</h2>
        </div>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          <ProductCard
            eyebrow="Digital Version"
            eyebrowIcon={Monitor}
            title="One Meeting. Every Language."
            description="Perfect for freelancers, IT companies, BPOs, online meetings and global teams."
            imageSrc="/images/product-digital.png"
            imageAlt="Digital version laptop mockup"
            detailsHref="/digital-version"
            onJoinWaitlist={() => openWaitlist("digital-card")}
            onViewDemo={goToDemo}
          />
          <ProductCard
            eyebrow="Physical Version"
            eyebrowIcon={Users}
            title="Real Conversations. No Language Barrier."
            description="Designed for tourists, classrooms, seminars and face-to-face communication."
            imageSrc="/images/product-physical.png"
            imageAlt="Physical version people meeting"
            detailsHref="/physical-version"
            onJoinWaitlist={() => openWaitlist("physical-card")}
          />
        </div>
      </div>
    </section>
  );
}
