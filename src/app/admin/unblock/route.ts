import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const wantsHtml = (request.headers.get("accept") || "").includes("text/html");

  if (!token) {
    if (wantsHtml) {
      return new NextResponse(
        `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>חסימה לא בוטלה</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        font-family: "Rubik", "Heebo", "Arial", sans-serif;
        background: radial-gradient(1200px 600px at 10% 10%, #f6efe6 0, #f9f6f1 45%, #ffffff 100%);
        color: #1f2328;
      }
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 40px 20px;
      }
      .card {
        width: min(720px, 92vw);
        background: #ffffff;
        border: 1px solid #e7dfd5;
        border-radius: 24px;
        padding: 28px 28px 32px;
        box-shadow: 0 20px 60px rgba(25, 20, 10, 0.12);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fff2f0;
        color: #b42318;
        border: 1px solid #fed7d7;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 600;
      }
      h1 {
        margin: 16px 0 8px;
        font-size: clamp(28px, 4vw, 36px);
        letter-spacing: -0.3px;
      }
      p {
        margin: 8px 0 0;
        font-size: 16px;
        line-height: 1.7;
        color: #3d4450;
      }
      .cta {
        margin-top: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px 18px;
        border-radius: 999px;
        background: #111827;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      }
      .cta:focus-visible {
        outline: 3px solid #111827;
        outline-offset: 3px;
      }
      .hint {
        margin-top: 18px;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <main class="card">
        <div class="badge">שגיאה</div>
        <h1>חסימה לא בוטלה</h1>
        <p>חסר טוקן. בדוק שהקישור שלם ונסו שוב.</p>
        <a class="cta" href="/admin">לעמוד התחברות מנהל</a>
        <div class="hint">אם הבעיה חוזרת, אפשר לבקש קישור חדש.</div>
      </main>
    </div>
  </body>
</html>`,
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const deleted = await prisma.loginBlock.deleteMany({ where: { token } });
  if (deleted.count === 0) {
    if (wantsHtml) {
      return new NextResponse(
        `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>חסימה לא בוטלה</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        font-family: "Rubik", "Heebo", "Arial", sans-serif;
        background: radial-gradient(1200px 600px at 10% 10%, #f6efe6 0, #f9f6f1 45%, #ffffff 100%);
        color: #1f2328;
      }
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 40px 20px;
      }
      .card {
        width: min(720px, 92vw);
        background: #ffffff;
        border: 1px solid #e7dfd5;
        border-radius: 24px;
        padding: 28px 28px 32px;
        box-shadow: 0 20px 60px rgba(25, 20, 10, 0.12);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fff2f0;
        color: #b42318;
        border: 1px solid #fed7d7;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 600;
      }
      h1 {
        margin: 16px 0 8px;
        font-size: clamp(28px, 4vw, 36px);
        letter-spacing: -0.3px;
      }
      p {
        margin: 8px 0 0;
        font-size: 16px;
        line-height: 1.7;
        color: #3d4450;
      }
      .cta {
        margin-top: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px 18px;
        border-radius: 999px;
        background: #111827;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      }
      .cta:focus-visible {
        outline: 3px solid #111827;
        outline-offset: 3px;
      }
      .hint {
        margin-top: 18px;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <main class="card">
        <div class="badge">שגיאה</div>
        <h1>חסימה לא בוטלה</h1>
        <p>הטוקן אינו תקין או שכבר בוטל.</p>
        <a class="cta" href="/admin">לעמוד התחברות מנהל</a>
        <div class="hint">אם צריך, אפשר לבקש קישור חדש.</div>
      </main>
    </div>
  </body>
</html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (wantsHtml) {
    return new NextResponse(
      `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>החסימה בוטלה</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        font-family: "Rubik", "Heebo", "Arial", sans-serif;
        background: radial-gradient(1200px 600px at 10% 10%, #eaf7ef 0, #f3faf6 45%, #ffffff 100%);
        color: #1f2328;
      }
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 40px 20px;
      }
      .card {
        width: min(720px, 92vw);
        background: #ffffff;
        border: 1px solid #d4f0df;
        border-radius: 24px;
        padding: 28px 28px 32px;
        box-shadow: 0 20px 60px rgba(10, 30, 20, 0.12);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #ecfdf3;
        color: #027a48;
        border: 1px solid #abefc6;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 600;
      }
      h1 {
        margin: 16px 0 8px;
        font-size: clamp(28px, 4vw, 36px);
        letter-spacing: -0.3px;
      }
      p {
        margin: 8px 0 0;
        font-size: 16px;
        line-height: 1.7;
        color: #3d4450;
      }
      .cta {
        margin-top: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px 18px;
        border-radius: 999px;
        background: #111827;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      }
      .cta:focus-visible {
        outline: 3px solid #111827;
        outline-offset: 3px;
      }
      .hint {
        margin-top: 18px;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <main class="card">
        <div class="badge">הצלחה</div>
        <h1>בוטלה החסימה למשתמש</h1>
        <p>אפשר לנסות להתחבר שוב לחשבון המנהל.</p>
        <a class="cta" href="/admin">לעמוד התחברות מנהל</a>
        <div class="hint">אם ההתחברות עדיין נכשלת, בדוק את הסיסמה או נסה מאוחר יותר.</div>
      </main>
    </div>
  </body>
</html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  return NextResponse.json({ ok: true });
}
