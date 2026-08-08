import { useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
  // Use a ref so changes to onSuccess don't trigger re-initialization loops
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
          credentials: "include", 
        });

        if (res.ok) {
          onSuccessRef.current?.();
          window.location.reload();
        } else {
          const errorData = await res.json().catch(() => null);
          console.error("Google sign-in backend rejected:", errorData);
        }
      } catch (err) {
        console.error("Google sign-in network error:", err);
      }
    },
    [] // Stable reference
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return;

    // This will now strictly run ONCE on mount
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });
  }, [handleCredential]);

  const prompt = useCallback(() => {
    window.google?.accounts?.id?.prompt();
  }, []);

  return { prompt };
}