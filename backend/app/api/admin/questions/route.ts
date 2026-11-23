import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { paginationParams } from "@/lib/pagination";
import { adminJson, adminOptions, asAdmin } from "@/lib/adminRoute";
import { notifyTeam } from "@/lib/notify";

const ID = /^[a-f0-9]{24}$/i;

/** Admin: questions from the homepage, newest first. `?status=open|answered` filters. */
export async function GET(req: NextRequest) {
  return asAdmin(req, async () => {
    const { searchParams } = new URL(req.url);
    const { page, pageSize } = paginationParams(searchParams, 25, 100);
    const status = searchParams.get("status");
    const where = status === "answered" ? { status: "answered" } : status === "open" ? { status: { not: "answered" } } : {};
    const [data, total] = await Promise.all([
      prisma.question.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.question.count({ where }),
    ]);
    return adminJson(req, { status: "success", data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  });
}

const answerSchema = z.object({
  id: z.string().regex(ID),
  answer: z.string().trim().min(2, "Write an answer first.").max(2000, "Keep the answer under 2,000 characters."),
  /** Show this question and answer in the homepage FAQ. */
  publish: z.boolean().default(true),
  /** Email the answer to the person who asked. */
  notify: z.boolean().default(false),
  /** Optional edit of the question wording before it goes public. */
  question: z.string().trim().min(5).max(300).optional(),
});

/** Admin: answer (or re-answer) a question, choose whether it goes on the website, optionally email the asker. */
export async function PATCH(req: NextRequest) {
  return asAdmin(req, async () => {
    const parsed = answerSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return adminJson(req, { status: "error", code: "validation_error", message: parsed.error.issues[0]?.message ?? "Check the answer." }, 400);
    }
    const { id, answer, publish, notify, question } = parsed.data;
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return adminJson(req, { status: "error", message: "That question no longer exists." }, 404);

    const updated = await prisma.question.update({
      where: { id },
      data: {
        answer,
        published: publish,
        status: "answered",
        answeredAt: existing.answer === answer && existing.answeredAt ? existing.answeredAt : new Date(),
        ...(question ? { question } : {}),
      },
    });

    const emailed = notify
      ? await notifyTeam(
          existing.email,
          "Your question to Voxlate",
          `Hi ${existing.name.split(/\s+/)[0]},\n\nYou asked:\n${existing.question}\n\nOur answer:\n${answer}\n\nThanks for asking,\nThe Voxlate team`,
        )
      : false;

    return adminJson(req, { status: "success", data: updated, emailed });
  });
}

/** Admin: take a question off the website (`?id=&unpublish=1`) or delete it (`?id=`). */
export async function DELETE(req: NextRequest) {
  return asAdmin(req, async () => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !ID.test(id)) return adminJson(req, { status: "error", message: "A valid id is required." }, 400);
    if (searchParams.get("unpublish")) {
      await prisma.question.update({ where: { id }, data: { published: false } });
    } else {
      await prisma.question.delete({ where: { id } });
    }
    return adminJson(req, { status: "success" });
  });
}

export const OPTIONS = adminOptions;
