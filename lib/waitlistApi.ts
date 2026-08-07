import type { WaitlistFormValues } from "./validation";

export type WaitlistResponse =
  | { status: "success"; message: string; data: { id: string; email: string; position?: number } }
  | { status: "error"; code: "duplicate_email"; message: string }
  | { status: "error"; code: "validation_error"; message: string; errors?: Record<string, string> }
  | { status: "error"; code: "server_error"; message: string };

export type WaitlistCheckResponse =
  | { status: "success"; data: { joined: boolean } }
  | { status: "error"; code: "server_error"; message: string };

export async function submitToWaitlist(payload: WaitlistFormValues): Promise<WaitlistResponse> {
    try {
    const res = await fetch("/api/waitlist", {
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

export async function checkWaitlistStatus(email: string): Promise<WaitlistCheckResponse> {
  try {
    const res = await fetch(`/api/waitlist?email=${encodeURIComponent(email)}`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as WaitlistCheckResponse;
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
