"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type WaitlistModalContextValue = {
  isOpen: boolean;
  source: string | null;
  openModal: (source?: string) => void;
  closeModal: () => void;
};

const WaitlistModalContext = createContext<WaitlistModalContextValue | null>(null);

export function WaitlistModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  return (
    <WaitlistModalContext.Provider
      value={{
        isOpen,
        source,
        openModal: (src) => {
          setSource(src ?? null);
          setIsOpen(true);
        },
        closeModal: () => setIsOpen(false),
      }}
    >
      {children}
    </WaitlistModalContext.Provider>
  );
}

export function useWaitlistModal() {
  const ctx = useContext(WaitlistModalContext);
  if (!ctx) throw new Error("useWaitlistModal must be used within WaitlistModalProvider");
  return ctx;
}
