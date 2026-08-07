import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { getClientIp, generateCorrelationId } from "@/lib/correlationId";
import { checkRateLimit as checkGoogleRateLimit } from "@/lib/rateLimiter";
import { prisma } from "@/lib/db";
import { attachSessionCookie } from "@/lib/auth";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;
  const ip = getClientIp(req);
  const rateLimitKey = `google:${ip}`;
  if (!checkGoogleRateLimit(rateLimitKey, 5, 60_000)) {
    const res = NextResponse.json(
      { status: "error", code: "rate_limit", message: "Too many Google sign-in attempts. Please try again later." },
      { status: 429 }
    );
    return withCorrelationId(withCors(res), "");
  }

    if (!idToken) {
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "Google ID token is required." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.name) {
      const res = NextResponse.json(
        { status: "error", code: "invalid_token", message: "Invalid Google token." },
        { status: 401 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name,
          email: normalizedEmail,
          password: await (await import("@/lib/auth")).hashPassword(Math.random().toString(36)),
        },
      });
    }

    const res = NextResponse.json({
      status: "success",
      message: "Signed in with Google.",
      data: { id: user.id, name: user.name, email: user.email },
    });

    await attachSessionCookie(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res;
  } catch (err) {
    console.error("google auth error");
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
