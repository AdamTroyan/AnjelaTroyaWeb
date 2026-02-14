import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { assertSameOriginFromRequest } from "@/lib/csrf";

function parseNumber(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }
  const normalized = String(value).replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`alerts:create:${clientIp}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const type = body?.type === "SALE" || body?.type === "RENT" ? body.type : null;
  const minPrice = parseNumber(body?.minPrice);
  const maxPrice = parseNumber(body?.maxPrice);
  const minRooms = parseNumber(body?.minRooms);
  const consentSource = typeof body?.consentSource === "string" ? body.consentSource.trim() : "";

  if (!email || !isValidEmail(email) || !type) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") || null;
  const consentIp = clientIp || null;

  const alert = await prisma.propertyAlert.create({
    data: {
      email,
      type,
      minPrice,
      maxPrice,
      minRooms,
      consentAt: new Date(),
      consentIp,
      consentUserAgent: userAgent,
      consentSource: consentSource || "alerts-form",
    },
  });

  return Response.json({ id: alert.id });
}
