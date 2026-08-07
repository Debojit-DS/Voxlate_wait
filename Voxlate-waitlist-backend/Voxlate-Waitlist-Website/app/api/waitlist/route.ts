import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { waitlistSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    const res = NextResponse.json(
      { status: "error", message: "Email is required." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const normalizedEmail = email.toLowerCase().trim();
  const entry = await prisma.waitlistEntry.findUnique({
    where: { email: normalizedEmail },
  });

  const res = NextResponse.json({
    status: "success",
    data: { joined: !!entry },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

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

  const parsed = waitlistSchema.safeParse(body);
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

  const { name, email, company, type, product, source } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const entry = await prisma.waitlistEntry.create({
      data: {
        name,
        email: normalizedEmail,
        company: company || null,
        type,
        product,
        source: source || null,
      },
    });

    const position = await prisma.waitlistEntry.count({
      where: { createdAt: { lte: entry.createdAt } },
    });

    const res = NextResponse.json(
      {
        status: "success",
        message: "You have been added to the waitlist.",
        data: { id: entry.id, email: entry.email, position },
      },
      { status: 201 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const res = NextResponse.json(
        {
          status: "error",
          code: "duplicate_email",
          message: "This email is already on the waitlist.",
        },
        { status: 409 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    console.error("waitlist submit error");
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
