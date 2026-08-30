import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    const res = NextResponse.json(
      { status: "error", message: "Forbidden." },
      { status: 403 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.isNaN(Number(searchParams.get("page"))) ? 1 : Number(searchParams.get("page")));
  const pageSize = Math.min(100, Math.max(1, Number.isNaN(Number(searchParams.get("pageSize"))) ? 25 : Number(searchParams.get("pageSize"))));
  const search = searchParams.get("search")?.trim();

  const where: { fullName?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" }; college?: { contains: string; mode: "insensitive" } } = {};
  if (search) {
    where.fullName = { contains: search, mode: "insensitive" };
    where.email = { contains: search, mode: "insensitive" };
    where.college = { contains: search, mode: "insensitive" };
  }

  const [applications, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.jobApplication.count({ where }),
  ]);

  const res = NextResponse.json({
    status: "success",
    data: applications,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
