"use client";

import { useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { DigitalMock, PLATFORMS, type Platform } from "@/components/home/story/DigitalMock";

/** The coded meeting window with a switch for the meeting app it sits in. */
export function PlatformMock() {
  const [platform, setPlatform] = useState<Platform>("zoom");
  const reduced = useReducedMotion() ?? false;
  return (
    <div>
      <div className="aspect-[16/11] w-full">
        <DigitalMock platform={platform} animate={!reduced} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Show it in">
        {(Object.keys(PLATFORMS) as Platform[]).map((key) => (
          <button key={key} type="button" className="vx-chip" aria-pressed={platform === key} onClick={() => setPlatform(key)}>
            <Image src={PLATFORMS[key].logo} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
            {PLATFORMS[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}
