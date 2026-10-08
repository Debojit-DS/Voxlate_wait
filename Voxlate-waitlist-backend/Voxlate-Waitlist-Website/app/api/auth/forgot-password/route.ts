import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/resend";
import { logAuth } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      const correlationId = generateCorrelationId();
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Email is required." },
        { status: 400 }
      );
      await logAuth({
        event: "auth.forgot_password.failed",
        method: req.method,
        route: "/api/auth/forgot-password",
        status: 400,
        code: "validation_error",
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
      });
      return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user) {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token,
          expiresAt,
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${token}`;
      await sendPasswordResetEmail(normalizedEmail, resetUrl);
    }

    const correlationId = generateCorrelationId();
    const res = NextResponse.json({
      status: "success",
      message: "If an account exists for this email, we have sent a password reset link.",
    });
    await logAuth({
      event: "auth.forgot_password.completed",
      method: req.method,
      route: "/api/auth/forgot-password",
      status: 200,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: normalizedEmail,
      userId: user?.id ?? null,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  } catch (err) {
    const correlationId = generateCorrelationId();
    console.error("forgot password error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    await logAuth({
      event: "auth.forgot_password.failed",
      method: req.method,
      route: "/api/auth/forgot-password",
      status: 500,
      code: "server_error",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      errorMessage: err instanceof Error ? err.message : "unknown",
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
