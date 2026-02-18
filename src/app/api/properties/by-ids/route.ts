import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { assertSameOriginFromRequest } from "@/lib/csrf";

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rate = await checkRateLimit(`favorites:by-ids:${clientIp}`, { limit: 60, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const rawIds = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];
  const ids = rawIds.slice(0, 100) as string[];

  if (ids.length === 0) {
    return Response.json({ properties: [] });
  }

  const properties = await prisma.property.findMany({
    where: { id: { in: ids }, isActive: true },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrls: true,
      status: true,
      type: true,
      isHot: true,
    },
  });

  return Response.json({ properties });
}
