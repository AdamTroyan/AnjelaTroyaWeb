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
  const rate = await checkRateLimit(`alerts:list:${clientIp}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const unsubscribeToken = typeof body?.unsubscribeToken === "string" ? body.unsubscribeToken.trim() : "";

  if (!email || !isValidEmail(email) || email.length > 254) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  // Require a valid unsubscribeToken belonging to this email to authorize listing
  if (!unsubscribeToken) {
    return Response.json({ error: "Missing authorization token" }, { status: 403 });
  }

  const tokenOwner = await prisma.propertyAlert.findUnique({
    where: { unsubscribeToken },
    select: { email: true },
  });

  if (!tokenOwner || tokenOwner.email !== email) {
    return Response.json({ error: "Invalid authorization" }, { status: 403 });
  }

  const alerts = await prisma.propertyAlert.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      minPrice: true,
      maxPrice: true,
      minRooms: true,
      createdAt: true,
    },
  });

  return Response.json({ alerts });
}
