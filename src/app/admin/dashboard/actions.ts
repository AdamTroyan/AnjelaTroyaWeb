"use server";

import crypto from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";
import { assertSameOriginFromHeaders } from "@/lib/csrf";
import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/format";
import { getSiteUrl } from "@/lib/siteUrl";
import { generatePropertyId } from "@/lib/propertyId";

async function requireAdmin() {
  const originCheck = await assertSameOriginFromHeaders();
  if (!originCheck.ok) {
    throw new Error("Invalid origin");
  }

  const user = await getUserFromCookies();
  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const MAX_IMAGE_BYTES = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const ALLOWED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function parseNumber(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDetailValue(details: unknown, label: string) {
  if (!Array.isArray(details)) {
    return "";
  }
  const match = details.find(
    (item): item is { label: string; value: string } =>
      typeof item === "object" &&
      item !== null &&
      "label" in item &&
      "value" in item &&
      (item as { label?: unknown }).label === label &&
      typeof (item as { value?: unknown }).value === "string"
  );
  return match?.value ?? "";
}

function parseDetails(detailsValue: FormDataEntryValue | null) {
  if (typeof detailsValue !== "string" || detailsValue.length === 0) {
    return null;
  }
  try {
    return JSON.parse(detailsValue);
  } catch {
    return null;
  }
}

function getImageExtension(file: File) {
  if (file.type && MIME_EXTENSION_MAP[file.type]) {
    return MIME_EXTENSION_MAP[file.type];
  }
  const ext = path.extname(file.name || "").toLowerCase();
  if (ALLOWED_IMAGE_EXTS.has(ext)) {
    return ext;
  }
  return ".jpg";
}

function validateImageFile(file: File) {
  if (!file.type && !ALLOWED_IMAGE_EXTS.has(path.extname(file.name || "").toLowerCase())) {
    throw new Error("Unsupported image type");
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported image type");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large");
  }
}

type R2Config = {
  client: S3Client;
  bucket: string;
  publicBaseUrl: string;
  prefix: string;
};

function getR2Config(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  const prefixValue = process.env.R2_PREFIX || "";

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    return null;
  }

  const normalizedBaseUrl = publicBaseUrl.replace(/\/+$/, "");
  const normalizedPrefix = prefixValue
    ? `${prefixValue.replace(/^\/+|\/+$/g, "")}/`
    : "";

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  return {
    client,
    bucket,
    publicBaseUrl: normalizedBaseUrl,
    prefix: normalizedPrefix,
  };
}

