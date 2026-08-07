import { useEffect, useCallback } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: (moment?: { promptMoment: () => void }) => void;
        };
      };
    };
  }
}

export function useGoogleSignIn(onSuccess?: () => void) {
  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });

        if (res.ok) {
          onSuccess?.();
          window.location.reload();
        }
      } catch (err) {
        console.error("Google sign-in error:", err);
      }
    },
    [onSuccess]
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });

    return () => {
      // Google does not provide an uninitialize method,
      // but we can avoid re-initializing by guarding with a ref in production.
    };
  }, [handleCredential]);

  const prompt = useCallback(() => {
    window.google?.accounts?.id?.prompt();
  }, []);

  return { prompt };
}
