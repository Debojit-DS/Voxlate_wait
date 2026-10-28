import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "success",
    service: "voxlate-backend",
    version: "0.1.0",
    message: "Voxlate Backend & API services are running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      waitlist: "/api/waitlist",
      admin: "/api/admin",
      careers: "/api/careers",
      upload: "/api/upload",
      reviews: "/api/reviews",
    },
  });
}

