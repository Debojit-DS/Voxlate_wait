import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkLoginRateLimit } from "@/lib/rateLimiter";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { attachSessionCookie, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Invalid request body." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    const res = NextResponse.json(
      {
        status: "error",
        code: "validation_error",
        message: "Please check the form for errors.",
        errors,
      },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const { email, password } = parsed.data;
  const ip = getClientIp(req);
  const rateLimitKey = `login:${ip}`;
  if (!checkLoginRateLimit(rateLimitKey, 5, 60_000)) {
    const res = NextResponse.json(
      { status: "error", code: "rate_limit", message: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !(await verifyPassword(password, user.password))) {
      const res = NextResponse.json(
        {
          status: "error",
          code: "invalid_credentials",
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    const res = NextResponse.json({
      status: "success",
      message: "Signed in.",
      data: { id: user.id, name: user.name, email: user.email },
    });

    await attachSessionCookie(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return withCorrelationId(withSecurityHeaders(res), generateCorrelationId());
  } catch (err) {
    console.error("login error");
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
