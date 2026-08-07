import { NextResponse } from "next/server";
import { getSecurityHeaders } from "./securityHeaders";

const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export function corsHeaders(origin?: string) {
  const allowedOrigin = origin === FRONTEND_ORIGIN ? origin : FRONTEND_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function withCors(response: NextResponse, origin?: string): NextResponse {
  const headers = corsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function withSecurityHeaders(response: NextResponse): NextResponse {
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export function withCorrelationId(response: NextResponse, correlationId: string): NextResponse {
  response.headers.set("X-Correlation-ID", correlationId);
  return response;
}
