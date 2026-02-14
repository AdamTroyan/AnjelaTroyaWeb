import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

function renderHtml(message: string) {
  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>הסרת הרשמה להתראות</title>
  </head>
  <body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:20px;">
      <h1 style="margin:0 0 8px;font-size:18px;color:#0f172a;">הסרת הרשמה להתראות</h1>
      ${message}
    </div>
  </body>
</html>`;
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`alerts:unsubscribe:${clientIp}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rate.ok) {
    return new Response(renderHtml("יותר מדי בקשות. נסו שוב מאוחר יותר."), {
      status: 429,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": String(rate.retryAfter),
      },
    });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(renderHtml("לא נמצא מזהה להסרה."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const alert = await prisma.propertyAlert.findUnique({
    where: { unsubscribeToken: token },
    select: { email: true },
  });

  if (alert?.email) {
    await prisma.suppressionEmail.deleteMany({ where: { email: alert.email } });
  }

  const result = await prisma.propertyAlert.deleteMany({
    where: { unsubscribeToken: token },
  });

  const message =
    result.count > 0
      ? `
      <p style="margin:0 0 8px;color:#334155;font-size:14px;">בוטלה הרשמתך לקבלת התראות על נכסים.</p>
      <p style="margin:0 0 12px;color:#334155;font-size:14px;">לא יישלחו אליך הודעות נוספות.</p>
      <p style="margin:0;color:#334155;font-size:14px;">אם ברצונך להירשם מחדש, ניתן לבצע זאת דרך האתר בכל עת.</p>
      `
      : `<p style="margin:0;color:#334155;font-size:14px;">ההתראה כבר הוסרה או שהקישור לא תקין.</p>`;

  return new Response(renderHtml(message), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
