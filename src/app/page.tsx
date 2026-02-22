import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import type { Property } from "@prisma/client";
import HotPropertiesMap from "./HotPropertiesMap";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";
export const revalidate = 60;

type TestimonialHighlight = {
  id: string;
  firstName: string;
  lastName: string;
  hideLastName: boolean;
  message: string;
  rating: number;
};

function getDisplayName(item: TestimonialHighlight) {
  if (item.hideLastName) {
    const initial = item.lastName.trim().charAt(0);
    return initial ? `${item.firstName} ${initial}.` : item.firstName;
  }
  return `${item.firstName} ${item.lastName}`;
}

export default async function Home() {
  const siteUrl = getSiteUrl() || "https://anjelatroya.co.il";
  const [saleHighlights, rentHighlights, hotProperties, testimonialHighlights] = await Promise.all([
    prisma.property.findMany({
      where: { type: "SALE", isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        type: true,
        status: true,
        isHot: true,
        imageUrls: true,
      },
      take: 2,
    }),
    prisma.property.findMany({
      where: { type: "RENT", isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        type: true,
        status: true,
        isHot: true,
        imageUrls: true,
      },
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
    prisma.testimonial.findMany({
      where: { rating: { gte: 4 } },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        hideLastName: true,
        message: true,
        rating: true,
      },
      take: 5,
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "ANJELA TROYA",
    url: siteUrl,
    telephone: "+972543179762",
    email: "adamtroy@gmail.com",
    areaServed: "Ashkelon",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ashkelon",
      addressCountry: "IL",
    },
  };

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">תיווך נדל&quot;ן באשקלון</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
            אנג&#39;לה טרויה — תיווך נדל&quot;ן עם לב
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            אני אנג&#39;לה טרויה, מתווכת נדל&quot;ן באשקלון כבר 5 שנים. חיה
            באשקלון מעל 30 שנה, מכירה כל רחוב ושכונה. אני מאמינה שכל אדם
            מגיע לשירות מקצועי, אמין ושקוף — ועובדת מכל הלב כדי שהלקוחות
            שלי ירגישו בטוחים ויצאו מרוצים. עובדת עם דוברי רוסית בשפתם
            ועם כל קהל — הדלת פתוחה לכולם.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/contact"
            >
              צור קשר
            </a>
            <a
              className="rounded-md border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
              href="/valuation"
            >
              הערכת שווי
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
            <h2 className="text-2xl font-semibold text-slate-900">למה לעבוד איתי?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              אני מלווה את הלקוחות שלי מהרגע הראשון ועד לרגע האחרון. מעורבת
              בכל פרט, זמינה בכל שלב, ופועלת בשקיפות מלאה כדי שתרגישו
              בטוחים בכל החלטה.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">קשר אישי</h3>
            <p className="mt-2 text-sm text-slate-600">
              אני לא רק מתווכת — אני שם בשבילכם. זמינות מלאה, תקשורת ישירה
              והקשבה אמיתית לצרכים שלכם.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">מקצועיות ואמינות</h3>
            <p className="mt-2 text-sm text-slate-600">
              ניסיון של 5 שנים בשוק האשקלוני, היכרות עמוקה עם הנכסים
              ותמחור מדויק שמביא תוצאות.
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
                saleHighlights.map((item) => (
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
                          <Image
                            className="h-20 w-24 rounded-xl object-cover"
                            src={item.imageUrls[0]}
                            alt={item.title}
                            width={96}
                            height={80}
                            sizes="96px"
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
                rentHighlights.map((item) => (
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
                          <Image
                            className="h-20 w-24 rounded-xl object-cover"
                            src={item.imageUrls[0]}
                            alt={item.title}
                            width={96}
                            height={80}
                            sizes="96px"
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

        {testimonialHighlights.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">המלצות מובילות</h2>
                <a className="text-sm font-semibold text-slate-600" href="/testimonials">
                  לכל ההמלצות
                </a>
              </div>
              <div className="mt-4 space-y-4">
                {testimonialHighlights.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {getDisplayName(item)}
                      </p>
                      <span className="text-xs font-semibold text-amber-600">
                        כוכבים: {item.rating}/5
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">&quot;{item.message}&quot;</p>
                  </div>
                ))}
              </div>
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
        ) : (
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
        )}
      </section>
    </div>
  );
}
