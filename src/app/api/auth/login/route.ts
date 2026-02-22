import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAuthCookie, createAuthToken, verifyPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { assertSameOriginFromRequest } from "@/lib/csrf";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || "";
const MAX_LOGIN_ATTEMPTS = 5;

function getSmtpConfigSafe() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : NaN;
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !Number.isFinite(port) || !user || !pass || !from) {
    return null;
  }

  return { host, port, secure, user, pass, from };
}

function getPasswordHint(password: string) {
  return password ? "(provided)" : "(empty)";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function recordFailedAttempt(params: {
  email: string;
  ip: string;
  passwordHint: string;
}) {
  const attempt = await prisma.loginAttempt.upsert({
    where: { email_ip: { email: params.email, ip: params.ip } },
    create: {
      email: params.email,
      ip: params.ip,
      count: 1,
      firstAttemptAt: new Date(),
      lastAttemptAt: new Date(),
      lastPasswordHint: params.passwordHint,
    },
    update: {
      count: { increment: 1 },
      lastAttemptAt: new Date(),
      lastPasswordHint: params.passwordHint,
    },
  });

  if (attempt.count < MAX_LOGIN_ATTEMPTS) {
    return { blocked: false };
  }

  const token = crypto.randomUUID();
  await prisma.loginBlock.create({
    data: {
      email: params.email,
      ip: params.ip,
      token,
      lastPasswordHint: params.passwordHint,
    },
  });
  await prisma.loginAttempt.delete({
    where: { email_ip: { email: params.email, ip: params.ip } },
  });

  const smtp = getSmtpConfigSafe();
  if (smtp) {
    const siteUrl = getSiteUrl() || "https://anjelatroya.co.il";
    const unblockUrl = `${siteUrl.replace(/\/$/, "")}/admin/unblock?token=${token}`;
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });

    await transporter.sendMail({
      from: smtp.from,
      to: ADMIN_ALERT_EMAIL,
      subject: "חסימת התחברות - 5 ניסיונות כושלים",
      text: [
        "זוהתה חסימת התחברות לאחר 5 ניסיונות כושלים.",
        `אימייל: ${params.email}`,
        `IP: ${params.ip}`,
        `סיסמה (רמז): ${params.passwordHint}`,
        `קישור לביטול חסימה: ${unblockUrl}`,
      ].join("\n"),
      html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
                <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:12px;color:#64748b;">ANJELA TROYA | תיווך נדל&quot;ן באשקלון</p>
                  <h1 style="margin:8px 0 0;font-size:18px;color:#0f172a;">חסימת התחברות</h1>
                </div>
                <div style="padding:20px 24px;">
                  <p style="margin:0 0 6px;color:#0f172a;font-size:14px;font-weight:600;">זוהתה חסימה לאחר 5 ניסיונות כושלים</p>
                  <p style="margin:10px 0 6px;color:#64748b;font-size:12px;">פרטי הניסיון</p>
                  <table style="width:100%;border-collapse:collapse;">
                    <tr>
                      <td style="padding:6px 0;color:#64748b;font-size:12px;">אימייל</td>
                      <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(params.email)}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#64748b;font-size:12px;">IP</td>
                      <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(params.ip)}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#64748b;font-size:12px;">סיסמה (רמז)</td>
                      <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(params.passwordHint)}</td>
                    </tr>
                  </table>
                  <div style="margin-top:16px;text-align:center;">
                    <a href="${unblockUrl}" style="display:inline-block;padding:10px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;">ביטול חסימה</a>
                  </div>
                  <p style="margin:12px 0 0;color:#94a3b8;font-size:11px;text-align:center;">הלחצן מבטל חסימה עבור האימייל וה-IP שנחסמו</p>
                </div>
              </div>
            </div>`,
    });
  }

  return { blocked: true };
}

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const loginRateLimit = process.env.NODE_ENV === "production" ? 5 : 20;
  {
    const clientIp = getClientIp(request);
    const rate = await checkRateLimit(`login:${clientIp}`, { limit: loginRateLimit, windowMs: 10 * 60 * 1000 });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many attempts" },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
      );
    }
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    adminLogin?: boolean;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const adminLogin = Boolean(body?.adminLogin);
  const passwordHint = getPasswordHint(password);

  if (email.length > 254 || password.length > 200) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const clientIp = getClientIp(request);
  if (adminLogin) {
    const existingBlock = await prisma.loginBlock.findFirst({
      where: { OR: [{ email }, { ip: clientIp }] },
    });
    if (existingBlock) {
      return NextResponse.json({ error: "blocked" }, { status: 403 });
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, isActive: true, passwordHash: true, tokenVersion: true },
  });
  if (!user?.isActive) {
    if (adminLogin) {
      const result = await recordFailedAttempt({ email, ip: clientIp, passwordHint });
      if (result.blocked) {
        return NextResponse.json({ error: "blocked" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (adminLogin && user.role !== "ADMIN") {
    const result = await recordFailedAttempt({ email, ip: clientIp, passwordHint });
    if (result.blocked) {
      return NextResponse.json({ error: "blocked" }, { status: 403 });
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    if (adminLogin) {
      const result = await recordFailedAttempt({ email, ip: clientIp, passwordHint });
      if (result.blocked) {
        return NextResponse.json({ error: "blocked" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (adminLogin) {
    await prisma.loginAttempt.deleteMany({ where: { email, ip: clientIp } });
  }

  const token = await createAuthToken(user.id, user.role, user.tokenVersion);
  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(buildAuthCookie(token));

  return response;
}
