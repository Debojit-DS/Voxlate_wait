import { proxyApiRequest } from "@/lib/server/apiProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Explicit route so NextAuth's /api/auth/[...nextauth] doesn't swallow it.
export const POST = (request: Request) => proxyApiRequest(request);
export const OPTIONS = (request: Request) => proxyApiRequest(request);
