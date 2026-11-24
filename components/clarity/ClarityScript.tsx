"use client";

import { useEffect, useRef } from "react";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

/**
 * Microsoft Clarity integration — client-only.
 *
 * Security safeguards:
 * - Reads project ID from NEXT_PUBLIC_CLARITY_PROJECT_ID env var only.
 *   Never hardcoded. Never sent if missing.
 * - Client-side only (window check) — safe for SSR/SSG/hydration.
 * - Never sends PII: no custom tags with emails, names, phones, or tokens.
 * - No opaque user IDs passed to Clarity.
 * - Consent: if the app later adds a tracking consent banner, hook it here
 *   by only calling window.clarity('consent') when the user accepts.
 */
export function ClarityScript() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || typeof window === "undefined") return;
    if (!CLARITY_PROJECT_ID) return;

    initialized.current = true;

    const w = window as unknown as {
      clarity?: (command: string, ...args: unknown[]) => void;
      [key: string]: unknown;
    };
    const d = document;

    w.clarity =
      w.clarity ||
      function (...args: unknown[]) {
        (w.clarity as unknown as { q: unknown[] }).q = (
          w.clarity as unknown as { q: unknown[] }
        ).q || [];
        (w.clarity as unknown as { q: unknown[] }).q.push(args);
      };

    const t = d.createElement("script") as HTMLScriptElement;
    t.async = true;
    t.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
    const y = d.getElementsByTagName("script")[0];
    y.parentNode?.insertBefore(t, y);
  }, []);

  return null;
}
