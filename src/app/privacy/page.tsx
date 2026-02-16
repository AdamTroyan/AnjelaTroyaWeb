export const metadata = {
  title: "מדיניות פרטיות | ANJELA TROYA",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Privacy Policy
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">מדיניות פרטיות</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              מדיניות פרטיות זו מפרטת את אופן איסוף, שימוש ושמירה של מידע אישי
              במסגרת השימוש באתר, בהתאם לדין הישראלי.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            עדכון אחרון: 14.02.2026
          </div>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">1. סוגי מידע שנאספים</h2>
            <p className="mt-2 font-semibold">(א) מידע הנמסר בטפסי פנייה באתר</p>
            <p className="mt-2">
              בעת מילוי טפסים באתר (כגון: יצירת קשר, הערכת שווי, פנייה כללית או פנייה
              לגבי מכירה/השכרה), המשתמש עשוי למסור מידע כגון: שם, מספר טלפון, כתובת
              דוא"ל (אופציונלי), ותוכן הפנייה (לרבות פרטים אודות נכס, כתובת או סוג נכס).
            </p>
            <p className="mt-4 font-semibold">(ב) מידע לצורך התראות נכסים</p>
            <p className="mt-2">
              בעת הרשמה לקבלת התראות על נכסים, נאסף מידע כגון: כתובת דוא"ל, וכן
              העדפות סינון (כגון מחיר, מספר חדרים, סוג נכס). בנוסף, נשמרים נתוני
              הסכמה לצורך תיעוד ההרשמה, לרבות: מועד ההרשמה, כתובת IP, סוג
              דפדפן/מכשיר ומקור ההסכמה.
            </p>
            <p className="mt-4 font-semibold">(ג) מידע שנמסר במסגרת המלצות</p>
            <p className="mt-2">
              בעת כתיבת המלצה באתר, נשמרים פרטי ההמלצה בבסיס הנתונים לצורך
              הצגתה בדף ההמלצות. המידע כולל: כתובת IP, שם פרטי ושם משפחה כפי
              שנמסרו על ידי המשתמש (ייתכן שהם אינם נכונים), בחירה האם להסתיר את
              שם המשפחה בפרסום, וכן תוכן ההמלצה והדירוג שנבחר.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">2. מטרות השימוש במידע</h2>
            <p className="mt-2">המידע שנאסף משמש למטרות הבאות בלבד:</p>
            <ul className="mt-2 list-disc space-y-1 pr-5">
              <li>מענה לפניות שהתקבלו דרך האתר</li>
              <li>יצירת קשר ותיאום שיחות/פגישות</li>
              <li>מתן מידע או שירותי תיווך נדל"ן</li>
              <li>שליחת התראות על נכסים בהתאם להעדפות המשתמש (למי שנרשם לכך)</li>
            </ul>
            <p className="mt-2">
              האתר אינו עושה שימוש במידע לצרכים שיווקיים שאינם קשורים להתראות הנכסים.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">3. טיפול בפניות מהטפסים</h2>
            <p className="mt-2">
              פרטי פניות שנשלחות באמצעות טפסי האתר אינם נשמרים בבסיס הנתונים של
              האתר, אלא מועברים אל בעל העסק באמצעות הודעת דוא"ל בלבד.
            </p>
            <p className="mt-2">
              בהתאם לכך, עיקר שמירת המידע ביחס לפניות נעשית בתיבת הדוא"ל של בעל
              העסק, בהתאם למדיניות השמירה של ספק הדוא"ל.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              4. התראות נכסים ושמירת מידע בבסיס הנתונים
            </h2>
            <p className="mt-2">
              פרטי ההרשמה להתראות נכסים נשמרים בבסיס נתונים לצורך הפעלת השירות.
            </p>
            <p className="mt-4 font-semibold">תקופת שמירה</p>
            <p className="mt-2">
              המידע הקשור להתראות נשמר לתקופה של עד 180 ימים (6 חודשים) ממועד
              ההרשמה או עד לביטול ההרשמה (לפי המוקדם מביניהם).
            </p>
            <p className="mt-4 font-semibold">ביטול הרשמה ומחיקה</p>
            <p className="mt-2">
              ניתן לבטל את ההרשמה להתראות בכל עת באמצעות קישור הסרה המופיע בכל
              הודעת התראה. לאחר ביטול ההרשמה, פרטי המשתמש נמחקים ממערכת ההתראות
              באופן מיידי.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">5. העברת מידע לצדדים שלישיים</h2>
            <p className="mt-2">
              המידע עשוי להיות מועבר לספקי שירות טכנולוגיים הדרושים להפעלת האתר,
              כגון:
            </p>
            <ul className="mt-2 list-disc space-y-1 pr-5">
              <li>שירותי אחסון ותשתיות</li>
              <li>שירותי דוא"ל (SMTP)</li>
            </ul>
            <p className="mt-2">
              העברת המידע מתבצעת אך ורק לצורך תפעול האתר והשירותים המוצעים בו.
              האתר אינו מוכר מידע אישי לצדדים שלישיים.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">6. קישורים ושירותים חיצוניים</h2>
            <p className="mt-2">
              האתר עשוי לכלול קישור חיצוני לעמוד TikTok של העסק. לחיצה על הקישור
              והשימוש בשירות TikTok כפופים לתנאי השימוש ולמדיניות הפרטיות של TikTok.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">7. אבטחת מידע</h2>
            <p className="mt-2">
              האתר עושה שימוש באמצעי אבטחה סבירים, לרבות שימוש בפרוטוקול מאובטח
              (HTTPS), לצורך שמירה על המידע ומניעת גישה בלתי מורשית. עם זאת, אין
              באפשרותנו להבטיח חסינות מוחלטת מפני חדירה, שיבוש או גישה בלתי מורשית.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">8. זכויות משתמשים</h2>
            <p className="mt-2">
              בהתאם לחוק הגנת הפרטיות, משתמש רשאי לבקש לעיין במידע אישי שנשמר עליו,
              לתקן או למחוק מידע, וכן לבקש הבהרות בנוגע לשימוש במידע.
            </p>
            <p className="mt-2">
              פניות בנושא פרטיות ניתן לשלוח לכתובת הדוא"ל:
              adamulyalox@gmail.com
            </p>
            <p className="mt-2">ייתכן שנבקש פרטי אימות בסיסיים לצורך זיהוי הפונה.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">9. עוגיות (Cookies) וזיכרון מקומי</h2>
            <p className="mt-2">
              האתר עושה שימוש בעוגיות (Cookies) ובאחסון מקומי בדפדפן לצרכים
              תפעוליים, לרבות:
            </p>
            <ul className="mt-2 list-disc space-y-1 pr-5">
              <li>שמירת הסכמה לעוגיות (cookie_consent)</li>
              <li>שמירת שפה (lang)</li>
              <li>שמירת כתובת דוא"ל להתראות לפי בחירת המשתמש (alerts_email)</li>
              <li>שמירת אסימון התחברות לממשק אדמין (admin_token)</li>
              <li>שמירת רשימת נכסים מועדפים באמצעות localStorage (favoriteProperties)</li>
            </ul>
            <p className="mt-2">
              ניתן למחוק או לחסום עוגיות ואחסון מקומי באמצעות הגדרות הדפדפן.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">10. Analytics / Pixel</h2>
            <p className="mt-2">
              נכון למועד זה, האתר אינו עושה שימוש ב-Google Analytics / Google Tag Manager,
              Meta Pixel או TikTok Pixel.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">11. פרטי בעל האתר</h2>
            <p className="mt-2">
              אנג'לה טרויאנובסקי נדל"ן
              <br />
              המשרד אינו מקבל קהל בכתובת קבועה.
              <br />
              מספר רישיון תיווך: 31034469
              <br />
              לפניות בנושא פרטיות: adamulyalox@gmail.com
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">12. שינויים במדיניות</h2>
            <p className="mt-2">
              מדיניות פרטיות זו עשויה להתעדכן מעת לעת. הגרסה המעודכנת תפורסם בעמוד
              זה, ותאריך העדכון האחרון ישתנה בהתאם.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
