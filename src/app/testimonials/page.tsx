const testimonials = [
  {
    name: "מורן ל.",
    text: "ליווי מקצועי, אמין ועם זמינות מלאה לאורך כל הדרך.",
  },
  {
    name: "יואב ש.",
    text: "קיבלנו הערכת שווי מדויקת ותהליך ברור בלי הפתעות.",
  },
  {
    name: "שירה מ.",
    text: "הגישה האישית והדיוק בפרטים עשו את ההבדל הגדול.",
  },
];

export default function TestimonialsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">המלצות</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <p className="text-sm text-slate-600">&quot;{item.text}&quot;</p>
              <p className="mt-4 text-sm font-semibold text-slate-800">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
