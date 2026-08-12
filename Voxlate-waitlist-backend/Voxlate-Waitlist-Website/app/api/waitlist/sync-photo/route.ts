import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { z } from "zod";

const syncPhotoSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  photo: z.string().optional(),
}).refine((data) => {
  if (data.photo && !data.photo.startsWith("http") && !data.photo.startsWith("data:image/")) {
    return false;
  }
  return true;
}, {
  message: "Invalid photo format",
  path: ["photo"],
});

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

  const parsed = syncPhotoSchema.safeParse(body);
  if (!parsed.success) {
    const res = NextResponse.json(
      {
        status: "error",
        code: "validation_error",
        message: "Please check your inputs and try again.",
      },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const { email, photo } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const entry = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, photoUrl: true },
    });

    if (!entry) {
      const res = NextResponse.json(
        { status: "success", message: "No waitlist entry found to update." },
        { status: 200 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    if (!entry.photoUrl && photo) {
      await prisma.waitlistEntry.update({
        where: { id: entry.id },
        data: { photoUrl: photo },
      });
    }

    const res = NextResponse.json({
      status: "success",
      message: "Photo synced.",
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    console.error("sync photo error", err);
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
