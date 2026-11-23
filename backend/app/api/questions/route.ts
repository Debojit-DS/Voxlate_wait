import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId, getClientIp } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimiter";
import { notifyTeam } from "@/lib/notify";

const questionSchema = z.object({
  name: z.string().trim().min(1, "Your name is required.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  question: z.string().trim().min(10, "Please write at least 10 characters.").max(1000, "Keep it under 1,000 characters."),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().max(500).optional(),
});

function respond(req: NextRequest, body: unknown, status = 200) {
  return withCorrelationId(
    withSecurityHeaders(withCors(NextResponse.json(body, { status }), req.headers.get("origin") ?? undefined)),
    generateCorrelationId(),
  );
}

/**
 * Public: questions an admin has answered and chosen to publish, for the homepage FAQ.
 * Only the question and the answer leave the server — never the asker's name or email.
 */
export async function GET(req: NextRequest) {
  try {
    const rows = await prisma.question.findMany({
      where: { published: true },
      select: { id: true, question: true, answer: true, answeredAt: true },
      orderBy: { answeredAt: "desc" },
      take: 24,
    });
    const faqs = rows.filter((r) => r.answer).map((r) => ({ id: r.id, q: r.question, a: r.answer as string }));
    return respond(req, { status: "success", faqs });
  } catch {
    return respond(req, { status: "error", code: "server_error", message: "Answers are temporarily unavailable." }, 503);
  }
}

export async function POST(req: NextRequest) {
  const parsed = questionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return respond(req, { status: "error", code: "validation_error", message: "Please check the form for errors.", errors }, 400);
  }

  // Bots get a normal-looking success and nothing is stored.
  if (parsed.data.website) return respond(req, { status: "success" }, 201);

  if (!checkRateLimit(`question:${getClientIp(req)}`, 3, 10 * 60_000)) {
    return respond(req, { status: "error", code: "rate_limit", message: "You've sent a few questions already. Please try again in a few minutes." }, 429);
  }

  const { name, email, question } = parsed.data;
  try {
    await prisma.question.create({ data: { name, email, question, source: "homepage" } });
  } catch {
    return respond(req, { status: "error", code: "server_error", message: "Your question couldn't be sent. Please try again." }, 503);
  }

  // Optional email to the team (RESEND_API_KEY + QUESTIONS_NOTIFY_EMAIL).
  await notifyTeam(process.env.QUESTIONS_NOTIFY_EMAIL, `New question from ${name}`, `${question}\n\n— ${name} <${email}>\nReply to this email to answer.`, email);
  return respond(req, { status: "success" }, 201);
}

export async function OPTIONS(req: NextRequest) {
  return withSecurityHeaders(withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin") ?? undefined));
}
