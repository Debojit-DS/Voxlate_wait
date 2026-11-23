import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "../lib/db";
import { POST as contact } from "../app/api/contact/route";
import { POST as adminLogin } from "../app/api/auth/admin-login/route";

let ip = 0;
function post(path: string, body: unknown) {
  ip += 1;
  return new NextRequest(`http://api.example${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `203.0.113.${ip}` },
    body: JSON.stringify(body),
  });
}

function stubCreate() {
  const original = prisma.contactMessage.create;
  const calls: unknown[] = [];
  prisma.contactMessage.create = (async ({ data }: { data: unknown }) => {
    calls.push(data);
    return { id: "fixture" };
  }) as unknown as typeof original;
  return { calls, restore: () => (prisma.contactMessage.create = original) };
}

test("a customer message is stored with its topic and no investor fields", async () => {
  const stub = stubCreate();
  try {
    const res = await contact(post("/api/contact", { kind: "customer", name: " Fixture ", email: "A@Example.invalid", topic: "Digital version", message: "We run calls in four languages." }));
    assert.equal(res.status, 201);
    assert.deepEqual(stub.calls[0], {
      kind: "customer",
      name: "Fixture",
      email: "a@example.invalid",
      company: null,
      website: null,
      message: "We run calls in four languages.",
      topic: "Digital version",
      stage: null,
    });
  } finally {
    stub.restore();
  }
});

test("an investor message keeps the stage and drops the topic", async () => {
  const stub = stubCreate();
  try {
    const res = await contact(post("/api/contact", { kind: "investor", name: "Fixture", email: "i@example.invalid", stage: "Seed", topic: "ignored", message: "Interested in the seed round." }));
    assert.equal(res.status, 201);
    const stored = stub.calls[0] as Record<string, unknown>;
    assert.equal(stored.stage, "Seed");
    assert.equal(stored.topic, null);
  } finally {
    stub.restore();
  }
});

test("bad input and the honeypot never reach the database", async () => {
  const stub = stubCreate();
  try {
    const bad = await contact(post("/api/contact", { kind: "visitor", name: "", email: "nope", message: "hi" }));
    assert.equal(bad.status, 400);
    const bot = await contact(post("/api/contact", { kind: "customer", name: "Bot", email: "b@example.invalid", message: "Buy cheap things now!", fax: "x" }));
    assert.equal(bot.status, 201);
    assert.equal(stub.calls.length, 0);
  } finally {
    stub.restore();
  }
});

test("admin login accepts only the configured username and password", async () => {
  Object.assign(process.env, {
    JWT_SECRET: "fixture-secret-at-least-32-characters-long",
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD_HASH: await bcrypt.hash("fixture-password", 4),
    ADMIN_EMAIL: "admin@example.invalid",
  });
  const original = prisma.user.upsert;
  try {
    prisma.user.upsert = (async () => ({ id: "507f1f77bcf86cd799439011", name: "Admin", email: "admin@example.invalid" })) as unknown as typeof original;

    const wrongPassword = await adminLogin(post("/api/auth/admin-login", { username: "admin", password: "nope" }));
    assert.equal(wrongPassword.status, 401);
    const wrongUser = await adminLogin(post("/api/auth/admin-login", { username: "root", password: "fixture-password" }));
    assert.equal(wrongUser.status, 401);

    const ok = await adminLogin(post("/api/auth/admin-login", { username: "Admin", password: "fixture-password" }));
    assert.equal(ok.status, 200);
    assert.match(ok.headers.get("set-cookie") ?? "", /voxlate_session=/);
  } finally {
    prisma.user.upsert = original;
  }
});

test("without ADMIN_PASSWORD_HASH the built-in hash is used, so a wrong password is rejected (not a 503)", async () => {
  const saved = process.env.ADMIN_PASSWORD_HASH;
  delete process.env.ADMIN_PASSWORD_HASH;
  try {
    const res = await adminLogin(post("/api/auth/admin-login", { username: "admin", password: "definitely-not-the-password" }));
    assert.equal(res.status, 401);
  } finally {
    process.env.ADMIN_PASSWORD_HASH = saved;
  }
});
