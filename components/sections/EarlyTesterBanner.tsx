import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

/** Closing call to action banner. */
export function EarlyTesterBanner({ source = "tester-banner" }: { source?: string }) {
  return (
    <section aria-labelledby={`tester-${source}`} className="border-t border-line bg-mist/60 py-16 md:py-24">
      <div className="page-container max-w-[800px] mx-auto text-center">
        <h2 id={`tester-${source}`} className="display-section">Become an Early Tester</h2>
        <p className="mt-4 max-w-[56ch] mx-auto text-[17px] sm:text-[18px] leading-relaxed text-slate">
          Join today and selected users will receive early product testing access before the official public release.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <WaitlistButton source={source} label="Join Waitlist Now" wide />
          <UnderlineLink href="/demo" variant="goes-out-comes-in" direction="right" className="text-[15px] font-semibold">
            View Our Demo
          </UnderlineLink>
        </div>
      </div>
    </section>
  );
}
