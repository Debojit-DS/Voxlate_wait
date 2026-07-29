import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroDigitalVersion } from "@/components/sections/digital/HeroDigitalVersion";
import { HowItWorks } from "@/components/sections/digital/HowItWorks";
import { UseCaseCardsRow } from "@/components/sections/digital/UseCaseCardsRow";
import { BuiltForEveryProfessionalNeed } from "@/components/sections/digital/BuiltForEveryProfessionalNeed";
import { WorksOnPlatforms } from "@/components/sections/digital/WorksOnPlatforms";
import { PrivacyBanner } from "@/components/sections/digital/PrivacyBanner";
import { EarlyTesterBanner } from "@/components/sections/EarlyTesterBanner";

export const metadata = {
  title: "Digital Version — Voxlate | Breaking Language Barriers",
  description:
    "Voxlate Digital brings real-time AI voice translation to your meetings, calls and remote collaboration — speak naturally, hear every language.",
  openGraph: {
    title: "Digital Version — Voxlate | Breaking Language Barriers",
    description:
      "Voxlate Digital brings real-time AI voice translation to your meetings, calls and remote collaboration — speak naturally, hear every language.",
    type: "website",
  },
};

export default function DigitalVersionPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroDigitalVersion />
        <HowItWorks />
        <UseCaseCardsRow />
        <BuiltForEveryProfessionalNeed />
        <WorksOnPlatforms />
        <PrivacyBanner />
        <EarlyTesterBanner source="digital-tester-banner" />
      </main>
      <Footer />
    </>
  );
}
