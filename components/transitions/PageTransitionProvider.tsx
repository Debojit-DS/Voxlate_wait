"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type TransitionContextValue = {
  isTransitioning: boolean;
  startTransition: () => void;
  finishTransition: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const finishTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, startTransition, finishTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    return {
      isTransitioning: false,
      startTransition: () => {},
      finishTransition: () => {},
    };
  }
  return ctx;
}
