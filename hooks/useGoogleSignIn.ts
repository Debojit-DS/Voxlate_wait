"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson } from "@/lib/apiClient";

const FALLBACK_CLIENT_ID = "590978377785-pqv0dkl9vfkvi7101d7qdj08vvfnp2va.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            use_fedcm_for_prompt?: boolean;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function useGoogleSignIn(onSuccess?: () => void) {
  const successRef = useRef(onSuccess);
  useEffect(() => {
    successRef.current = onSuccess;
  }, [onSuccess]);

  const mounted = useRef(false);
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(async ({ credential }: { credential: string }) => {
    if (!mounted.current) return;
    setBusy(true);
    setError(null);
    try {
      const result = await apiJson<{ status: string; message?: string }>("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });

      if (result.status !== "success") {
        throw new Error(result.message || "Google sign-in failed. Please try again.");
      }

      if (mounted.current) {
        successRef.current?.();
        window.location.reload();
      }
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : "Google sign-in failed. Please try again.");
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, []);

  const initGis = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id || initialized.current) {
      return;
    }
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || FALLBACK_CLIENT_ID;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        use_fedcm_for_prompt: true,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      initialized.current = true;
      setReady(true);
    } catch (e) {
      console.warn("Google initialization deferred:", e);
    }
  }, [handleCredential]);

  useEffect(() => {
    mounted.current = true;

    // Check if script already loaded
    if (window.google?.accounts?.id) {
      initGis();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGis();
        }
      }, 200);

      const timeout = setTimeout(() => {
        clearInterval(timer);
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(timeout);
      };
    }

    return () => {
      mounted.current = false;
    };
  }, [initGis]);

  const prompt = useCallback(() => {
    if (busy) return;
    setError(null);

    if (!initialized.current) {
      initGis();
    }

    const id = window.google?.accounts?.id;
    if (!id) {
      setError("Google Sign-In is loading. Please try again in a moment.");
      return;
    }

    try {
      id.prompt();
    } catch (err) {
      console.error("GIS prompt error:", err);
      setError("Failed to open Google sign-in. Please try again.");
    }
  }, [busy, initGis]);

  return { prompt, ready, busy, error };
}
