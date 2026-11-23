/**
 * Public, unauthenticated API calls used by the homepage.
 *
 * The same-origin proxy (/api/*) is tried first. Only when the proxy can't reach the
 * backend (network error, 404 or 5xx) do we call the public API directly — so a POST
 * the backend actually received (2xx, 400, 429…) is never sent twice.
 */
import { publicName, PUBLIC_RECENT_LIMIT } from "./publicName";

const DIRECT_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://voxlate-wait.onrender.com").replace(/\/$/, "");

function shouldFallBack(res: Response | null) {
  return !res || res.status === 404 || res.status >= 500;
}

export async function publicFetch(path: string, init: RequestInit = {}, timeoutMs = 20_000): Promise<Response> {
  if (!path.startsWith("/")) throw new Error("Expected an API path such as /reviews.");
  let res: Response | null = null;
  try {
    res = await fetch(`/api${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    res = null;
  }
  if (!shouldFallBack(res)) return res as Response;
  try {
    return await fetch(`${DIRECT_BASE}/api${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (res) return res;
    throw error;
  }
}

export type PublicReview = {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  text: string;
  rating: number;
  createdAt: string;
};

export async function fetchReviews(): Promise<PublicReview[]> {
  const res = await publicFetch("/reviews");
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.status !== "success" || !Array.isArray(data.reviews)) throw new Error("Reviews are unavailable.");
  return (data.reviews as PublicReview[])
    .filter((r) => typeof r.text === "string" && r.text.trim())
    .sort((a, b) => b.rating - a.rating || +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function postReview(input: { text: string; rating: number; authorName?: string }): Promise<PublicReview> {
  const res = await publicFetch("/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.status !== "success" || !data.review) {
    throw new Error(data?.message || "Your review couldn't be saved. Please try again.");
  }
  return data.review as PublicReview;
}

export type WaitlistPulse = { total: number; recent: { name: string; createdAt: string | null }[]; initials: string[] };

/**
 * Waitlist size plus a few recent "First L." names (the server never sends more).
 * The API sleeps when idle and can take ~30 s to wake, so this waits longer and retries once.
 */
export async function fetchWaitlistPulse(): Promise<WaitlistPulse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await publicFetch("/waitlist?pageSize=8", {}, 45_000);
      const data = await res.json().catch(() => null);
      const total = Number(data?.pagination?.total);
      if (!res.ok || !Number.isFinite(total)) throw new Error("Waitlist count unavailable.");
      const recent = (Array.isArray(data.data) ? data.data : [])
        .filter((e: { name?: unknown }) => typeof e?.name === "string")
        .slice(0, PUBLIC_RECENT_LIMIT)
        // The server already sends "First L."; trimming again keeps an older API from ever showing full names.
        .map((e: { name: string; createdAt?: unknown }) => ({ name: publicName(e.name), createdAt: typeof e.createdAt === "string" ? e.createdAt : null }));
      const initials = recent
        .map((e: { name: string }) => e.name.match(/\p{L}/u)?.[0]?.toLocaleUpperCase())
        .filter((l: string | undefined): l is string => Boolean(l));
      return { total, recent, initials };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function postQuestion(input: { name: string; email: string; question: string; website?: string }) {
  const res = await publicFetch("/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.status !== "success") {
    throw new Error(
      data?.message || (res.status === 404 ? "Questions can't be received yet. Please try again soon." : "Your question couldn't be sent. Please try again."),
    );
  }
}

export type ContactInput =
  | { kind: "customer" | "freelancer"; name: string; email: string; company?: string; topic?: string; website?: string; message: string; fax?: string }
  | { kind: "investor"; name: string; email: string; company?: string; stage?: string; website?: string; message: string; fax?: string };

export async function postContact(input: ContactInput): Promise<void> {
  const res = await publicFetch("/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.status !== "success") {
    const field = data?.errors ? Object.values(data.errors as Record<string, string>)[0] : null;
    throw new Error(field || data?.message || (res.status === 404 ? "Messages can't be received yet. Please email support@voxlate.com." : "Your message couldn't be sent. Please try again."));
  }
}
