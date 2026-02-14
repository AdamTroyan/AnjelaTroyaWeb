export const metadata = {
  title: "שקיפות עמלות | ANJELA TROYA",
};

const feeNotes = [
  "שכר הטרחה נקבע בהתאם לסוג הנכס, מורכבות העסקה והיקף הליווי.",
  "לפני תחילת עבודה מתקבלת הצעה מסודרת הכוללת את כל מרכיבי השירות.",
  "אין הפתעות בדרך - כל עלות נבחנת ומוסברת מראש.",
];

export default function FeesPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">שקיפות עמלות</h1>
        <p className="mt-3 text-sm text-slate-600">
          מדיניות ברורה שמאפשרת להבין מראש את מבנה העמלות והשירות.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {feeNotes.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">
          לפרטים מדויקים, ניתן להשאיר פרטים ונחזור אליכם עם הצעה מותאמת.
        </p>
      </div>
    </section>
  );
}
