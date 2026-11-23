"use client";

import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";

/** Primary "Join the waitlist" action. `source` attributes where the visitor joined. */
export function WaitlistButton({ source, label = "Join the waitlist" }: { source: string; label?: string; wide?: boolean }) {
  const { openWaitlist } = useGatedWaitlist();
  return (
    <button type="button" className="vx-btn" onClick={() => openWaitlist(source)}>
      {label}
    </button>
  );
}
