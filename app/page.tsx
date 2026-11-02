import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PageContent from "@/components/sections/PageContent";

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
  return (
    <>
      <Navbar />
      <main>
        <PageContent />
      </main>
      <Footer />
    </>
  );
}
