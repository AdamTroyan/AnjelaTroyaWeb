export const metadata = {
  title: "תעודות והסמכות | ANJELA TROYA",
};

const certifications = [
  {
    title: "רישיון תיווך במקרקעין",
    body: "רישיון בתוקף לעיסוק בתיווך נדל\" בישראל.",
  },
  {
    title: "שמאות מקרקעין",
    body: "רקע שמאי מקצועי לתמחור, בדיקות שווי וניתוח שוק.",
  },
  {
    title: "הכשרות מקצועיות",
    body: "השתלמויות עדכניות בתחומי שיווק נכסים, מימון ורגולציה.",
  },
];

export default function CertificationsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">תעודות והסמכות</h1>
        <p className="mt-3 text-sm text-slate-600">
          שילוב בין רישוי מקצועי להכשרה שמאית מאפשר ליווי בטוח ומדויק בעסקאות נדל"ן.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {certifications.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">
          ניתן לבקש הצגת תעודות מקוריות בפגישה.
        </p>
      </div>
    </section>
  );
}
