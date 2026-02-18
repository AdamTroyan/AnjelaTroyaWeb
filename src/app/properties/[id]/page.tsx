import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getSiteUrl } from "@/lib/siteUrl";
import ImageLightbox from "./ImageLightbox";
import PropertyShareActions from "./PropertyShareActions";
import { createPropertyInquiry } from "./actions";
import FavoriteToggle from "../FavoriteToggle";

export const runtime = "nodejs";

type PropertyPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property || !property.isActive) {
    return {};
  }

  const siteUrl = getSiteUrl();
  const propertyUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/properties/${id}` : undefined;
  const title = `דירה: ${property.title}`;
  const description = property.description?.slice(0, 160) || "נכס חדש באתר.";
  const images = property.imageUrls.length > 0 ? property.imageUrls : undefined;

  return {
    title,
    description,
    alternates: propertyUrl ? { canonical: propertyUrl } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      url: propertyUrl,
      images,
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property || !property.isActive) {
    notFound();
  }

  // Increment view count (simple approach - no dedup)
  // Note: We don't use cookies for dedup since cookies().set() is not allowed in Server Components
  await prisma.property.update({
    where: { id: property.id },
    data: { viewCount: { increment: 1 } },
  });

  const whatsappMessage = `שלום, אשמח לקבל פרטים לגבי הנכס: ${property.title}`;
  const whatsappUrl = `https://wa.me/972543179762?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const siteUrl = getSiteUrl();
  const propertyUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/properties/${property.id}` : "";

  const details = Array.isArray(property.details)
    ? property.details.filter(
        (item): item is { label: string; value: string } =>
          typeof item === "object" &&
          item !== null &&
          "label" in item &&
          "value" in item &&
          typeof (item as { label?: unknown }).label === "string" &&
          typeof (item as { value?: unknown }).value === "string"
      )
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: property.title,
    description: property.description,
    url: propertyUrl || undefined,
    price: property.price,
    priceCurrency: "ILS",
    availability: property.isActive ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    itemOffered: {
      "@type": "Apartment",
      address: property.address
        ? {
            "@type": "PostalAddress",
            streetAddress: property.address,
          }
        : undefined,
    },
    image: property.imageUrls.length > 0 ? property.imageUrls : undefined,
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {property.status !== "AVAILABLE" ? (
          <span className="absolute -left-12 top-8 w-44 -rotate-45 bg-rose-600 py-2 text-center text-xs font-semibold text-white">
            {property.type === "SALE" ? "נמכר" : "הושכר"}
          </span>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              דירה: {property.title}
            </h1>
            {property.address ? (
              <p className="mt-2 text-sm text-slate-600">כתובת: {property.address}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {property.type === "SALE" ? "למכירה" : "להשכרה"}
              </span>
              {property.isHot ? (
                <span className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                  חם
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FavoriteToggle propertyId={property.id} />
            <span className="text-lg font-semibold text-slate-800">
              מחיר: {formatPrice(property.price)}
            </span>
          </div>
        </div>

        {property.imageUrls.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-500">תמונות מהנכס:</p>
            <ImageLightbox images={property.imageUrls} title={property.title} />
          </div>
        ) : null}

        <p className="mt-8 text-sm font-semibold text-slate-500">תיאור הנכס:</p>
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-600">
          {property.description}
        </p>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <p>
            המידע באתר מבוסס על נתונים שנמסרו על ידי בעלי הנכס וייתכנו טעויות.
          </p>
          <p className="mt-1">
            הנתונים והמחיר אינם מהווים התחייבות או הצעה מחייבת.
          </p>
          <p className="mt-1">
            המחיר וזמינות הנכס כפופים לאישור סופי ולשינויים.
          </p>
        </div>

        {details.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500">פרטי הנכס:</p>
            <div className="mt-3 grid gap-2">
              {details.map((item, index) => (
                <div
                  key={`${property.id}-detail-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <span className="font-semibold text-slate-800">{item.label}:</span>{" "}
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {property.address ? (
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-500">מיקום במפה:</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title="מפת הנכס"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  property.address
                )}&output=embed`}
                className="h-72 w-full"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PropertyShareActions title={property.title} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">לתיאום ביקור</h2>
            <p className="mt-2 text-sm text-slate-600">
              רוצה פרטים נוספים או תיאום סיור? אפשר ליצור קשר ישירות.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                טלפון: <a className="font-semibold text-slate-800" href="tel:+972543179762">054-317-9762</a>
              </p>
              <p>
                אימייל: <a className="font-semibold text-slate-800" href="mailto:adamtroy@gmail.com">adamtroy@gmail.com</a>
              </p>
            </div>
            <a
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              שליחת הודעה ב-WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">פנייה לגבי הנכס</h2>
          <p className="mt-2 text-sm text-slate-600">
            שלחו פרטים קצרים ואחזור אליכם במהירות.
          </p>
          <form className="mt-4 grid gap-3" action={createPropertyInquiry}>
            <input type="hidden" name="propertyId" value={property.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <label className="sr-only" htmlFor="property-inquiry-name">
                שם מלא
              </label>
              <input
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                id="property-inquiry-name"
                name="name"
                placeholder="שם מלא"
                required
              />
              <label className="sr-only" htmlFor="property-inquiry-phone">
                טלפון
              </label>
              <input
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                id="property-inquiry-phone"
                name="phone"
                placeholder="טלפון"
                required
              />
            </div>
            <label className="sr-only" htmlFor="property-inquiry-email">
              אימייל (לא חובה)
            </label>
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              id="property-inquiry-email"
              name="email"
              placeholder="אימייל (לא חובה)"
              type="email"
            />
            <label className="sr-only" htmlFor="property-inquiry-message">
              על מה תרצה לדעת?
            </label>
            <textarea
              className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              id="property-inquiry-message"
              name="message"
              placeholder="על מה תרצה לדעת?"
              required
            />
            <button
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              שליחת פנייה
            </button>
            <p className="text-xs text-slate-500">
              בלחיצה על "שליחת פנייה" אתם מאשרים את
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
      </div>
    </section>
  );
}