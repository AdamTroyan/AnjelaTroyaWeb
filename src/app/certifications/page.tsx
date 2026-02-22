export const metadata = {
  title: "רישיון והסמכות | ANJELA TROYA",
};

const certifications = [
  {
    title: "רישיון תיווך במקרקעין",
    body: "רישיון פעיל ובתוקף לעיסוק בתיווך נדל\"ן בישראל. מספר רישיון: 31034469.",
  },
  {
    title: "לימודי שמאות מקרקעין",
    body: "כרגע בתהליך לימודים — לצורך העמקת הידע בתמחור, ניתוח שוק ובדיקות שווי.",
  },
  {
    title: "ניסיון מקצועי",
    body: "5 שנות ניסיון בתיווך נדל\"ן באשקלון, עם היכרות עמוקה עם השוק המקומי על כל סוגי הנכסים.",
  },
];

export default function CertificationsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">רישיון והסמכות</h1>
        <p className="mt-3 text-sm text-slate-600">
          מקצועיות מתחילה מהכשרה נכונה ורישוי מתאים. כאן תמצאו את הפרטים על ההסמכות שלי.
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
          ניתן לבקש הצגת רישיון מקורי בפגישה.
        </p>
      </div>
    </section>
  );
}
