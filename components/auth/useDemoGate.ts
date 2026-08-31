"use client";

import { useCallback, useEffect, useState } from "react";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { checkWaitlistStatus } from "@/lib/waitlistApi";

type DemoGateStatus = "idle" | "loading" | "allowed" | "blocked";

export function useDemoGate() {
  const [status, setStatus] = useState<DemoGateStatus>("idle");
  const { user } = useAuth();
  const { openModal } = useWaitlistModal();
  const { openPrompt } = useAuthPrompt();

  const checkStatus = useCallback(async () => {
    if (!user?.email) {
      setStatus("blocked");
      return;
    }

    setStatus("loading");
    try {
      const result = await checkWaitlistStatus(user.email);
      if (result.status === "success" && result.data.joined) {
        setStatus("allowed");
      } else {
        setStatus("blocked");
      }
    } catch {
      setStatus("blocked");
    }
  }, [user?.email]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    const handler = () => {
      checkStatus();
    };
    window.addEventListener("waitlist:joined", handler);
    return () => window.removeEventListener("waitlist:joined", handler);
  }, [checkStatus]);

  const promptJoinWaitlist = useCallback((options?: { redirectTo?: string; autoOpen?: string }) => {
    if (!user) {
      openPrompt(options);
    } else {
      openModal("demo-gate");
    }
  }, [user, openPrompt, openModal]);

  const isAllowed = status === "allowed";

  return {
    status,
    isAllowed,
    isLoading: status === "loading" || status === "idle",
    promptJoinWaitlist,
    refresh: checkStatus,
  };
}
