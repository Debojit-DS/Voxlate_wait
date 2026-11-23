import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId, getClientIp } from "@/lib/correlationId";
import { checkRateLimit } from "@/lib/rateLimiter";
import { prisma } from "@/lib/db";
import { attachSessionCookie } from "@/lib/auth";
import { logAuth } from "@/lib/logger";

/**
 * Admin sign-in with a username instead of an email.
 *
 * Env:
 *   ADMIN_USERNAME        default "admin"
 *   ADMIN_PASSWORD_HASH   bcrypt hash of the admin password, raw or base64 (the plain password is never stored)
 *   ADMIN_EMAIL           account the admin session belongs to (created/promoted on first sign-in)
 */
const schema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
});

const digest = (value: string) => createHash("sha256").update(value).digest();
const sameText = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

function respond(req: NextRequest, body: unknown, status: number, correlationId = generateCorrelationId()) {
  return withCorrelationId(withSecurityHeaders(withCors(NextResponse.json(body, { status }), req.headers.get("origin") ?? undefined)), correlationId);
}

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return respond(req, { status: "error", code: "validation_error", message: "Enter your username and password." }, 400);

  const ip = getClientIp(req);
  if (!checkRateLimit(`admin-login:${ip}`, 5, 10 * 60_000)) {
    return respond(req, { status: "error", code: "rate_limit", message: "Too many attempts. Try again in a few minutes." }, 429);
  }

  // Accept the bcrypt hash as-is ("$2…") or base64-encoded, which survives .env `$` expansion.
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  const hash = raw && !raw.startsWith("$2") ? Buffer.from(raw, "base64").toString("utf8") : raw;
  if (!hash) return respond(req, { status: "error", code: "not_configured", message: "Admin sign-in isn't configured on the server yet." }, 503);

  const expected = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const userOk = sameText(parsed.data.username.toLowerCase(), expected);
  // Always run bcrypt so a wrong username takes as long as a wrong password.
  const passOk = await bcrypt.compare(parsed.data.password, hash);

  if (!userOk || !passOk) {
    const correlationId = generateCorrelationId();
    await logAuth({
      event: "auth.login.failed",
      method: req.method,
      route: "/api/auth/admin-login",
      status: 401,
      code: "invalid_credentials",
      ip,
      userAgent: req.headers.get("user-agent") ?? null,
      correlationId,
    });
    return respond(req, { status: "error", code: "invalid_credentials", message: "Wrong username or password." }, 401, correlationId);
  }

  try {
    const email = (process.env.ADMIN_EMAIL || "admin@voxlatesn.in").trim().toLowerCase();
    const account = await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: { name: process.env.ADMIN_NAME || "Admin", email, password: hash, role: "ADMIN" },
      select: { id: true, name: true, email: true },
    });
    const res = respond(req, { status: "success", data: { name: account.name, role: "ADMIN" } }, 200);
    await attachSessionCookie(res, { id: account.id, email: account.email, name: account.name, role: "ADMIN" });
    return res;
  } catch {
    return respond(req, { status: "error", code: "server_error", message: "Something went wrong. Please try again." }, 503);
  }
}

export async function OPTIONS(req: NextRequest) {
  return withSecurityHeaders(withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin") ?? undefined));
}
