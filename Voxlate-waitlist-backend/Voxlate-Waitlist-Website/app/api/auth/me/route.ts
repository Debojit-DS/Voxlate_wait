import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { verifySession } from "@/lib/auth";

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

  const res = NextResponse.json({
    status: "success",
    data: {
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = NextResponse.text("", { status: 204 });
  return withSecurityHeaders(withCors(res, origin));
}
