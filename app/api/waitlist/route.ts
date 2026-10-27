import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server/mongodb";
import { waitlistSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const db = await getDb();
    const collection = db.collection("waitlist_entries");

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const entry = await collection.findOne({ email: normalizedEmail });

      return NextResponse.json(
        {
          status: "success",
          data: { joined: !!entry },
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));
    const skip = (page - 1) * pageSize;

    const [entries, total] = await Promise.all([
      collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      collection.countDocuments(),
    ]);

    const formatted = entries.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name ?? "",
      role: doc.role || null,
      organization: doc.organization || doc.company || null,
      photoUrl: doc.photoUrl || null,
      createdAt:
        doc.createdAt instanceof Date
          ? doc.createdAt.toISOString()
          : typeof doc.createdAt === "string"
          ? doc.createdAt
          : new Date().toISOString(),
      type: doc.type ?? "individual",
      product: doc.product ?? "both",
    }));

    return NextResponse.json(
      {
        status: "success",
        data: formatted,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Waitlist GET error:", err);
    return NextResponse.json(
      {
        status: "error",
        code: "server_error",
        message: "The waitlist is temporarily unavailable.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req: NextRequest) {
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

