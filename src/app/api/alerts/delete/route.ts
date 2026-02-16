import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { assertSameOriginFromRequest } from "@/lib/csrf";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rate = await checkRateLimit(`alerts:delete:${clientIp}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!id || !email || !isValidEmail(email)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.propertyAlert.deleteMany({
    where: { id, email },
  });

  return Response.json({ ok: true });
}
