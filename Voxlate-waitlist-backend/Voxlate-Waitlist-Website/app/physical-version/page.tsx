import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PhysicalHero } from "@/components/sections/physical/PhysicalHero";
import { SituationsGrid } from "@/components/sections/physical/SituationsGrid";
import { HowItWorks } from "@/components/sections/physical/HowItWorks";
import { CommunicationModes } from "@/components/sections/physical/CommunicationModes";
import { WhyChoosePhysical } from "@/components/sections/physical/WhyChoosePhysical";
import { EarlyTesterBanner } from "@/components/sections/physical/EarlyTesterBanner";

export const metadata = {
  title: "Voxlate Physical — Real World. Real Conversations.",
  description:
    "Voxlate Physical is a wearable translation device that lets you hear and speak in your own language, in real time. No apps, no typing — just natural conversations.",
  openGraph: {
    title: "Voxlate Physical — Real World. Real Conversations.",
    description:
      "Voxlate Physical is a wearable translation device that lets you hear and speak in your own language, in real time. No apps, no typing — just natural conversations.",
    type: "website",
  },
};

export default function PhysicalVersionPage() {
  return (
    <>
      <Navbar />
      <main>
        <PhysicalHero />
        <SituationsGrid />
        <HowItWorks />
        <CommunicationModes />
        <WhyChoosePhysical />
        <EarlyTesterBanner />
      </main>
      <Footer />
    </>
  );
}
