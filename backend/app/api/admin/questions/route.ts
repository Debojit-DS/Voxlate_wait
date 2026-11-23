import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { paginationParams } from "@/lib/pagination";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

/** Admin: questions sent from the homepage, newest first. */
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin") ?? undefined;
  const session = await requireAdmin();
  if (!session) {
    return withCorrelationId(withSecurityHeaders(withCors(NextResponse.json({ status: "error", message: "Forbidden." }, { status: 403 }), origin)), generateCorrelationId());
  }

  const { searchParams } = new URL(req.url);
  const { page, pageSize } = paginationParams(searchParams, 25, 100);
  const [questions, total] = await Promise.all([
    prisma.question.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.question.count(),
  ]);

  const res = NextResponse.json({
    status: "success",
    data: questions,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res, origin)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  return withSecurityHeaders(withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin") ?? undefined));
}
