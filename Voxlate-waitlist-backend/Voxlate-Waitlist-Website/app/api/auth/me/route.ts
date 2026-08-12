import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updatePhotoSchema = z.object({
  photo: z.string().optional(),
}).refine((data) => {
  if (data.photo && !data.photo.startsWith("data:image/") && !data.photo.startsWith("http")) {
    return false;
  }
  return true;
}, {
  message: "Invalid photo format",
  path: ["photo"],
});

export async function GET(req: NextRequest) {
  const token = req.cookies.get("voxlate_session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const res = NextResponse.json(
      { status: "error", code: "unauthorized", message: "Not signed in." },
      { status: 401 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { photoUrl: true },
  });

  const res = NextResponse.json({
    status: "success",
    data: {
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
      ...(user?.photoUrl ? { photoUrl: user.photoUrl } : {}),
    },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("voxlate_session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const res = NextResponse.json(
      { status: "error", code: "unauthorized", message: "Not signed in." },
      { status: 401 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

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

  const parsed = updatePhotoSchema.safeParse(body);
  if (!parsed.success) {
    const res = NextResponse.json(
      {
        status: "error",
        code: "validation_error",
        message: "Invalid photo format.",
      },
      { status: 400 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const { photo } = parsed.data;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.sub },
      data: { photoUrl: photo || null },
      select: { id: true, name: true, email: true, photoUrl: true },
    });

    const res = NextResponse.json({
      status: "success",
      message: "Profile photo updated.",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        ...(updatedUser.photoUrl ? { photoUrl: updatedUser.photoUrl } : {}),
      },
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    console.error("update photo error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
}
