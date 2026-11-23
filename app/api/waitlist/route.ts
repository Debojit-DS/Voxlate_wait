import { NextRequest, NextResponse } from "next/server";
import { proxyApiRequest } from "@/lib/server/apiProxy";
import { getDb } from "@/lib/server/mongodb";
import { waitlistSchema } from "@/lib/validation";
import { publicName, PUBLIC_NAMES_LIMIT, PUBLIC_RECENT_LIMIT } from "@/lib/publicName";

export const dynamic = "force-dynamic";

/**
 * Public waitlist info (same contract as the backend): `?email=` checks membership; otherwise
 * the total and a few recent "First L." names, plus `names` (every member as "First L.", no dates)
 * with `?names=all`. Never names in full, photos, roles or companies.
 */
export async function GET(req: NextRequest) {
  if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
    return proxyApiRequest(req);
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const db = await getDb();
    const collection = db.collection("waitlist_entries");

    if (email) {
      const entry = await collection.findOne({ email: email.toLowerCase().trim() }, { projection: { _id: 1 } });
      return NextResponse.json({ status: "success", data: { joined: !!entry } }, { headers: { "Cache-Control": "no-store" } });
    }

    const limit = Math.min(PUBLIC_RECENT_LIMIT, Math.max(1, parseInt(searchParams.get("pageSize") ?? "", 10) || PUBLIC_RECENT_LIMIT));
    const everyone = searchParams.get("names") === "all";
    const [recent, total, all] = await Promise.all([
      collection.find({}, { projection: { name: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(limit).toArray(),
      collection.countDocuments(),
      everyone
        ? collection.find({}, { projection: { _id: 0, name: 1 } }).sort({ createdAt: -1 }).limit(PUBLIC_NAMES_LIMIT).toArray()
        : Promise.resolve(null),
    ]);

    return NextResponse.json(
      {
        status: "success",
        data: recent.map((doc) => ({
          name: publicName(doc.name),
          createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : typeof doc.createdAt === "string" ? doc.createdAt : null,
        })),
        pagination: { page: 1, pageSize: limit, total, totalPages: 1 },
        ...(all ? { names: all.map((doc) => publicName(doc.name)) } : {}),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Waitlist GET error:", err);
    return NextResponse.json(
      { status: "error", code: "server_error", message: "The waitlist is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
    return proxyApiRequest(req);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", code: "validation_error", message: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    return NextResponse.json(
      {
        status: "error",
        code: "validation_error",
        message: "Please check the form for errors.",
        errors,
      },
      { status: 400 }
    );
  }

  const { name, email, company, type, product, source, role, organization, photo } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const db = await getDb();
    const collection = db.collection("waitlist_entries");

    // Check duplicate
    const existing = await collection.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        {
          status: "error",
          code: "duplicate_email",
          message: "This email is already on the waitlist.",
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const insertResult = await collection.insertOne({
      name,
      email: normalizedEmail,
      company: company || null,
      type,
      product,
      source: source || null,
      role: role || null,
      organization: organization || null,
      photoUrl: photo || null,
      createdAt: now,
    });

    const position = await collection.countDocuments({
      createdAt: { $lte: now },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "You have been added to the waitlist.",
        data: {
          id: insertResult.insertedId.toString(),
          email: normalizedEmail,
          position,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Waitlist POST error:", err);
    return NextResponse.json(
      { status: "error", code: "server_error", message: "Something went wrong." },
      { status: 500 }
    );
  }
}

