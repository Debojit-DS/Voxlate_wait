import type { AuthPayloadLogin, AuthPayloadSignup, AuthResponse } from "./authTypes";

// Defaults to same-origin relative requests, since the backend now lives in
// this app's own API routes. Set NEXT_PUBLIC_API_BASE_URL only if the API is
// deployed separately (e.g. a different domain) — credentials are included
// either way so the httpOnly session cookie is sent/received.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function loginUser(payload: AuthPayloadLogin): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as AuthResponse;
  } catch {
    return { status: "error", code: "server_error", message: "Something went wrong." };
  }
}

export async function signupUser(payload: AuthPayloadSignup): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as AuthResponse;
  } catch {
    return { status: "error", code: "server_error", message: "Something went wrong." };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // best-effort; the cookie will still expire naturally
  }
}

type AuthUser = Extract<AuthResponse, { status: "success" }>["data"];

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: "include",
      signal: AbortSignal.timeout(10_000),
    });
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}
