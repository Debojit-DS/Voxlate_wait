import type { AuthPayloadLogin, AuthPayloadSignup, AuthResponse } from "./authTypes";

export async function loginUser(payload: AuthPayloadLogin): Promise<AuthResponse> {
    try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as AuthResponse;
  } catch {
    return { status: "error", code: "server_error", message: "Something went wrong." };
  }
}

export async function signupUser(payload: AuthPayloadSignup): Promise<AuthResponse> {
    try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as AuthResponse;
  } catch {
    return { status: "error", code: "server_error", message: "Something went wrong." };
  }
}

async function mockLogin(payload: AuthPayloadLogin): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 800));
  if (payload.email === "fail@voxlate.com") {
    return { status: "error", code: "invalid_credentials", message: "Invalid email or password." };
  }
  return {
    status: "success",
    message: "Signed in.",
    data: { id: crypto.randomUUID(), name: "Demo User", email: payload.email },
  };
}

async function mockSignup(payload: AuthPayloadSignup): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 800));
  if (payload.email === "test@voxlate.com") {
    return { status: "error", code: "email_taken", message: "An account with this email already exists." };
  }
  return {
    status: "success",
    message: "Account created.",
    data: { id: crypto.randomUUID(), name: payload.name, email: payload.email },
  };
}
