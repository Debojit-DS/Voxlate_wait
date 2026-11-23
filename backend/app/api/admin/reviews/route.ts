import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { paginationParams } from "@/lib/pagination";
import { adminJson, adminOptions, asAdmin } from "@/lib/adminRoute";

/** Admin: every review including the author's account email; DELETE `?id=` removes one. */
export async function GET(req: NextRequest) {
  return asAdmin(req, async () => {
    const { page, pageSize } = paginationParams(new URL(req.url).searchParams, 25, 100);
    const [data, total] = await Promise.all([
      prisma.review.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.review.count(),
    ]);
    return adminJson(req, { status: "success", data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  });
}

export async function DELETE(req: NextRequest) {
  return asAdmin(req, async () => {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !/^[a-f0-9]{24}$/i.test(id)) return adminJson(req, { status: "error", message: "A valid id is required." }, 400);
    await prisma.review.delete({ where: { id } });
    return adminJson(req, { status: "success" });
  });
}

export const OPTIONS = adminOptions;
