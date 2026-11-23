import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../lib/db";
import { POST as ask } from "../app/api/questions/route";

let ip = 0;
function askRequest(body: unknown) {
  ip += 1;
  return new NextRequest("http://api.example/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `198.51.100.${ip}` },
    body: JSON.stringify(body),
  });
}
const valid = { name: "  Fixture Person ", email: " Fixture@Example.invalid ", question: "  Does the earpiece work offline?  " };

test("a valid question is stored trimmed with a normalised email", async () => {
  const original = prisma.question.create;
  let stored: unknown;
  try {
    prisma.question.create = (async ({ data }: { data: unknown }) => {
      stored = data;
      return { id: "fixture-question" };
    }) as unknown as typeof original;
    const res = await ask(askRequest(valid));
    assert.equal(res.status, 201);
    assert.deepEqual(stored, { name: "Fixture Person", email: "fixture@example.invalid", question: "Does the earpiece work offline?", source: "homepage" });
  } finally {
    prisma.question.create = original;
  }
});

test("invalid input is rejected with field errors and nothing is stored", async () => {
  const original = prisma.question.create;
  let called = false;
  try {
    prisma.question.create = (async () => {
      called = true;
    }) as unknown as typeof original;
    const res = await ask(askRequest({ name: "", email: "not-an-email", question: "short" }));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, "validation_error");
    assert.ok(body.errors.name && body.errors.email && body.errors.question);
    assert.equal(called, false);
  } finally {
    prisma.question.create = original;
  }
});

test("the honeypot answers success without storing", async () => {
  const original = prisma.question.create;
  let called = false;
  try {
    prisma.question.create = (async () => {
      called = true;
    }) as unknown as typeof original;
    const res = await ask(askRequest({ ...valid, website: "http://spam.invalid" }));
    assert.equal(res.status, 201);
    assert.equal(called, false);
  } finally {
    prisma.question.create = original;
  }
});

test("a database outage returns 503", async () => {
  const original = prisma.question.create;
  try {
    prisma.question.create = (async () => {
      throw new Error("fixture outage");
    }) as unknown as typeof original;
    const res = await ask(askRequest(valid));
    assert.equal(res.status, 503);
  } finally {
    prisma.question.create = original;
  }
});
