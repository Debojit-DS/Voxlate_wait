import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhatIsVoxlate } from "@/components/sections/WhatIsVoxlate";
import { OurProducts } from "@/components/sections/OurProducts";
import { EarlyTesterBanner } from "@/components/sections/EarlyTesterBanner";
import { FAQSection } from "@/components/sections/FAQSection";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Voxlate — Breaking Language Barriers",
  description: "Real-time AI translation that preserves your voice, tone and emotion. Join the waitlist for early access.",
  openGraph: {
    title: "Voxlate — Breaking Language Barriers",
    description: "Real-time AI translation that preserves your voice, tone and emotion.",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <WhatIsVoxlate />
        <OurProducts />
        <EarlyTesterBanner />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
