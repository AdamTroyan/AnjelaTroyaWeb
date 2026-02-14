export const metadata = {
  title: "שאלות נפוצות | ANJELA TROYA",
};

const faqs = [
  {
    question: "מה ההבדל בין שמאות לתיווך?",
    answer: "שמאות עוסקת בהערכת שווי מקצועית ומבוססת נתונים, בעוד תיווך מתמקד בליווי העסקה ובהשגת העסקה המתאימה ביותר ללקוח.",
  },
  {
    question: "איך נקבע מחיר הנכס?",
    answer: "המחיר נקבע לפי עסקאות דומות באזור, מצב הנכס, ביקוש והיצע, ותנאי השוק הנוכחיים.",
  },
  {
    question: "כמה זמן לוקח למכור נכס?",
    answer: "משך המכירה משתנה לפי אזור, מחיר ומוכנות השוק. אנו בונים אסטרטגיה שמקצרת את הזמן לשוק ומגדילה סיכוי לסגירה.",
  },
  {
    question: "האם אתם מלווים גם נכסים להשכרה?",
    answer: "כן, אנו מלווים גם השכרות עם בדיקות רקע, חוזים וליווי תהליך מלא.",
  },
  {
    question: "האם אתם עובדים עם עו\"ד ומשכנתאות?",
    answer: "אנו עובדים מול גורמים מקצועיים לפי הצורך ומסייעים בחיבור לאנשי מקצוע מתאימים.",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">FAQ מקצועי</h1>
        <p className="mt-3 text-sm text-slate-600">
          תשובות לשאלות נפוצות שעולות אצל לקוחות לפני התחלת תהליך.
        </p>
        <div className="mt-8 space-y-4">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-semibold text-slate-900">{item.question}</p>
              <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
