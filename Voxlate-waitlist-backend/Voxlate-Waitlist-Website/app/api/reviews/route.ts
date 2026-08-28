import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      authorPhotoUrl: true,
      userEmail: true,
      text: true,
      rating: true,
      createdAt: true,
    },
  });

  const res = NextResponse.json({
    status: "success",
    reviews,
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

  const { authorName, authorPhotoUrl, text, rating, userEmail } = body as {
    authorName?: string;
    authorPhotoUrl?: string | null;
    text?: string;
    rating?: number;
    userEmail?: string | null;
  };

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Review text is required." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Rating must be between 1 and 5." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const token = req.cookies.get("voxlate_session")?.value;
  const session = token ? await verifySession(token) : null;

  let finalAuthorName = authorName?.trim();
  let finalUserEmail = userEmail?.trim() ?? session?.email ?? null;

  if (session) {
    if (!finalAuthorName) {
      finalAuthorName = session.name;
    }
    if (!finalUserEmail) {
      finalUserEmail = session.email;
    }
  }

  if (!finalAuthorName) {
    const res = NextResponse.json(
      { status: "error", code: "validation_error", message: "Author name is required." },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  try {
    const review = await prisma.review.create({
      data: {
        authorName: finalAuthorName,
        authorPhotoUrl: authorPhotoUrl ?? null,
        userEmail: finalUserEmail,
        text: text.trim(),
        rating,
      },
      select: {
        id: true,
        authorName: true,
        authorPhotoUrl: true,
        userEmail: true,
        text: true,
        rating: true,
        createdAt: true,
      },
    });

    const res = NextResponse.json(
      {
        status: "success",
        review,
      },
      { status: 201 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    console.error("create review error", err);
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
