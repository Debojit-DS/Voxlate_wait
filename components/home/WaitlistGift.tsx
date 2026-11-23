"use client";

import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";

const TAPE_TEXT = "Join the waitlist";

/**
 * Closing call to action, wrapped like a gift: two tapes cross the corner and run in
 * opposite directions. Both tapes (and the button) open the waitlist.
 */
export function WaitlistGift() {
  const { openWaitlist } = useGatedWaitlist();

  return (
    <section aria-labelledby="gift-title" className="pb-20 lg:pb-28">
      <div className="page-container">
        <div className="relative isolate min-h-[520px] overflow-hidden rounded-[14px] bg-ink px-6 pb-52 pt-12 text-page sm:px-12 sm:pt-16 lg:min-h-[480px] lg:px-16 lg:pb-20 lg:pt-20">
          <div className="relative z-10 origin-left -rotate-[4deg]">
            <h2 id="gift-title" className="vx-display text-[clamp(2.1rem,7vw,3rem)] uppercase leading-[0.95] lg:whitespace-nowrap lg:text-[clamp(3rem,4.6vw,4.6rem)]">
              <span className="vx-outline block">Ready to be heard</span>
              <span className="block">in every language?</span>
            </h2>
          </div>
          <p className="relative z-10 mt-7 max-w-[42ch] text-[16px] leading-relaxed text-page/75 lg:mt-9 lg:text-[17px]">
            Join the waitlist for launch updates and early access. Joining also unlocks the web demo.
          </p>
          <button
            type="button"
            onClick={() => openWaitlist("gift-banner")}
            className="relative z-10 mt-8 inline-flex h-[52px] items-center rounded-[10px] border border-page/80 px-7 text-[16px] font-semibold text-page transition-colors hover:bg-page hover:text-ink"
          >
            Join the Waitlist
          </button>

          {/* Two tapes crossing the corner like a ribbon on a gift. */}
          <Tape className="left-[-20%] top-[74%] w-[150%] -rotate-[17deg] bg-[#8b93a8] lg:left-[36%] lg:top-[60%] lg:w-[82%] lg:-rotate-[27deg]" dir="left" onClick={() => openWaitlist("gift-tape")} />
          <Tape className="left-[-25%] top-[84%] w-[150%] -rotate-[5deg] bg-page lg:left-[44%] lg:top-[76%] lg:w-[78%] lg:-rotate-[11deg]" dir="right" onClick={() => openWaitlist("gift-tape")} />
        </div>
      </div>
    </section>
  );
}

function Tape({ className, dir, onClick }: { className: string; dir: "left" | "right"; onClick: () => void }) {
  const items = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="flex shrink-0 items-center gap-6 pr-6">
      <span>{TAPE_TEXT}</span>
      <span aria-hidden="true" className="text-[1.6em] leading-none text-primary">
        ∞
      </span>
    </span>
  ));
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onClick}
      className={`vx-tape absolute z-0 h-[48px] origin-center cursor-pointer overflow-hidden text-[18px] font-semibold text-ink shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7)] sm:h-[56px] sm:text-[21px] ${className}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      <span className="vx-tape-track h-full items-center" data-dir={dir}>
        <span className="flex">{items}</span>
        <span className="flex">{items}</span>
      </span>
    </button>
  );
}
