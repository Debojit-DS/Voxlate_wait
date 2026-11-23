import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../lib/db";
import { GET } from "../app/api/waitlist/route";
import { publicName } from "../lib/publicName";

test("publicName keeps only a first name and last initial", () => {
  assert.equal(publicName("Priya Sharma"), "Priya S.");
  assert.equal(publicName("  ananya  rao  kumar "), "ananya K.");
  assert.equal(publicName("Madonna"), "Madonna");
  assert.equal(publicName(""), "Someone");
  assert.equal(publicName(null), "Someone");
});

test("the public waitlist returns only the total and a few sanitised names", async () => {
  const findMany = prisma.waitlistEntry.findMany;
  const count = prisma.waitlistEntry.count;
  let take: number | undefined;
  let select: unknown;
  try {
    prisma.waitlistEntry.findMany = (async (args: { take: number; select: unknown }) => {
      take = args.take;
      select = args.select;
      return [{ name: "Priya Sharma", createdAt: new Date("2026-11-20T00:00:00Z") }];
    }) as unknown as typeof findMany;
    prisma.waitlistEntry.count = (async () => 125) as unknown as typeof count;

    const res = await GET(new NextRequest("http://api.example/api/waitlist?page=3&pageSize=50"));
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(take, 8, "never more than 8 names");
    assert.deepEqual(select, { name: true, createdAt: true }, "no photo, email, role or organisation is read");
    assert.equal(body.pagination.total, 125);
    assert.deepEqual(Object.keys(body.data[0]).sort(), ["createdAt", "name"]);
    assert.equal(body.data[0].name, "Priya S.");
  } finally {
    prisma.waitlistEntry.findMany = findMany;
    prisma.waitlistEntry.count = count;
  }
});
