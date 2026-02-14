import Link from "next/link";
import HotPropertiesMap from "./HotPropertiesMap";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import type { Property } from "@prisma/client";

export const runtime = "nodejs";

export default async function Home() {
  const [saleHighlights, rentHighlights, hotProperties] = await Promise.all([
    prisma.property.findMany({
      where: { type: "SALE", isActive: true },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.property.findMany({
      where: { type: "RENT", isActive: true },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.property.findMany({
      where: { isHot: true, isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        address: true,
        latitude: true,
        longitude: true,
      },
      take: 8,
    }),
  ]);

  return (
    <div className="bg-slate-50">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">תיווך ושמאות נדל&quot;ן</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
            מי אני ומה החזון שלי
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            אני אנג׳לה טרויה, מתווכת ושמאית נדל&quot;ן באשקלון. החזון שלי הוא שכל אדם
            שרוצה להשכיר או למכור דירה יקבל שירות מקצועי, קשוב ושקוף, שמוביל
            לקבלת החלטות בטוחות ולתוצאה הטובה ביותר עבורו. אני מלווה לקוחות מכל
            הקהלים, עם דגש על שירות מלא לדוברי רוסית בשפתם.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/contact"
            >
              צור קשר
            </a>
            <a
              className="rounded-md border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              href="/properties/sale"
            >
              צפייה בנכסים
            </a>
          </div>
        </div>

        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">אודות</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              שילוב בין מקצועיות שמאית לשירות אישי מאפשר לי ללוות בעלי נכסים
              באשקלון בתהליך מסודר, רגוע ומדויק, עם זמינות גבוהה ותקשורת בשפת
              הלקוח.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">דיוק מקצועי</h3>
            <p className="mt-2 text-sm text-slate-600">
              הערכות שווי מפורטות ותכנון מסלול פעולה לפי מטרות הלקוח.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">ליווי אישי</h3>
            <p className="mt-2 text-sm text-slate-600">
              זמינות גבוהה, תקשורת רציפה ותיאום מלא עד החתימה.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                דירות למכירה
              </h2>
              <a className="text-sm font-semibold text-slate-600" href="/properties/sale">
                לכל הנכסים
              </a>
            </div>
            <div className="mt-6 space-y-4">
              {saleHighlights.length === 0 ? (
                <p className="text-sm text-slate-500">אין נכסים זמינים כרגע.</p>
              ) : (
                saleHighlights.map((item: Property) => (
                  <Link
                    key={item.id}
                    className="relative block overflow-hidden rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
                    href={`/properties/${item.id}`}
                  >
                    {item.isHot ? (
                      <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white">
                        חם
                      </span>
                    ) : null}
                    {item.status !== "AVAILABLE" ? (
                      <span className="absolute -left-10 top-5 w-36 -rotate-45 bg-rose-600 py-1 text-center text-[11px] font-semibold text-white">
                        {item.type === "SALE" ? "נמכר" : "הושכר"}
                      </span>
                    ) : null}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        {item.imageUrls[0] ? (
                          <img
                            className="h-20 w-24 rounded-xl object-cover"
                            src={item.imageUrls[0]}
                            alt={item.title}
                          />
                        ) : null}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            דירה: {item.title}
                          </h3>
                          <p className="mt-2 text-xs font-semibold text-slate-500">תיאור הנכס:</p>
                          <p className="mt-2 text-sm text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        מחיר: {formatPrice(item.price)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                דירות להשכרה
              </h2>
              <a className="text-sm font-semibold text-slate-600" href="/properties/rent">
                לכל הנכסים
              </a>
            </div>
            <div className="mt-6 space-y-4">
              {rentHighlights.length === 0 ? (
                <p className="text-sm text-slate-500">אין נכסים זמינים כרגע.</p>
              ) : (
                rentHighlights.map((item: Property) => (
                  <Link
                    key={item.id}
                    className="relative block overflow-hidden rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
                    href={`/properties/${item.id}`}
                  >
                    {item.isHot ? (
                      <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white">
                        חם
                      </span>
                    ) : null}
                    {item.status !== "AVAILABLE" ? (
                      <span className="absolute -left-10 top-5 w-36 -rotate-45 bg-rose-600 py-1 text-center text-[11px] font-semibold text-white">
                        {item.type === "SALE" ? "נמכר" : "הושכר"}
                      </span>
                    ) : null}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        {item.imageUrls[0] ? (
                          <img
                            className="h-20 w-24 rounded-xl object-cover"
                            src={item.imageUrls[0]}
                            alt={item.title}
                          />
                        ) : null}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            דירה: {item.title}
                          </h3>
                          <p className="mt-2 text-xs font-semibold text-slate-500">תיאור הנכס:</p>
                          <p className="mt-2 text-sm text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        מחיר: {formatPrice(item.price)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>

        {hotProperties.length > 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">נכסים חמים במפה</h2>
              <a className="text-sm font-semibold text-slate-600" href="/properties/sale">
                לכל הנכסים
              </a>
            </div>
            <div className="mt-4">
              <HotPropertiesMap
                markers={hotProperties
                  .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
                  .map((item) => ({
                    id: item.id,
                    title: item.title,
                    address: item.address ?? null,
                    latitude: item.latitude as number,
                    longitude: item.longitude as number,
                  }))}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">המלצות</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <p>&quot;ליווי מקצועי ורגוע. קיבלנו מענה לכל שאלה בדרך.&quot;</p>
              <p>&quot;תהליך ממוקד, שקוף ומהיר. קיבלנו החלטות בביטחון.&quot;</p>
            </div>
            <a className="mt-4 inline-block text-sm font-semibold text-slate-600" href="/testimonials">
              לכל ההמלצות
            </a>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">צור קשר</h2>
            <p className="mt-3 text-sm text-slate-600">
              לתיאום פגישה, שיחת ייעוץ או קבלת הערכת שווי, אפשר להשאיר פרטים
              ונחזור אליך במהירות.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>טלפון: 054-317-9762</span>
              <span>אימייל: adamtroy@gmail.com</span>
            </div>
            <a
              className="mt-6 inline-block rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/contact"
            >
              לפתיחת פנייה
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