async function uploadToR2(config: R2Config, file: File) {
  const ext = getImageExtension(file);
  const key = `${config.prefix}${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await config.client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return `${config.publicBaseUrl}/${key}`;
}

async function deleteFromR2(config: R2Config, url: string) {
  if (!url.startsWith(config.publicBaseUrl)) {
    return;
  }

  const key = url.replace(`${config.publicBaseUrl}/`, "");
  if (!key) {
    return;
  }

  await config.client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  );
}

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

async function geocodeAddress(address: string) {
  const query = address.trim();
  if (!query) {
    return null;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  const userAgent = `AnjelaTroyRealEstate/1.0 (${siteUrl || "local"})`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      "Accept-Language": "he",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  const first = data[0];
  if (!first) {
    return null;
  }

  const latitude = Number.parseFloat(first.lat);
  const longitude = Number.parseFloat(first.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

async function saveUploadedImages(files: File[]) {
  if (!files.length) {
    return [] as string[];
  }
  const r2Config = getR2Config();
  if (!r2Config) {
    await mkdir(uploadsDir, { recursive: true });
  }
  const imageUrls: string[] = [];
  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
      continue;
    }

    validateImageFile(file);

    if (r2Config) {
      const url = await uploadToR2(r2Config, file);
      imageUrls.push(url);
      continue;
    }

    const ext = getImageExtension(file);
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    imageUrls.push(`/uploads/${filename}`);
  }

  return imageUrls;
}

async function removeUploads(urls: string[]) {
  const r2Config = getR2Config();
  const removals = urls
    .filter((url) => url.startsWith("/uploads/"))
    .map((url) => path.join(process.cwd(), "public", url));

  if (r2Config) {
    for (const url of urls) {
      try {
        await deleteFromR2(r2Config, url);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to delete remote file", url, error);
        }
      }
    }
  }

  for (const filePath of removals) {
    try {
      await unlink(filePath);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to delete file", filePath, error);
      }
    }
  }
}

export async function createProperty(formData: FormData) {
  await requireAdmin();

  const titleValue = formData.get("title");
  const descriptionValue = formData.get("description");
  const priceValue = formData.get("price");
  const typeValue = formData.get("type");
  const addressValue = formData.get("address");
  const isHot = formData.get("isHot") === "on";
  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const price = typeof priceValue === "string" ? priceValue.trim() : "";
  const type = typeof typeValue === "string" ? typeValue : "SALE";
  const address = typeof addressValue === "string" ? addressValue.trim() : "";
  const isActive = formData.get("isActive") === "on";
  const detailsValue = formData.get("details");
  const details = parseDetails(detailsValue);
  const imageFiles = formData.getAll("images");
  const files = imageFiles.filter(
    (file): file is File => file instanceof File && file.size > 0
  );
  const imageUrls = await saveUploadedImages(files);

  if (!title || !description || !price) {
    throw new Error("Missing required fields");
  }

  const geo = address ? await geocodeAddress(address) : null;

  let id = generatePropertyId();
  // Ensure uniqueness in case of collision.
  while (await prisma.property.findUnique({ where: { id } })) {
    id = generatePropertyId();
  }

  const createdProperty = await prisma.property.create({
    data: {
      id,
      title,
      description,
      price,
      type: type === "RENT" ? "RENT" : "SALE",
      isActive,
      isHot,
      imageUrls,
      details,
      address: address || null,
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
    },
  });

  const smtp = getSmtpConfigSafe();
  if (smtp) {
    const priceValueNumber = parseNumber(createdProperty.price);
    const roomsValueNumber = parseNumber(getDetailValue(details, "מספר חדרים"));
    const alerts = await prisma.propertyAlert.findMany({
      where: { type: createdProperty.type },
    });
    const matched = alerts.filter((alert) => {
      if (alert.minPrice !== null) {
        if (priceValueNumber === null || priceValueNumber < alert.minPrice) {
          return false;
        }
      }
      if (alert.maxPrice !== null) {
        if (priceValueNumber === null || priceValueNumber > alert.maxPrice) {
          return false;
        }
      }
      if (alert.minRooms !== null) {
        if (roomsValueNumber === null || roomsValueNumber < alert.minRooms) {
          return false;
        }
      }
      return true;
    });

    if (matched.length > 0) {
      const siteUrl = getSiteUrl();
      const propertyUrl = siteUrl
        ? `${siteUrl.replace(/\/$/, "")}/properties/${createdProperty.id}`
        : "";
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
      });

      const formattedPrice = formatPrice(createdProperty.price);

      await Promise.all(
        matched.map((alert) =>
          transporter.sendMail({
            from: smtp.from,
            to: alert.email,
            subject: `נכס חדש שמתאים לך: ${createdProperty.title}`,
            text: [
              `נכס: ${createdProperty.title}`,
              `סוג: ${createdProperty.type === "SALE" ? "למכירה" : "להשכרה"}`,
              `מחיר: ${formattedPrice}`,
              propertyUrl ? `קישור: ${propertyUrl}` : "",
              "",
              "לא יישלחו הודעות שיווקיות שאינן קשורות להתראות.",
              "ניתן לבטל את ההרשמה בכל עת באמצעות קישור הסרה בכל הודעת דוא\"ל.",
              siteUrl
                ? `הסרה מרשימת ההתראות: ${siteUrl.replace(/\/$/, "")}/api/alerts/unsubscribe?token=${alert.unsubscribeToken}`
                : "",
            ].filter(Boolean).join("\n"),
            html: `
              <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
                <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;text-align:center;">
                  <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:12px;color:#64748b;">ANJELA TROYA | נדל"ן ושמאות</p>
                    <h1 style="margin:8px 0 0;font-size:18px;color:#0f172a;">נכס חדש שמתאים לך</h1>
                  </div>
                  <div style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#0f172a;font-size:16px;font-weight:600;">${createdProperty.title}</p>
                    <p style="margin:0 0 12px;color:#64748b;font-size:13px;">${createdProperty.type === "SALE" ? "למכירה" : "להשכרה"}</p>
                    <p style="margin:0 0 16px;color:#0f172a;font-size:18px;font-weight:700;">${formattedPrice}</p>
                    ${
                      propertyUrl
                        ? `<a href="${propertyUrl}" style="display:inline-block;margin-top:4px;padding:10px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;">צפייה בנכס</a>`
                        : ""
                    }
                  </div>
                  <div style="padding:12px 24px;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;">הודעה אוטומטית מהאתר</p>
                    <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;">לא יישלחו הודעות שיווקיות שאינן קשורות להתראות.</p>
                    <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;">ניתן לבטל את ההרשמה בכל עת באמצעות קישור הסרה בכל הודעת דוא"ל.</p>
                    ${
                      siteUrl
                        ? `<p style="margin:6px 0 0;color:#94a3b8;font-size:11px;"><a href="${siteUrl.replace(/\/$/, "")}/api/alerts/unsubscribe?token=${alert.unsubscribeToken}" style="color:#94a3b8;text-decoration:underline;">להסרה מרשימת ההתראות</a></p>`
                        : ""
                    }
                  </div>
                </div>
              </div>`,
          })
        )
      );
    }
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/properties/sale");
  revalidatePath("/properties/rent");
}

export async function toggleProperty(formData: FormData) {
  await requireAdmin();

  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue : "";
  if (!id) {
    throw new Error("Missing id");
  }

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new Error("Not found");
  }

  await prisma.property.update({
    where: { id },
    data: { isActive: !property.isActive },
  });

  revalidatePath("/admin/dashboard");
}

export async function deleteProperty(formData: FormData) {
  await requireAdmin();

  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue : "";
  if (!id) {
    throw new Error("Missing id");
  }

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new Error("Not found");
  }

  await prisma.property.delete({ where: { id } });
  await removeUploads(property.imageUrls);
  revalidatePath("/admin/dashboard");
}

export async function updateProperty(formData: FormData) {
  await requireAdmin();

  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue : "";
  if (!id) {
    throw new Error("Missing id");
  }

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new Error("Not found");
  }

  const titleValue = formData.get("title");
  const descriptionValue = formData.get("description");
  const priceValue = formData.get("price");
  const typeValue = formData.get("type");
  const statusValue = formData.get("status");
  const addressValue = formData.get("address");
  const isHot = formData.get("isHot") === "on";
  const detailsValue = formData.get("details");
  const keepImagesValues = formData.getAll("keepImages");

  const title = typeof titleValue === "string" ? titleValue.trim() : property.title;
  const description =
    typeof descriptionValue === "string" ? descriptionValue.trim() : property.description;
  const price = typeof priceValue === "string" ? priceValue.trim() : property.price;
  const type = typeof typeValue === "string" ? typeValue : property.type;
  const status = typeof statusValue === "string" ? statusValue : property.status;
  const address = typeof addressValue === "string" ? addressValue.trim() : property.address ?? "";
  const isActive = formData.get("isActive") === "on";
  const details = parseDetails(detailsValue) ?? property.details ?? null;

  const keepImages = keepImagesValues.filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );
  const removedImages = property.imageUrls.filter((url) => !keepImages.includes(url));
  await removeUploads(removedImages);

  const imageFiles = formData.getAll("images");
  const files = imageFiles.filter(
    (file): file is File => file instanceof File && file.size > 0
  );
  const newImages = await saveUploadedImages(files);

  const shouldGeocode = Boolean(address) &&
    (address !== (property.address ?? "") || property.latitude === null || property.longitude === null);
  const geo = shouldGeocode ? await geocodeAddress(address) : null;
  const nextLatitude = address
    ? shouldGeocode
      ? geo?.latitude ?? null
      : property.latitude
    : null;
  const nextLongitude = address
    ? shouldGeocode
      ? geo?.longitude ?? null
      : property.longitude
    : null;

  await prisma.property.update({
    where: { id },
    data: {
      title,
      description,
      price,
      type: type === "RENT" ? "RENT" : "SALE",
      isActive,
      isHot,
      imageUrls: [...keepImages, ...newImages],
      details,
      address: address || null,
      latitude: nextLatitude,
      longitude: nextLongitude,
      status: status === "RENTED" ? "RENTED" : status === "SOLD" ? "SOLD" : "AVAILABLE",
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/properties/${id}/edit`);
  revalidatePath(`/properties/${id}`);
  revalidatePath("/properties/sale");
  revalidatePath("/properties/rent");
}

export async function createPortfolioItem(formData: FormData) {
  await requireAdmin();

  const titleValue = formData.get("title");
  const locationValue = formData.get("location");
  const outcomeValue = formData.get("outcome");
  const descriptionValue = formData.get("description");
  const closedAtValue = formData.get("closedAt");

  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const location = typeof locationValue === "string" ? locationValue.trim() : "";
  const outcome = typeof outcomeValue === "string" ? outcomeValue.trim() : "";
  const description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const closedAt = typeof closedAtValue === "string" && closedAtValue
    ? new Date(closedAtValue)
    : null;

  if (!title) {
    throw new Error("Missing title");
  }

  await prisma.portfolioItem.create({
    data: {
      title,
      location: location || null,
      outcome: outcome || null,
      description: description || null,
      closedAt: closedAt && !Number.isNaN(closedAt.getTime()) ? closedAt : null,
    },
  });

  revalidatePath("/admin/dashboard");
}

export async function deletePortfolioItem(formData: FormData) {
  await requireAdmin();

  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue : "";
  if (!id) {
    throw new Error("Missing id");
  }

  await prisma.portfolioItem.delete({ where: { id } });
  revalidatePath("/admin/dashboard");
}
