import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Email is required." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
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

    const res = NextResponse.json({
      status: "success",
      message: "If an account exists for this email, we have sent a password reset link.",
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    console.error("forgot password error", err);
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
