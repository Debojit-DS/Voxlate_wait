"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuthPrompt } from "./AuthPromptProvider";

export function AuthPromptModal() {
  const { isOpen, closePrompt } = useAuthPrompt();

  if (!isOpen) return null;

  const buildHref = (path: string) => {
    const params = new URLSearchParams();
    const redirectTo = sessionStorage.getItem("redirectTo") || "/";
    const autoOpen = sessionStorage.getItem("autoOpen") || "";
    params.set("redirectTo", redirectTo);
    if (autoOpen) params.set("autoOpen", autoOpen);
    return `${path}?${params.toString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-cta/50" onClick={closePrompt} />
      <div className="relative z-10 w-full max-w-[400px] rounded-modal bg-accent-blue-light p-8 shadow-lg border border-border">
        <button
          type="button"
          onClick={closePrompt}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-text-primary mb-2">Join the Voxlate Waitlist</h3>
          <p className="mt-2 text-sm text-text-secondary">Sign in or create an account to join the waitlist and be first in line.</p>
        </div>

        <div className="space-y-3">
          <Link href={buildHref("/signup")} onClick={closePrompt}>
            <Button variant="primary-navy" className="w-full">Create Account</Button>
          </Link>
          <Link href={buildHref("/login")} onClick={closePrompt}>
            <Button variant="outline-navy" className="w-full">Log In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
