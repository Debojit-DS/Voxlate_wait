const MAX_BODY_BYTES = 16 * 1024 * 1024;

function failure(status: number, code: string, message: string) {
  return Response.json({ status: "error", code, message }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Rewrites one backend Set-Cookie for the website the browser is actually on (the backend lives on
 * another host, so its cookies must land on the site to be sent back through this proxy).
 *
 * - A `Domain` that covers the site is kept; any other `Domain` is removed so the cookie is host-only.
 * - A deletion aimed at another domain is dropped. Made host-only it would delete the site's own cookie
 *   of the same name: the backend sets the new session and then clears a legacy `.voxlatesn.in` one,
 *   and forwarding that clear wiped the fresh session, so admin sign-in never stuck.
 * - Over plain http (local development) `Secure` is removed, and `SameSite=None`, which browsers accept
 *   only together with `Secure`, becomes `Lax` (the site and its /api are same-origin anyway).
 */
export function siteCookie(cookie: string, site: URL): string | null {
  const [pair, ...attributes] = cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!pair) return null;
  const host = site.hostname.toLowerCase();
  const plainHttp = site.protocol !== "https:";
  const kept: string[] = [];
  let foreignDomain = false;
  let deletion = false;
  for (const attribute of attributes) {
    const separator = attribute.indexOf("=");
    const key = (separator < 0 ? attribute : attribute.slice(0, separator)).trim().toLowerCase();
    const value = separator < 0 ? "" : attribute.slice(separator + 1).trim();
    if (key === "domain") {
      const domain = value.replace(/^\./, "").toLowerCase();
      if (domain && (host === domain || host.endsWith(`.${domain}`))) kept.push(attribute);
      else foreignDomain = true;
      continue;
    }
    if (key === "max-age" && Number(value) <= 0) deletion = true;
    if (key === "expires" && Date.parse(value) <= Date.now()) deletion = true;
    if (plainHttp && key === "secure") continue;
    if (plainHttp && key === "samesite" && value.toLowerCase() === "none") {
      kept.push("SameSite=Lax");
      continue;
    }
    kept.push(attribute);
  }
  if (foreignDomain && deletion) return null;
  return [pair, ...kept].join("; ");
}

export function getApiBase(env: NodeJS.ProcessEnv = process.env): URL {
  const configured = env.API_BASE_URL || env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured && env.NODE_ENV === "production") throw new Error("API_BASE_URL is required.");
  const url = new URL(configured || "http://localhost:3001");
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("Invalid API_BASE_URL.");
  const loopback = ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(url.hostname);
  if (env.NODE_ENV === "production" && loopback && env.ALLOW_LOCAL_API_IN_PRODUCTION !== "1") throw new Error("A deployed API URL is required.");
  return url;
}

export async function proxyApiRequest(request: Request, env: NodeJS.ProcessEnv = process.env): Promise<Response> {
  let base: URL;
  try { base = getApiBase(env); } catch {
    return failure(503, "service_unavailable", "The service isn't configured. Please try again later.");
  }
  const incoming = new URL(request.url);
  const prefix = base.pathname.replace(/\/$/, "");
  const pathname = prefix.endsWith("/api") ? incoming.pathname.slice(4) : incoming.pathname;
  const target = new URL(base.origin + prefix + pathname + incoming.search);
  if (target.origin === incoming.origin && target.pathname === incoming.pathname) return failure(503, "service_unavailable", "The service isn't configured correctly.");

  const headers = new Headers();
  for (const key of ["accept", "content-type", "cookie", "authorization", "origin", "user-agent", "x-correlation-id", "x-forwarded-for", "x-real-ip"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));

  const timeoutMs = Math.min(60_000, Math.max(100, Number(env.API_TIMEOUT_MS) || 30_000));
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]);
  try {
    let body: Uint8Array | undefined;
    if (request.body && !["GET", "HEAD"].includes(request.method)) {
      if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return failure(413, "payload_too_large", "The upload is too large.");
      const reader = request.body.getReader();
      const onAbort = () => { void reader.cancel(); };
      signal.addEventListener("abort", onAbort, { once: true });
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        signal.throwIfAborted();
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > MAX_BODY_BYTES) { await reader.cancel(); return failure(413, "payload_too_large", "The upload is too large."); }
        chunks.push(value);
      }
      signal.removeEventListener("abort", onAbort);
      signal.throwIfAborted();
      body = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
    }
    const upstream = await fetch(target, { method: request.method, headers, body: body as BodyInit | undefined, signal, cache: "no-store", redirect: "manual" });
    if (!upstream.ok && !upstream.headers.get("content-type")?.includes("application/json")) {
      await upstream.body?.cancel();
      return failure(upstream.status >= 400 ? upstream.status : 502, "service_unavailable", "The service is unavailable. Please try again.");
    }
    const responseHeaders = new Headers(upstream.headers);
    for (const key of ["connection", "keep-alive", "transfer-encoding", "content-encoding", "content-length", "set-cookie", "access-control-allow-origin", "access-control-allow-credentials"]) responseHeaders.delete(key);
    for (const cookie of upstream.headers.getSetCookie()) {
      const forSite = siteCookie(cookie, incoming);
      if (forSite) responseHeaders.append("Set-Cookie", forSite);
    }
    responseHeaders.set("Cache-Control", "no-store");
    const noBody = request.method === "HEAD" || [204, 304].includes(upstream.status);
    const responseBody = noBody ? null : await upstream.arrayBuffer();
    return new Response(responseBody, { status: upstream.status, headers: responseHeaders });
  } catch {
    return failure(signal.aborted ? 504 : 502, "service_unavailable", signal.aborted ? "The service took too long. Please try again." : "Couldn't reach the service. Please try again.");
  }
}
