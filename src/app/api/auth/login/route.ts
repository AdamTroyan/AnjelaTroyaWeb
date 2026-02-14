import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAuthCookie, createAuthToken, verifyPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { assertSameOriginFromRequest } from "@/lib/csrf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`login:${clientIp}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  if (email.length > 254 || password.length > 200) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.isActive) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAuthToken(user.id, user.role, user.tokenVersion);
  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(buildAuthCookie(token));

  return response;
}
