"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AuthPromptContextValue = {
  isOpen: boolean;
  openPrompt: (options?: { redirectTo?: string; autoOpen?: string }) => void;
  closePrompt: () => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthPromptContext.Provider
      value={{
        isOpen,
        openPrompt: (options) => {
          const redirectTo = options?.redirectTo || "/";
          const autoOpen = options?.autoOpen || "";
          if (redirectTo && redirectTo !== "/") {
            sessionStorage.setItem("redirectTo", redirectTo);
          }
          if (autoOpen) {
            sessionStorage.setItem("autoOpen", autoOpen);
          }
          setIsOpen(true);
        },
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
