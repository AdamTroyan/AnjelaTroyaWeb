"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/siteUrl";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rateLimit";

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeDetails(details: unknown) {
  if (!Array.isArray(details)) {
    return [] as { label: string; value: string }[];
  }
  return details.filter(
    (item): item is { label: string; value: string } =>
      typeof item === "object" &&
      item !== null &&
      "label" in item &&
      "value" in item &&
      typeof (item as { label?: unknown }).label === "string" &&
      typeof (item as { value?: unknown }).value === "string"
  );
}

function buildAbsoluteUrl(siteUrl: string, pathOrUrl: string) {
  if (!pathOrUrl) {
    return "";
  }
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  if (!siteUrl) {
    return pathOrUrl;
  }
  return `${siteUrl.replace(/\/$/, "")}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export async function createPropertyInquiry(formData: FormData) {
  const headerStore = await headers();
  const clientIp = getClientIpFromHeaders(headerStore);
  const rate = await checkRateLimit(`property-inquiry:${clientIp}`, {
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.ok) {
    throw new Error("Too many requests");
  }

  const propertyIdValue = formData.get("propertyId");
  const nameValue = formData.get("name");
  const phoneValue = formData.get("phone");
  const emailValue = formData.get("email");
  const messageValue = formData.get("message");

  const propertyId = typeof propertyIdValue === "string" ? propertyIdValue : "";
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const phone = typeof phoneValue === "string" ? phoneValue.trim() : "";
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const message = typeof messageValue === "string" ? messageValue.trim() : "";

  if (name.length > 120 || phone.length > 40 || email.length > 254 || message.length > 2000) {
    throw new Error("Invalid input");
  }

  if (!propertyId || !name || !phone || !message) {
    throw new Error("Missing required fields");
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      title: true,
      type: true,
      price: true,
      address: true,
      imageUrls: true,
      details: true,
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  await prisma.propertyInquiry.create({
    data: {
      propertyId,
      name,
      phone,
      email: email || null,
      message,
    },
  });

  const details = normalizeDetails(property.details);
  const siteUrl = getSiteUrl();
  const propertyUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/properties/${propertyId}` : "";
  const mapUrl = property.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(property.address)}`
    : "";
  const images = property.imageUrls.map((url) =>
    buildAbsoluteUrl(siteUrl, url)
  );

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

  const subject = `פנייה חדשה לנכס: ${property.title}`;
  const lines = [
    `נכס: ${property.title}`,
    `סוג: ${property.type === "SALE" ? "למכירה" : "להשכרה"}`,
    `מחיר: ${property.price ?? ""}`,
    property.address ? `כתובת: ${property.address}` : "",
    propertyUrl ? `קישור לנכס: ${propertyUrl}` : "",
    "",
    `שם: ${name}`,
    `טלפון: ${phone}`,
    `אימייל: ${email || "ללא"}`,
    `הודעה: ${message}`,
  ].filter(Boolean);

  const shortDetails = details.slice(0, 5);
  const detailsHtml = shortDetails.length
    ? `<table style="width:100%;border-collapse:collapse;">${shortDetails
        .map(
          (item) =>
            `<tr><td style="padding:6px 0;color:#64748b;font-size:12px;">${escapeHtml(
              item.label
            )}</td><td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(
              item.value
            )}</td></tr>`
        )
        .join("")}</table>`
    : "";

  const previewImage = images[0] ? escapeHtml(images[0]) : "";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:18px;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#64748b;">ליד חדש מהאתר</p>
        <h1 style="margin:6px 0 0;font-size:18px;color:#0f172a;">${escapeHtml(
          property?.title ?? "נכס"
        )}</h1>
      </div>
      <div style="padding:16px 20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#64748b;font-size:12px;">סוג</td>
            <td style="padding:4px 0;color:#0f172a;font-size:12px;font-weight:600;">${
              property?.type === "SALE" ? "למכירה" : "להשכרה"
            }</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b;font-size:12px;">מחיר</td>
            <td style="padding:4px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(
              property?.price ?? ""
            )}</td>
          </tr>
          ${
            property?.address
              ? `<tr><td style="padding:4px 0;color:#64748b;font-size:12px;">כתובת</td><td style="padding:4px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(
                  property.address
                )}</td></tr>`
              : ""
          }
        </table>

        ${
          previewImage
            ? `<div style="margin-top:12px;"><img src="${previewImage}" alt="נכס" style="width:100%;max-height:220px;object-fit:cover;border-radius:10px;border:1px solid #e2e8f0;" /></div>`
            : ""
        }

        ${
          detailsHtml
            ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 6px;color:#64748b;font-size:12px;">פרטים עיקריים</p>${detailsHtml}</div>`
            : ""
        }

        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 6px;color:#64748b;font-size:12px;">פרטי הפונה</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;color:#64748b;font-size:12px;">שם</td>
              <td style="padding:4px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(
                name
              )}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#64748b;font-size:12px;">טלפון</td>
              <td style="padding:4px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(
                phone
              )}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#64748b;font-size:12px;">אימייל</td>
              <td style="padding:4px 0;color:#0f172a;font-size:12px;font-weight:600;">${escapeHtml(
                email || "ללא"
              )}</td>
            </tr>
          </table>
          <p style="margin:10px 0 0;color:#64748b;font-size:12px;">הודעה</p>
          <p style="margin:6px 0 0;color:#0f172a;font-size:13px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(
            message
          )}</p>
        </div>

        <div style="margin-top:14px;text-align:center;">
          ${
            mapUrl
              ? `<a href="${escapeHtml(
                  mapUrl
                )}" style="display:inline-block;padding:9px 16px;margin-left:8px;border:1px solid #0f172a;color:#0f172a;font-size:13px;font-weight:600;text-decoration:none;border-radius:999px;">מפות</a>`
              : ""
          }
          ${
            propertyUrl
              ? `<a href="${escapeHtml(
                  propertyUrl
                )}" style="display:inline-block;padding:9px 16px;background:#0f172a;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:999px;">צפייה בנכס</a>`
              : ""
          }
        </div>
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

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/admin/dashboard");
}
