import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { requireAdmin } from "@/lib/session";

/** JSON response with the standard CORS, security and correlation headers. */
export function adminJson(req: NextRequest, body: unknown, status = 200) {
  return withCorrelationId(
    withSecurityHeaders(withCors(NextResponse.json(body, { status }), req.headers.get("origin") ?? undefined)),
    generateCorrelationId(),
  );
}

/** Runs `handler` only for a signed-in admin; everyone else gets 403. */
export async function asAdmin(req: NextRequest, handler: () => Promise<NextResponse>) {
  if (!(await requireAdmin())) return adminJson(req, { status: "error", message: "Forbidden." }, 403);
  try {
    return await handler();
  } catch {
    return adminJson(req, { status: "error", code: "server_error", message: "Something went wrong." }, 503);
  }
}

export function adminOptions(req: NextRequest) {
  return withSecurityHeaders(withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin") ?? undefined));
}
