import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { logAuth } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!token || !newPassword) {
      const correlationId = generateCorrelationId();
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Token and new password are required." },
        { status: 400 }
      );
      await logAuth({
        event: "auth.reset_password.failed",
        method: req.method,
        route: "/api/auth/reset-password",
        status: 400,
        code: "validation_error",
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
      });
      return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
    }

    const resetEntry = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetEntry || resetEntry.usedAt || resetEntry.expiresAt < new Date()) {
      const correlationId = generateCorrelationId();
      const res = NextResponse.json(
        { status: "error", code: "invalid_token", message: "Invalid or expired password reset token." },
        { status: 400 }
      );
      await logAuth({
        event: "auth.reset_password.failed",
        method: req.method,
        route: "/api/auth/reset-password",
        status: 400,
        code: "invalid_token",
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? null,
        correlationId,
        email: resetEntry?.email ?? null,
      });
      return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetEntry.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    const correlationId = generateCorrelationId();
    const res = NextResponse.json({
      status: "success",
      message: "Password has been reset successfully.",
    });
    await logAuth({
      event: "auth.reset_password.completed",
      method: req.method,
      route: "/api/auth/reset-password",
      status: 200,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
      email: resetEntry.email,
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), correlationId);
  } catch (err) {
    const correlationId = generateCorrelationId();
    console.error("reset password error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    await logAuth({
      event: "auth.reset_password.failed",
      method: req.method,
      route: "/api/auth/reset-password",
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
