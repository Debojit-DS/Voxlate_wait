import { NextRequest, NextResponse } from "next/server";
import { withCors, withSecurityHeaders, withCorrelationId } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

function toCsvValue(value: string | null | undefined): string {
  const v = value ?? "";
  if (/[",\r\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

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
  const pageSize = Math.min(500, Math.max(1, Number.isNaN(Number(searchParams.get("pageSize"))) ? 100 : Number(searchParams.get("pageSize"))));

  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const header = ["Name", "Email", "Company", "Type", "Product", "Source", "Joined At"];
  const rows = entries.map((e: (typeof entries)[number]) =>
    [
      toCsvValue(e.name),
      toCsvValue(e.email),
      toCsvValue(e.company),
      toCsvValue(e.type),
      toCsvValue(e.product),
      toCsvValue(e.source),
      e.createdAt.toISOString(),
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  const filename = `waitlist-export-${new Date().toISOString().slice(0, 10)}.csv`;
  const res = new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
  return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204 });
  return withSecurityHeaders(withCors(res, origin ?? undefined));
}
