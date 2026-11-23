"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { clamp01, smoothstep } from "@/components/home/lemniscate";

/**
 * Scroll choreography shared by the pinned stories (home and Physical page).
 * All values are fractions of the pinned scroll distance.
 */
export function makeChoreography({
  introFrom,
  introTo,
  stationFrom,
  stationStep,
  stations,
}: {
  introFrom: number;
  introTo: number;
  stationFrom: number;
  stationStep: number;
  stations: number;
}) {
  const introAt = (p: number) => clamp01((p - introFrom) / (introTo - introFrom));
  /** 0..stations-1 with a dwell around each whole number so each station holds still while you read. */
  const stationAt = (p: number) => {
    const x = Math.min(stations - 1, Math.max(0, (p - stationFrom) / stationStep));
    const i = Math.min(stations - 2, Math.floor(x));
    return i + smoothstep(0.22, 0.78, x - i);
  };
  /** Scroll fraction at which station i is fully in focus. */
  const stationProgress = (i: number) => stationFrom + i * stationStep + 0.03;
  return { introAt, stationAt, stationProgress };
}

export type Choreography = ReturnType<typeof makeChoreography>;

export function useStationStyle(progress: MotionValue<number>, i: number, { introAt, stationAt }: Choreography) {
  const opacity = useTransform(progress, (p) => {
    const a = stationAt(p);
    const fade = clamp01(1 - Math.abs(a - i) * 2.4);
    return i === 0 ? fade * smoothstep(0.75, 1, introAt(p)) : fade;
  });
  const y = useTransform(progress, (p) => (i - stationAt(p)) * 36);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  return { opacity, y, pointerEvents };
}

export function StationPanel({
  style,
  labelledBy,
  onFocus,
  children,
}: {
  style: ReturnType<typeof useStationStyle>;
  labelledBy: string;
  onFocus: () => void;
  children: ReactNode;
}) {
  return (
    <motion.article
      aria-labelledby={labelledBy}
      onFocusCapture={onFocus}
      style={style}
      className="absolute bottom-6 left-[26vw] right-4 top-[46%] flex flex-col justify-start sm:bottom-10 lg:bottom-auto lg:left-[31vw] lg:right-auto lg:top-1/2 lg:w-[min(28vw,440px)] lg:-translate-y-1/2"
    >
      {children}
    </motion.article>
  );
}

export function StationIndex({ n, of, note }: { n: string; of: string; note?: ReactNode }) {
  return (
    <p className="vx-label mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 lg:mb-4">
      <span className="text-ink">
        {n} <span className="text-line-strong">/ {of}</span>
      </span>
      {note && (
        <>
          <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
          <span>{note}</span>
        </>
      )}
    </p>
  );
}
