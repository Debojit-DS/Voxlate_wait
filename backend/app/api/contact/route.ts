import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId, getClientIp } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimiter";
import { notifyTeam } from "@/lib/notify";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || null);

const base = {
  name: z.string().trim().min(1, "Your name is required.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  company: optional(200),
  website: optional(300),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(4000, "Keep it under 4,000 characters."),
  /** Honeypot: hidden from people, filled in by bots. */
  fax: z.string().max(500).optional(),
};

const contactSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.enum(["customer", "freelancer"]), topic: optional(120), ...base }),
  z.object({ kind: z.literal("investor"), stage: optional(120), ...base }),
]);

function respond(req: NextRequest, body: unknown, status = 200) {
  return withCorrelationId(
    withSecurityHeaders(withCors(NextResponse.json(body, { status }), req.headers.get("origin") ?? undefined)),
    generateCorrelationId(),
  );
}

export async function POST(req: NextRequest) {
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return respond(req, { status: "error", code: "validation_error", message: "Please check the form for errors.", errors }, 400);
  }
  const data = parsed.data;
  if (data.fax) return respond(req, { status: "success" }, 201);

  if (!checkRateLimit(`contact:${getClientIp(req)}`, 4, 10 * 60_000)) {
    return respond(req, { status: "error", code: "rate_limit", message: "You've sent a few messages already. Please try again in a few minutes." }, 429);
  }

  const record = {
    kind: data.kind,
    name: data.name,
    email: data.email,
    company: data.company,
    website: data.website,
    message: data.message,
    topic: data.kind === "investor" ? null : data.topic,
    stage: data.kind === "investor" ? data.stage : null,
  };
  try {
    await prisma.contactMessage.create({ data: record });
  } catch {
    return respond(req, { status: "error", code: "server_error", message: "Your message couldn't be sent. Please try again." }, 503);
  }

  const recipients = data.kind === "investor" ? process.env.INVESTOR_NOTIFY_EMAIL || process.env.CONTACT_NOTIFY_EMAIL : process.env.CONTACT_NOTIFY_EMAIL;
  const details = [record.company && `Company: ${record.company}`, record.topic && `Topic: ${record.topic}`, record.stage && `Interest: ${record.stage}`, record.website && `Link: ${record.website}`]
    .filter(Boolean)
    .join("\n");
  await notifyTeam(recipients, `New ${record.kind} message from ${record.name}`, `${record.message}\n\n${details}\n\n— ${record.name} <${record.email}>`, record.email);

  return respond(req, { status: "success" }, 201);
}

export async function OPTIONS(req: NextRequest) {
  return withSecurityHeaders(withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin") ?? undefined));
}
