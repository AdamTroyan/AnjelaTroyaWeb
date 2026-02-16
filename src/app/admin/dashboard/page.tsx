import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import { prisma } from "@/lib/prisma";
import type { PortfolioItem, Property } from "@prisma/client";
import { formatPrice } from "@/lib/format";
import {
  createProperty,
  deleteProperty,
  createPortfolioItem,
  deletePortfolioItem,
  toggleProperty,
} from "./actions";
import ConfirmActionButton from "./ConfirmActionButton";
import CreatePropertyForm from "./CreatePropertyForm";
import ActionForm from "@/components/ActionForm";

export const runtime = "nodejs";

export default async function AdminDashboardPage() {
  const user = await getUserFromCookies();
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const [properties, portfolioItems, stats, topViewed, inquiryStats] = await Promise.all([
    prisma.property.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.property.aggregate({
      _count: { id: true },
      _sum: { viewCount: true },
    }),
    prisma.property.findMany({
      orderBy: { viewCount: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        viewCount: true,
        type: true,
      },
    }),
    prisma.$transaction([
      prisma.propertyInquiry.count(),
      prisma.contactInquiry.count(),
    ]),
  ]);

  const [propertyInquiryCount, contactInquiryCount] = inquiryStats;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">דשבורד ניהול</h1>
          <p className="mt-2 text-sm text-slate-600">
            ניהול נכסים מהאתר במקום אחד.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">נכסים במערכת</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {stats._count.id}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">צפיות בדפי נכסים</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {stats._sum.viewCount ?? 0}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">פניות מנכסים</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {propertyInquiryCount}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">פניות כלליות</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {contactInquiryCount}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">הכי נצפים</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {topViewed.length === 0 ? (
            <p className="text-sm text-slate-500">אין נכסים להצגה.</p>
          ) : (
            topViewed.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.type === "SALE" ? "למכירה" : "להשכרה"}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  {item.viewCount} צפיות
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">הוספת נכס</h2>
          <CreatePropertyForm action={createProperty} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">נכסים קיימים</h2>
          <div className="mt-6 grid gap-4">
            {properties.length === 0 ? (
              <p className="text-sm text-slate-500">אין נכסים במערכת.</p>
            ) : (
              properties.map((property: Property) => (
                <div
                  key={property.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {property.imageUrls[0] ? (
                        <img
                          className="h-16 w-20 rounded-xl object-cover"
                          src={property.imageUrls[0]}
                          alt={property.title}
                        />
                      ) : null}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {property.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {property.type === "SALE" ? "למכירה" : "להשכרה"} · מחיר: {formatPrice(property.price)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {property.imageUrls.length} תמונות
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        property.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {property.isActive ? "פעיל" : "לא פעיל"}
                    </span>
                    {property.isHot ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        חם
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                      href={`/admin/properties/${property.id}/edit`}
                    >
                      עריכה
                    </a>
                    <ActionForm action={toggleProperty} id={`toggle-${property.id}`}>
                      <input type="hidden" name="id" value={property.id} />
                      <ConfirmActionButton
                        formId={`toggle-${property.id}`}
                        label={property.isActive ? "השבתה" : "הפעלה"}
                        title={property.isActive ? "השבתת נכס" : "הפעלת נכס"}
                        description={
                          property.isActive
                            ? "האם להשבית את הנכס הזה מהתצוגה באתר?"
                            : "האם להפעיל את הנכס הזה ולהציג אותו באתר?"
                        }
                      />
                    </ActionForm>
                    <ActionForm action={deleteProperty} id={`delete-${property.id}`}>
                      <input type="hidden" name="id" value={property.id} />
                      <ConfirmActionButton
                        formId={`delete-${property.id}`}
                        label="מחיקה"
                        title="מחיקת נכס"
                        description="האם למחוק את הנכס הזה לצמיתות? לא ניתן לשחזר."
                        variant="danger"
                      />
                    </ActionForm>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">תיק עבודות (פרטי)</h2>
          <p className="mt-2 text-sm text-slate-600">
            פריטים בתיק העבודות נשמרים לצפייה פנימית בלבד.
          </p>
          <ActionForm className="mt-6 grid gap-4" action={createPortfolioItem}>
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              aria-label="כותרת הפרויקט"
              name="title"
              placeholder="כותרת הפרויקט"
              required
            />
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              aria-label="מיקום או עיר (לא חובה)"
              name="location"
              placeholder="מיקום / עיר (לא חובה)"
            />
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              aria-label="תוצאה או הישג (לא חובה)"
              name="outcome"
              placeholder="תוצאה / הישג (לא חובה)"
            />
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              aria-label="תאריך סגירה"
              name="closedAt"
              type="date"
            />
            <textarea
              className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              aria-label="תיאור קצר"
              name="description"
              placeholder="תיאור קצר"
            />
            <button
              className="w-fit rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              שמירה
            </button>
          </ActionForm>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">פריטי תיק עבודות</h2>
          <div className="mt-6 grid gap-4">
            {portfolioItems.length === 0 ? (
              <p className="text-sm text-slate-500">אין פריטים עדיין.</p>
            ) : (
              portfolioItems.map((item: PortfolioItem) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.location || "ללא מיקום"}
                        {item.closedAt ? ` · ${item.closedAt.toLocaleDateString("he-IL")}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      פרטי
                    </span>
                  </div>
                  {item.outcome ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      {item.outcome}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  ) : null}
                  <ActionForm
                    className="mt-3"
                    action={deletePortfolioItem}
                    id={`delete-portfolio-${item.id}`}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmActionButton
                      formId={`delete-portfolio-${item.id}`}
                      label="מחיקה"
                      title="מחיקת פריט"
                      description="האם למחוק את הפריט הזה לצמיתות?"
                      variant="danger"
                    />
                  </ActionForm>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
