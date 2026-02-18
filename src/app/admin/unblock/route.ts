import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rateLimit";
import { headers } from "next/headers";

export const runtime = "nodejs";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const pageStyle = `
  :root { color-scheme: light; }
  body { margin:0; font-family:"Rubik","Heebo","Arial",sans-serif; background:radial-gradient(1200px 600px at 10% 10%,#f6efe6 0,#f9f6f1 45%,#fff 100%); color:#1f2328; }
  .wrap { min-height:100vh; display:grid; place-items:center; padding:40px 20px; }
  .card { width:min(720px,92vw); background:#fff; border:1px solid #e7dfd5; border-radius:24px; padding:28px 28px 32px; box-shadow:0 20px 60px rgba(25,20,10,.12); }
  .badge { display:inline-flex; align-items:center; gap:8px; border-radius:999px; padding:6px 12px; font-size:14px; font-weight:600; }
  .badge-error { background:#fff2f0; color:#b42318; border:1px solid #fed7d7; }
  .badge-success { background:#ecfdf3; color:#027a48; border:1px solid #abefc6; }
  .badge-info { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
  h1 { margin:16px 0 8px; font-size:clamp(28px,4vw,36px); letter-spacing:-0.3px; }
  p { margin:8px 0 0; font-size:16px; line-height:1.7; color:#3d4450; }
  .cta { margin-top:22px; display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:12px 18px; border-radius:999px; background:#111827; color:#fff; text-decoration:none; font-weight:600; border:none; cursor:pointer; font-size:16px; }
  .cta:focus-visible { outline:3px solid #111827; outline-offset:3px; }
  .hint { margin-top:18px; font-size:13px; color:#6b7280; }
`;

function renderPage(title: string, heading: string, message: string, variant: "error" | "success") {
  const badgeClass = variant === "success" ? "badge-success" : "badge-error";
  const badgeText = variant === "success" ? "הצלחה" : "שגיאה";
  return `<!doctype html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title><style>${pageStyle}</style></head>
<body><div class="wrap"><main class="card">
  <div class="badge ${badgeClass}">${badgeText}</div>
  <h1>${escapeHtml(heading)}</h1>
  <p>${escapeHtml(message)}</p>
  <a class="cta" href="/admin">לעמוד התחברות מנהל</a>
  <div class="hint">אם צריך, אפשר לבקש קישור חדש.</div>
</main></div></body></html>`;
}

function renderConfirmationPage(token: string) {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>ביטול חסימה</title><style>${pageStyle}</style></head>
<body><div class="wrap"><main class="card">
  <div class="badge badge-info">אישור</div>
  <h1>ביטול חסימת התחברות</h1>
  <p>לחצו על הכפתור למטה כדי לבטל את החסימה ולאפשר התחברות מחדש.</p>
  <form method="POST">
    <input type="hidden" name="token" value="${escapeHtml(token)}" />
    <button type="submit" class="cta">בטל חסימה</button>
  </form>
  <div class="hint">פעולה זו תסיר את החסימה. אם לא ביקשתם זאת, התעלמו מהודעה זו.</div>
</main></div></body></html>`;
}

export async function GET(request: Request) {
  const headerStore = await headers();
  const clientIp = getClientIpFromHeaders(headerStore);
  const rate = await checkRateLimit(`unblock:${clientIp}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const wantsHtml = (request.headers.get("accept") || "").includes("text/html");

  if (!token) {
    if (wantsHtml) {
      return new NextResponse(
        renderPage("שגיאה", "חסימה לא בוטלה", "חסר טוקן. בדוק שהקישור שלם ונסו שוב.", "error"),
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (wantsHtml) {
    return new NextResponse(
      renderConfirmationPage(token),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  return NextResponse.json({ message: "POST to this endpoint with { token } to unblock" });
}

export async function POST(request: Request) {
  const headerStore = await headers();
  const clientIp = getClientIpFromHeaders(headerStore);
  const rate = await checkRateLimit(`unblock:${clientIp}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let token = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    token = (formData.get("token") as string) || "";
  } else {
    const body = await request.json().catch(() => null);
    token = typeof body?.token === "string" ? body.token : "";
  }

  const wantsHtml = (request.headers.get("accept") || "").includes("text/html");

  if (!token) {
    if (wantsHtml) {
      return new NextResponse(
        renderPage("שגיאה", "חסימה לא בוטלה", "חסר טוקן.", "error"),
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const deleted = await prisma.loginBlock.deleteMany({ where: { token } });

  if (deleted.count === 0) {
    if (wantsHtml) {
      return new NextResponse(
        renderPage("חסימה לא בוטלה", "חסימה לא בוטלה", "הטוקן אינו תקין או שכבר בוטל.", "error"),
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (wantsHtml) {
    return new NextResponse(
      renderPage("החסימה בוטלה", "בוטלה החסימה למשתמש", "אפשר לנסות להתחבר שוב לחשבון המנהל.", "success"),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  return NextResponse.json({ ok: true });
}
