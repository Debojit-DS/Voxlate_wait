import { DemoHeader, DemoHero, InfoBanner, InfoStrip, FeatureIconsRow, DemoFooter } from "@/components/sections/digital/DemoExperience";
import { DemoCard } from "@/components/sections/digital/DemoCard";
import { ReviewBanner } from "@/components/sections/digital/ReviewBanner";
import DemoPageClient from "./DemoPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Demo Experience | Voxlate",
  description: "Try Voxlate's real-time AI voice translation demo. Speak naturally and hear every language.",
};

export default function DemoPage() {
  return <DemoPageClient />;
}
