import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rate = await checkRateLimit(`alerts:unsubscribe:${clientIp}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfter) },
    });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  // Redirect GET to the confirmation page — never delete on GET
  return Response.redirect(
    new URL(`/unsubscribe?token=${encodeURIComponent(token)}`, url.origin),
    302
  );
}
