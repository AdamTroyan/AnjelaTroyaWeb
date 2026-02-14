# ANJELA TROYA - Real Estate Website

אתר מקצועי לתיווך ושמאות נדל"ן, נבנה עם Next.js (App Router), Tailwind ו‑Prisma.

## הרצה מקומית

```bash
npm install
npm run dev
```

פתחו את `http://localhost:3000`.

## חיבור למסד נתונים (Supabase + Prisma)

1. צרו פרויקט ב‑Supabase (Postgres).
2. העתיקו את מחרוזת החיבור (DATABASE_URL) לקובץ `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/db"
```

3. הריצו מיגרציה ראשונה:

```bash
npx prisma migrate dev --name init
```

## ניהול משתמשים (Admin בלבד)

כרגע עמוד `/admin` הוא ממשק התחברות בסיסי. אפשר לשלב אימות מלא בהמשך
(לדוגמה: Hash לסיסמה, הרשאות, וממשק ניהול נכסים).

## פריסה ל‑Vercel

1. העלו את הריפו ל‑GitHub.
2. חברו את הפרויקט ל‑Vercel.
3. הוסיפו משתנה סביבה `DATABASE_URL` בהגדרות הפרויקט.
4. הפקודה ל‑Build:

```bash
npm run build
```

## מבנה עמודים

- `/` בית
- `/about` אודות
- `/properties/sale` דירות למכירה
- `/properties/rent` דירות להשכרה
- `/testimonials` המלצות
- `/contact` צור קשר
- `/admin` התחברות מנהל
