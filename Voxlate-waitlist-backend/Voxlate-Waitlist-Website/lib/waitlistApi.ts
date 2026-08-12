import type { WaitlistFormValues } from "./validation";

export type WaitlistResponse =
  | { status: "success"; message: string; data: { id: string; email: string; position?: number } }
  | { status: "error"; code: "duplicate_email"; message: string }
  | { status: "error"; code: "validation_error"; message: string; errors?: Record<string, string> }
  | { status: "error"; code: "server_error"; message: string };

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

export type PublicWaitlistEntry = {
  id: string;
  name: string;
  role: string | null;
  organization: string | null;
  photoUrl: string | null;
  createdAt: string;
  type: string;
  product: string;
};

export type PublicWaitlistResponse = {
  status: "success";
  data: PublicWaitlistEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export async function getPublicWaitlist(page = 1, pageSize = 20): Promise<PublicWaitlistResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`${API_BASE}/api/waitlist?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  return (await res.json()) as PublicWaitlistResponse;
}
