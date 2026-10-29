import { proxyApiRequest } from "@/lib/server/apiProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = (request: Request) => proxyApiRequest(request);
export const OPTIONS = (request: Request) => proxyApiRequest(request);

