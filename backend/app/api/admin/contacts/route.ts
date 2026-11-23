import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { paginationParams } from "@/lib/pagination";
import { adminJson, adminOptions, asAdmin } from "@/lib/adminRoute";

const KINDS = ["customer", "freelancer", "investor"];

/** Admin: contact-page messages, newest first. `?kind=investor` filters; DELETE `?id=` removes one. */
export async function GET(req: NextRequest) {
  return asAdmin(req, async () => {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = paginationParams(searchParams, 25, 100);
    const kind = searchParams.get("kind");
    const where = kind && KINDS.includes(kind) ? { kind } : {};
    const [data, total] = await Promise.all([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.contactMessage.count({ where }),
    ]);
    return adminJson(req, { status: "success", data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  });
}

export async function DELETE(req: NextRequest) {
  return asAdmin(req, async () => {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !/^[a-f0-9]{24}$/i.test(id)) return adminJson(req, { status: "error", message: "A valid id is required." }, 400);
    await prisma.contactMessage.delete({ where: { id } });
    return adminJson(req, { status: "success" });
  });
}

export const OPTIONS = adminOptions;
