export type AuthPayloadLogin = { email: string; password: string };
export type AuthPayloadSignup = { name: string; email: string; password: string; photo?: string };

export type AuthResponse =
  | { status: "success"; message: string; data: { id: string; name: string; email: string; photoUrl?: string } }
  | { status: "error"; code: "invalid_credentials"; message: string }
  | { status: "error"; code: "email_taken"; message: string }
  | { status: "error"; code: "validation_error"; message: string; errors?: Record<string, string> }
  | { status: "error"; code: "server_error"; message: string };
