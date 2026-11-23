import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeStory } from "@/components/home/story/HomeStory";
import { ReviewsLoop } from "@/components/home/ReviewsLoop";
import { FaqLens } from "@/components/home/FaqLens";
import { WaitlistGift } from "@/components/home/WaitlistGift";

export const metadata = {
  title: "Voxlate — Natural translation in your own voice",
  description:
    "Real-time translation that keeps your voice, your tone and the way you speak, so every conversation still sounds like you. Join the waitlist for early access.",
  openGraph: {
    title: "Voxlate — Natural translation in your own voice",
    description: "Real-time translation that keeps your voice, your tone and the way you speak.",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <HomeStory />
        <ReviewsLoop />
        <FaqLens />
        <WaitlistGift />
      </main>
      <Footer />
    </>
  );
}
