import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { assertSameOriginFromRequest } from "@/lib/csrf";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function getSmtpConfigSafe() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : NaN;
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO || from;

  if (!host || !Number.isFinite(port) || !user || !pass || !from || !to) {
    return null;
  }

  return { host, port, secure, user, pass, from, to };
}

export async function POST(request: Request) {
  const originCheck = assertSameOriginFromRequest(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`contact:${clientIp}`, { limit: 15, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    details?: string;
  };

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const details = body.details?.trim() ?? "";

  if (name.length > 120 || phone.length > 40 || email.length > 254 || details.length > 2000) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!name || !phone || !details) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const smtp = getSmtpConfigSafe();
  if (smtp) {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });

    await transporter.sendMail({
      from: smtp.from,
      to: smtp.to,
      subject: "פנייה חדשה מהאתר",
      text: [
        `שם: ${name}`,
        `טלפון: ${phone}`,
        `אימייל: ${email || "ללא"}`,
        "",
        details,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
          <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#64748b;">ANJELA TROYA | נדל"ן ושמאות</p>
              <h1 style="margin:8px 0 0;font-size:18px;color:#0f172a;">פנייה חדשה מהאתר</h1>
            </div>
            <div style="padding:20px 24px;">
              <p style="margin:0 0 6px;color:#0f172a;font-size:14px;font-weight:600;">שם: ${name}</p>
              <p style="margin:0 0 6px;color:#0f172a;font-size:14px;">טלפון: ${phone}</p>
              <p style="margin:0 0 12px;color:#0f172a;font-size:14px;">אימייל: ${email || "ללא"}</p>
              <p style="margin:0;color:#475569;font-size:13px;white-space:pre-line;">${details.replace(/</g, "&lt;")}</p>
            </div>
          </div>
        </div>`,
    });
  }

  return NextResponse.json({ ok: true });
}
