const highlights = [
  "ליווי מקצועי וקור רוח בכל שלב בעסקה.",
  "התמחות בשוק המקומי של אשקלון וכל סוגי הנכסים.",
  "שירות בשפת הלקוח עם דגש לדוברי רוסית.",
];

const professionalLinks = [
  { href: "/certifications", label: "תעודות והסמכות" },
  { href: "/process", label: "תהליך עבודה" },
  { href: "/fees", label: "שקיפות עמלות" },
  { href: "/faq", label: "FAQ מקצועי" },
];

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">אודות</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          אנג׳לה טרויה היא מתווכת ושמאית נדל&quot;ן הפועלת באשקלון ומתמחה בכל סוגי
          הנכסים בעיר. היא מלווה לקוחות לכל אורך הדרך בגישה מקצועית, שקופה
          וידידותית, תוך מתן שירות מלא גם לדוברי רוסית בשפתם.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          אנג׳לה חיה באשקלון כבר מעל 30 שנה, אוהבת את העיר ורואה שליחות בקידום
          השוק המקומי. היא מקפידה על סטנדרט מקצועי גבוה ועל תהליך ברור שמייצר
          ביטחון ללקוחות בכל החלטה.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          בנוסף לפעילות המקצועית, אנג׳לה פעילה ברשתות החברתיות עם קהילה של מעל
          80,000 עוקבים בטיקטוק, שם היא משתפת בעיקר מהחיים שלה.
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
