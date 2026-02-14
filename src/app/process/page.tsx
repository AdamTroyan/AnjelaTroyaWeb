export const metadata = {
  title: "תהליך עבודה | ANJELA TROYA",
};

const steps = [
  {
    title: "אבחון והיכרות",
    body: "הגדרת מטרות, תקציב ולוחות זמנים בהתאם לצרכים שלכם.",
  },
  {
    title: "הערכת שווי ואסטרטגיה",
    body: "ניתוח שוק, תמחור מדויק ובניית תוכנית פעולה מותאמת.",
  },
  {
    title: "שיווק ממוקד",
    body: "הצגת הנכס בצורה מקצועית, תכנים איכותיים וקידום לקהל המתאים.",
  },
  {
    title: "ניהול מו\"מ",
    body: "ליווי מלא במשא ומתן, בדיקות ומסמכים עד לסגירה בטוחה.",
  },
  {
    title: "סגירה וליווי המשך",
    body: "תיאום עם גורמים מקצועיים וליווי עד חתימה והשלמה.",
  },
];

export default function ProcessPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">תהליך עבודה</h1>
        <p className="mt-3 text-sm text-slate-600">
          תהליך מסודר ושקוף שמייצר החלטות בטוחות לאורך כל הדרך.
        </p>
        <div className="mt-8 grid gap-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
