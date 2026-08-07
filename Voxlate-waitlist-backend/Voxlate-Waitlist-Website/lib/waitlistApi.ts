import type { WaitlistFormValues } from "./validation";

export type WaitlistResponse =
  | { status: "success"; message: string; data: { id: string; email: string; position?: number } }
  | { status: "error"; code: "duplicate_email"; message: string }
  | { status: "error"; code: "validation_error"; message: string; errors?: Record<string, string> }
  | { status: "error"; code: "server_error"; message: string };

// Defaults to same-origin relative requests, since the backend now lives in
// this app's own API routes.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function submitToWaitlist(payload: WaitlistFormValues): Promise<WaitlistResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as WaitlistResponse;
  } catch {
    return { status: "error", code: "server_error", message: "Something went wrong." };
  }
}
