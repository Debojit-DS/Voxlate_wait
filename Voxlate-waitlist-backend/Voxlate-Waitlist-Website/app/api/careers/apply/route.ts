import { NextRequest, NextResponse } from "next/server";
import { withCors, withCorrelationId, withSecurityHeaders } from "@/lib/cors";
import { generateCorrelationId } from "@/lib/correlationId";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      contactNumber,
      college,
      currentYear,
      roleAppliedFor,
      strongestSkills,
      motivation,
      projectDetails,
      proposedIdea,
      uniqueEdge,
      portfolioLinks,
      resumeUrl,
    } = body as {
      fullName: string;
      email: string;
      contactNumber: string;
      college: string;
      currentYear: string;
      roleAppliedFor: string;
      strongestSkills: string;
      motivation: string;
      projectDetails?: string;
      proposedIdea: string;
      uniqueEdge: string;
      portfolioLinks?: string;
      resumeUrl: string;
    };

    if (!fullName || !email || !contactNumber || !college || !currentYear || !roleAppliedFor || !strongestSkills || !motivation || !proposedIdea || !uniqueEdge || !resumeUrl) {
      const res = NextResponse.json(
        { status: "error", code: "validation_error", message: "All required fields must be provided." },
        { status: 400 }
      );
      return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
    }

    const application = await prisma.jobApplication.create({
      data: {
        fullName,
        email,
        contactNumber,
        college,
        currentYear,
        roleAppliedFor,
        strongestSkills,
        motivation,
        projectDetails,
        proposedIdea,
        uniqueEdge,
        portfolioLinks,
        resumeUrl,
      },
    });

    const res = NextResponse.json({
      status: "success",
      data: { id: application.id },
    });
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  } catch (err) {
    console.error("Job application submission error", err);
    const res = NextResponse.json(
      { status: "error", code: "server_error", message: "Failed to submit application." },
      { status: 500 }
    );
    return withCorrelationId(withSecurityHeaders(withCors(res)), generateCorrelationId());
  }
}
