import { preload } from "react-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeStory } from "@/components/home/story/HomeStory";
import { ReviewsLoop } from "@/components/home/ReviewsLoop";
import { FaqLens } from "@/components/home/FaqLens";
import { WaitlistGift } from "@/components/home/WaitlistGift";
import "@/components/home/home.css";

export const metadata = {
  title: "Voxlate — Breaking Language Barriers",
  description: "Real-time AI translation designed to preserve your voice, tone and emotion. Join the waitlist for early access.",
  openGraph: {
    title: "Voxlate — Breaking Language Barriers",
    description: "Real-time AI translation designed to preserve your voice, tone and emotion.",
    type: "website",
  },
};

export default function Page() {
  preload("/fonts/cabinet-grotesk-variable.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/fonts/switzer-variable.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <div className="vx-home">
      <Navbar />
      <main>
        <HomeStory />
        <ReviewsLoop />
        <FaqLens />
        <WaitlistGift />
      </main>
      <div className="vx-legacy">
        <Footer />
      </div>
    </div>
  );
}
