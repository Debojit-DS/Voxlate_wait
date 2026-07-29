import type { WaitlistFormValues } from "./validation";

export type WaitlistResponse =
  | { status: "success"; message: string; data: { id: string; email: string; position?: number } }
  | { status: "error"; code: "duplicate_email"; message: string }
  | { status: "error"; code: "validation_error"; message: string; errors?: Record<string, string> }
  | { status: "error"; code: "server_error"; message: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function submitToWaitlist(payload: WaitlistFormValues): Promise<WaitlistResponse> {
  if (!API_BASE) return mockSubmitToWaitlist(payload);

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

async function mockSubmitToWaitlist(payload: WaitlistFormValues): Promise<WaitlistResponse> {
  await new Promise((r) => setTimeout(r, 800));
  if (payload.email === "test@voxlate.com") {
    return { status: "error", code: "duplicate_email", message: "This email is already on the waitlist." };
  }
  return {
    status: "success",
    message: "You have been added to the waitlist.",
    data: { id: crypto.randomUUID(), email: payload.email, position: Math.floor(Math.random() * 2000) },
  };
}
