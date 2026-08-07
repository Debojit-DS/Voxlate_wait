import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { checkRateLimit, getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkSignupRateLimit } from "@/lib/rateLimiter";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { attachSessionCookie, hashPassword } from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().min(1, "Full name is required").max(120),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy",
  }),
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

  const parsed = signupSchema.safeParse(body);
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

  const { name, email, password, agreedToTerms } = parsed.data;
  const ip = getClientIp(req);
  const rateLimitKey = `signup:${ip}`;
  if (!checkSignupRateLimit(rateLimitKey, 3, 60_000)) {
    const res = NextResponse.json(
      { status: "error", code: "rate_limit", message: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
    return withCorrelationId(withCors(res), "");
  }
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: passwordHash },
    });

    const res = NextResponse.json(
      {
        status: "success",
        message: "Account created.",
        data: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );

    await attachSessionCookie(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const res = NextResponse.json(
        {
          status: "error",
          code: "email_taken",
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    console.error("signup error");
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = NextResponse.text("", { status: 204 });
  return withSecurityHeaders(withCors(res, origin));
}
