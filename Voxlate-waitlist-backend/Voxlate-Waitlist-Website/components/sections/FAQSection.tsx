import { Accordion } from "@/components/ui/Accordion";

const FAQS = [
  {
    question: "What is Voxlate?",
    answer: "Voxlate is an AI-powered real-time voice translation platform that preserves your natural voice, tone, and emotion across languages. It enables seamless communication whether you are in an online meeting or face-to-face conversation.",
  },
  {
    question: "Is Voxlate free to use?",
    answer: "Voxlate will offer a free tier for basic translation needs, with paid plans for power users and businesses. Exact pricing will be announced closer to launch.",
  },
  {
    question: "How many languages does it support?",
    answer: "Voxlate supports over 100 languages and dialects, with more being added regularly. Our goal is to cover the majority of the world&apos;s most-spoken languages at launch.",
  },
  {
    question: "Can businesses and organizations use Voxlate?",
    answer: "Yes. Voxlate is built for both individual users and businesses. Teams can use it for global meetings, and enterprises can integrate it into their communication workflows.",
  },
  {
    question: "When will Voxlate be available?",
    answer: "We are currently in pre-launch. Join the waitlist to be notified the moment Voxlate is ready, and get early access as one of our first testers.",
  },
  {
    question: "How does the waitlist work?",
    answer: "Sign up with your name and email. We will email you the moment Voxlate launches, and selected users will get early product testing access before the public release.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange mb-3">FAQS</p>
          <h2 className="text-3xl font-bold text-text-primary md:text-4xl">Frequently Asked Questions</h2>
        </div>
        <div>
          <Accordion items={FAQS} />
        </div>
      </div>
    </section>
  );
}
