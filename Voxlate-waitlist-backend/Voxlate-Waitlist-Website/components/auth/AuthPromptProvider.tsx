"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AuthPromptContextValue = {
  isOpen: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthPromptContext.Provider
      value={{
        isOpen,
        openPrompt: () => setIsOpen(true),
        closePrompt: () => setIsOpen(false),
      }}
    >
      {children}
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) throw new Error("useAuthPrompt must be used within AuthPromptProvider");
  return ctx;
}
