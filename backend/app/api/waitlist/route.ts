import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { waitlistSchema } from "@/lib/validation";
import { resend } from "@/lib/resend";
import { publicName, PUBLIC_RECENT_LIMIT } from "@/lib/publicName";

/**
 * Public waitlist info. `?email=` answers "has this person joined?" (used by the demo gate);
 * otherwise only the total and a few recent "First L." names are returned. The member list itself
 * is private and only available to admins (GET /api/admin/waitlist).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const entry = await prisma.waitlistEntry.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
      const res = NextResponse.json({ status: "success", data: { joined: !!entry } });
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    const limit = Math.min(PUBLIC_RECENT_LIMIT, Math.max(1, parseInt(searchParams.get("pageSize") ?? "", 10) || PUBLIC_RECENT_LIMIT));
    const [recent, total] = await Promise.all([
      prisma.waitlistEntry.findMany({ select: { name: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: limit }),
      prisma.waitlistEntry.count(),
    ]);

    const res = NextResponse.json({
      status: "success",
      data: recent.map((entry) => ({ name: publicName(entry.name), createdAt: entry.createdAt })),
      pagination: { page: 1, pageSize: limit, total, totalPages: 1 },
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch {
    return withSecurityHeaders(NextResponse.json({ status: "error", code: "server_error", message: "The waitlist is temporarily unavailable." }, { status: 503 }));
  }
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

  const { name, email, company, type, product, source, role, organization, photo } = parsed.data;
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
        role: role || null,
        organization: organization || null,
        photoUrl: photo || null,
      },
    });

    if (process.env.RESEND_API_KEY) {
      const firstName = name.trim().split(" ")[0] || name.trim();
      try {
        await resend.contacts.create({
          email: normalizedEmail,
          firstName,
        });
      } catch (err) {
        console.error("Resend contact sync failed", err);
      }
    }

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
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
