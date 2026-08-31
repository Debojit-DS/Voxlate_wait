import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!token || !newPassword) {
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Token and new password are required." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    const resetEntry = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetEntry || resetEntry.usedAt || resetEntry.expiresAt < new Date()) {
      const res = NextResponse.json(
        { status: "error", code: "invalid_token", message: "Invalid or expired password reset token." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
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

    const res = NextResponse.json({
      status: "success",
      message: "Password has been reset successfully.",
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    console.error("reset password error", err);
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
