const highlights = [
  "מעורבת בכל פרט — מלווה מהפנייה הראשונה ועד מסירת המפתח.",
  "היכרות עמוקה עם שוק הנדל\"ן באשקלון — 5 שנות ניסיון ו-30 שנה בעיר.",
  "שירות בעברית וברוסית — כי שפה זה גם ביטחון.",
];

const professionalLinks = [
  { href: "/certifications", label: "רישיון והסמכות" },
  { href: "/fees", label: "שקיפות עמלות" },
  { href: "/faq", label: "שאלות נפוצות" },
];

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">אודות</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          אני אנג&#39;לה טרויה, מתווכת נדל&quot;ן באשקלון. חיה בעיר כבר מעל 30
          שנה ופועלת בתחום התיווך 5 שנים. אני לא רק "מתווכת" — אני שם
          עם הלקוחות שלי בכל שלב, מהפנייה הראשונה ועד יום המסירה. אני
          מאמינה שתיווך טוב מתחיל מהקשבה, נבנה על אמינות ומסתיים
          בשביעות רצון מלאה.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          אני עובדת עם קהל מגוון — ישראלים ודוברי רוסית כאחד — ונותנת
          שירות מלא בשפתם. הגישה שלי היא אישית, שקופה וללא קיצורי דרך.
          כל לקוח מקבל את מלוא תשומת הלב, כי כל עסקה חשובה.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          בנוסף, אני כרגע לומדת שמאות מקרקעין — כדי להעמיק את הידע
          המקצועי ולתת ללקוחות שלי שירות מדויק ומבוסס עוד יותר.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          ואם בא לכם להכיר אותי קצת מעבר לעבודה — יש לי קהילה של מעל
          80,000 עוקבים בטיקטוק, שם אני משתפת מהחיים שלי.
          {" "}
          <a
            className="font-semibold text-slate-700 hover:text-slate-900"
            href="https://www.tiktok.com/@anjeliktroya"
            target="_blank"
            rel="noreferrer"
          >
            לצפייה בטיקטוק
          </a>
          .
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">מידע מקצועי נוסף</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            {professionalLinks.map((link) => (
              <a
                key={link.href}
                className="rounded-full border border-slate-300 px-4 py-2 transition hover:border-slate-400 hover:text-slate-900"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
