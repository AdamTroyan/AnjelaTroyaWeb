import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { buildLogoutCookie, COOKIE_NAME, getUserFromRequestCookie } from "@/lib/auth";
import { assertSameOriginFromRequest } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`logout:${clientIp}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    const user = await getUserFromRequestCookie(token);
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { tokenVersion: user.tokenVersion + 1 },
      });
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(buildLogoutCookie());
  response.cookies.delete(COOKIE_NAME);

  response.headers.set("Cache-Control", "no-store");

  return response;
}
