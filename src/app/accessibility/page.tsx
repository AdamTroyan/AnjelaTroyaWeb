export const metadata = {
  title: "הצהרת נגישות | ANJELA TROYA",
};

export default function AccessibilityPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Accessibility Statement
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">הצהרת נגישות</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              אנג'לה טרויאנובסקי נדל"ן רואה חשיבות רבה בהנגשת האתר ומתן שירות שוויוני
              לכלל הציבור, לרבות אנשים עם מוגבלות. בהתאם לכך, בוצעו התאמות נגישות
              באתר בהתאם להוראות הדין בישראל, לרבות תקנות שוויון זכויות לאנשים עם
              מוגבלות (התאמות נגישות לשירות), ובהתאם להנחיות התקן הישראלי ת"י 5568
              המבוסס על תקן WCAG 2.0/2.1 ברמה AA.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            עדכון אחרון: 14.02.2026
          </div>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">1. התאמות נגישות באתר</h2>
            <p className="mt-2">
              האתר מותאם ככל הניתן להנחיות הנגישות המקובלות, לרבות עקרונות תקן
              WCAG 2.0/2.1 ברמה AA, ובכלל זה:
            </p>
            <ul className="mt-2 list-disc space-y-1 pr-5">
              <li>אפשרות ניווט באמצעות מקלדת</li>
              <li>שימוש במבנה כותרות תקין</li>
              <li>התאמה לתצוגה בדפדפנים נפוצים</li>
              <li>טקסטים קריאים וברורים</li>
              <li>שימוש בתיאורי תמונה (alt) בהתאם לצורך</li>
              <li>טפסים עם תוויות ברורות ושדות נגישים</li>
              <li>התאמה לתצוגה במובייל ובמסכים שונים</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">2. סייגים לנגישות</h2>
            <p className="mt-2">
              למרות מאמצינו, ייתכן שחלקים מסוימים באתר אינם נגישים באופן מלא,
              בין היתר בשל מגבלות טכנולוגיות או בשל תכנים/קישורים חיצוניים שאינם
              בשליטתנו (לרבות קישורים לשירותים חיצוניים כגון TikTok).
            </p>
            <p className="mt-2">
              אם נתקלתם בקושי כלשהו בשימוש באתר, נשמח לקבל פנייה ולפעול לתיקון.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">3. פנייה בנושא נגישות</h2>
            <p className="mt-2">לשאלות, בקשות או דיווח על בעיית נגישות, ניתן ליצור קשר:</p>
            <p className="mt-2">
              שם איש קשר: אנג'לה טרויאנובסקי
              <br />
              דוא"ל: adamulyalox@gmail.com
              <br />
              טלפון: 054-765-0236
            </p>
            <p className="mt-2">בעת הפנייה מומלץ לציין:</p>
            <ul className="mt-2 list-disc space-y-1 pr-5">
              <li>תיאור הבעיה</li>
              <li>העמוד בו התרחשה הבעיה</li>
              <li>סוג מכשיר (מחשב/נייד)</li>
              <li>סוג דפדפן וגרסתו</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">4. הסדרי נגישות בעסק</h2>
            <p className="mt-2">
              המשרד אינו מקבל קהל בכתובת קבועה.
              שירותי התיווך ניתנים בתיאום מראש באמצעות טלפון/דוא"ל ובמפגש בהתאם
              לצורך.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">5. תאריך בדיקה אחרון</h2>
            <p className="mt-2">
              הצהרת נגישות זו עודכנה ונבדקה לאחרונה בתאריך: 14.02.2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
