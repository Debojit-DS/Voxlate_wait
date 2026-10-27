"use client";

import { motion, type Variants } from "framer-motion";
import { DemoHeader, DemoHero, InfoBanner, InfoStrip, FeatureIconsRow, DemoFooter } from "@/components/sections/digital/DemoExperience";
import { DemoCard } from "@/components/sections/digital/DemoCard";
import { ReviewBanner } from "@/components/sections/digital/ReviewBanner";

const pageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.8,
      ease: "easeOut" as const,
    },
  },
};

export default function DemoPageClient() {
  return (
    <motion.div
      className="demo-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <DemoHeader />
      <main>
        <DemoHero />
        <InfoBanner />
        <InfoStrip />
        <DemoCard />
        <ReviewBanner />
        <FeatureIconsRow />
      </main>
      <DemoFooter />
    </motion.div>
  );
}
