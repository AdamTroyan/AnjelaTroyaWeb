"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { assertSameOriginFromHeaders } from "@/lib/csrf";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rateLimit";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : NaN;
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO;

  if (!host || !Number.isFinite(port) || !user || !pass || !from || !to) {
    throw new Error("Missing SMTP configuration");
  }

  return { host, port, secure, user, pass, from, to };
}

export async function createValuationInquiry(formData: FormData) {
  const originCheck = await assertSameOriginFromHeaders();
  if (!originCheck.ok) {
    throw new Error("Invalid origin");
  }

  const headerStore = await headers();
  const clientIp = getClientIpFromHeaders(headerStore);
  const rate = await checkRateLimit(`valuation:${clientIp}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    throw new Error("Too many requests");
  }

  const nameValue = formData.get("name");
  const phoneValue = formData.get("phone");
  const emailValue = formData.get("email");
  const addressValue = formData.get("address");
  const typeValue = formData.get("propertyType");
  const roomsValue = formData.get("rooms");
  const notesValue = formData.get("notes");

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const phone = typeof phoneValue === "string" ? phoneValue.trim() : "";
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const address = typeof addressValue === "string" ? addressValue.trim() : "";
  const propertyType = typeof typeValue === "string" ? typeValue.trim() : "";
  const rooms = typeof roomsValue === "string" ? roomsValue.trim() : "";
  const notes = typeof notesValue === "string" ? notesValue.trim() : "";

  if (
    name.length > 120 ||
    phone.length > 40 ||
    email.length > 254 ||
    address.length > 200 ||
    propertyType.length > 80 ||
    rooms.length > 20 ||
    notes.length > 2000
  ) {
    throw new Error("Invalid input");
  }

  if (!name || !phone || !address) {
    throw new Error("Missing required fields");
  }

  const details = [
    `בקשת הערכת שווי`,
    `כתובת: ${address}`,
    propertyType ? `סוג נכס: ${propertyType}` : "",
    rooms ? `חדרים: ${rooms}` : "",
    notes ? `הערות: ${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const smtp = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const subject = `בקשת הערכת שווי חדשה: ${name}`;
  const lines = [
    "בקשת הערכת שווי",
    `שם: ${name}`,
    `טלפון: ${phone}`,
    `אימייל: ${email || "ללא"}`,
    "",
    `כתובת: ${address}`,
    propertyType ? `סוג נכס: ${propertyType}` : "",
    rooms ? `חדרים: ${rooms}` : "",
    notes ? `הערות: ${notes}` : "",
  ].filter(Boolean);

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#64748b;">ANJELA TROYA | נדל"ן ושמאות</p>
        <h1 style="margin:8px 0 0;font-size:18px;color:#0f172a;">בקשת הערכת שווי</h1>
      </div>
      <div style="padding:20px 24px;">
        <p style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:600;">פרטי הפונה</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:12px;">שם</td>
            <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:12px;">טלפון</td>
            <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(phone)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:12px;">אימייל</td>
            <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(email || "ללא")}</td>
          </tr>
        </table>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:600;">פרטי הנכס</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#64748b;font-size:12px;">כתובת</td>
              <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(address)}</td>
            </tr>
            ${propertyType ? `<tr><td style="padding:6px 0;color:#64748b;font-size:12px;">סוג נכס</td><td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(propertyType)}</td></tr>` : ""}
            ${rooms ? `<tr><td style="padding:6px 0;color:#64748b;font-size:12px;">חדרים</td><td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(rooms)}</td></tr>` : ""}
          </table>
        </div>

        ${
          notes
            ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;">
                <p style="margin:0 0 6px;color:#64748b;font-size:12px;">הערות</p>
                <p style="margin:0;color:#0f172a;font-size:13px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(notes)}</p>
              </div>`
            : ""
        }
      </div>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: smtp.from,
    to: smtp.to,
    subject,
    text: lines.join("\n"),
    html,
  });

  redirect("/valuation?sent=1");
}
