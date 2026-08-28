"use client";

import { useRouter } from "next/navigation";
import { usePageTransition } from "@/components/transitions/PageTransitionProvider";

export function useDemoTransition() {
  const router = useRouter();
  const { startTransition, isTransitioning } = usePageTransition();

  const goToDemo = () => {
    if (isTransitioning) return;
    startTransition();
    setTimeout(() => {
      router.push("/demo");
    }, 1200);
  };

  return { goToDemo, isTransitioning };
}
