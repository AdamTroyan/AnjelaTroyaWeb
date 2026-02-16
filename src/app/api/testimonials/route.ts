import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { assertSameOriginFromRequest } from "@/lib/csrf";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 1200;

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rate = await checkRateLimit(`testimonials:create:${clientIp}`, {
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    firstName?: string;
    lastName?: string;
    message?: string;
    rating?: number;
    hideLastName?: boolean;
    turnstileToken?: string;
  } | null;

  const firstName = body?.firstName?.trim() ?? "";
  const lastName = body?.lastName?.trim() ?? "";
  const message = body?.message?.trim() ?? "";
  const rating = Number(body?.rating);
  const hideLastName = Boolean(body?.hideLastName);
  const turnstileToken = body?.turnstileToken ?? "";

  if (!firstName || !lastName || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (
    firstName.length > MAX_NAME_LENGTH ||
    lastName.length > MAX_NAME_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Captcha failed" }, { status: 400 });
  }

  await prisma.testimonial.create({
    data: {
      firstName,
      lastName,
      hideLastName,
      message,
      rating,
      ip,
    },
  });

  return NextResponse.json({ ok: true });
}
