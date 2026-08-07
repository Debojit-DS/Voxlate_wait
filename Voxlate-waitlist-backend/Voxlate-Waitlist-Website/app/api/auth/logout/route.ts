import { NextRequest, NextResponse } from "next/server";
import { withCors, withSecurityHeaders } from "@/lib/cors";
import { clearSessionCookie, verifySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("voxlate_session")?.value;
  const session = token ? await verifySession(token) : null;

  const res = NextResponse.json({ status: "success", message: "Signed out." });
  clearSessionCookie(res);
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = NextResponse.text("", { status: 204 });
  return withSecurityHeaders(withCors(res, origin));
}
