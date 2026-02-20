import Link from "next/link";
import { createValuationInquiry } from "./actions";

export const runtime = "nodejs";

type ValuationPageProps = {
  searchParams?: Promise<{ sent?: string }>;
};

export default async function ValuationPage({ searchParams }: ValuationPageProps) {
  const params = await searchParams;
  const sent = params?.sent === "1";

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">בקשת הערכת שווי</h1>
        <p className="mt-3 text-sm text-slate-600">
          מלאו פרטים ונחזור אליכם עם הערכה מקצועית לנכס.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          ההערכה אינה מהווה שומת שמאי מחייבת או ייעוץ משפטי/פיננסי, והיא כפופה
          לבדיקה, למסמכים ולנתוני שוק עדכניים.
        </p>
        {sent ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            תודה! קיבלנו את הבקשה ונחזור אליכם בהקדם.
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" action={createValuationInquiry}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="sr-only" htmlFor="valuation-name">
              שם מלא
            </label>
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              id="valuation-name"
              name="name"
              placeholder="שם מלא"
              required
            />
            <label className="sr-only" htmlFor="valuation-phone">
              טלפון
            </label>
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              id="valuation-phone"
              name="phone"
              placeholder="טלפון"
              required
            />
          </div>
          <label className="sr-only" htmlFor="valuation-email">
            אימייל (לא חובה)
          </label>
          <input
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            id="valuation-email"
            name="email"
            placeholder="אימייל (לא חובה)"
            type="email"
          />
          <label className="sr-only" htmlFor="valuation-address">
            כתובת הנכס (רחוב ומספר, עיר)
          </label>
          <input
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            id="valuation-address"
            name="address"
            placeholder='כתובת הנכס (רחוב+מספר, עיר)'
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="sr-only" htmlFor="valuation-type">
              סוג נכס
            </label>
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              id="valuation-type"
              name="propertyType"
              defaultValue=""
            >
              <option value="">סוג נכס</option>
              <option value="דירה">דירה</option>
              <option value="בית פרטי">בית פרטי</option>
              <option value="פנטהאוז">פנטהאוז</option>
              <option value="דופלקס">דופלקס</option>
              <option value="מגרש">מגרש</option>
              <option value="אחר">אחר</option>
            </select>
            <label className="sr-only" htmlFor="valuation-rooms">
              מספר חדרים
            </label>
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              id="valuation-rooms"
              name="rooms"
              placeholder="מספר חדרים"
            />
          </div>
          <label className="sr-only" htmlFor="valuation-notes">
            פרטים נוספים שחשוב לדעת
          </label>
          <textarea
            className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            id="valuation-notes"
            name="notes"
            placeholder="פרטים נוספים שחשוב לדעת"
          />
          <button
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="submit"
          >
            שליחת בקשה
          </button>
          <p className="text-xs text-slate-500">
            בלחיצה על "שליחת בקשה" אתם מאשרים את
            {" "}
            <Link className="font-semibold text-slate-600 hover:text-slate-800" href="/privacy">
              מדיניות הפרטיות
            </Link>
            {" "}
            ואת
            {" "}
            <Link className="font-semibold text-slate-600 hover:text-slate-800" href="/terms">
              תנאי השימוש
            </Link>
            {"."}
          </p>
        </form>
      </div>
    </section>
  );
}
