import { prisma } from "@/lib/prisma";
import TestimonialsForm from "./TestimonialsForm";

type TestimonialItem = {
  id: string;
  firstName: string;
  lastName: string;
  hideLastName: boolean;
  message: string;
  rating: number;
  createdAt: Date;
};

function getDisplayName(item: TestimonialItem) {
  if (item.hideLastName) {
    const initial = item.lastName.trim().charAt(0);
    return initial ? `${item.firstName} ${initial}.` : item.firstName;
  }
  return `${item.firstName} ${item.lastName}`;
}

function getStats(items: TestimonialItem[]) {
  const total = items.length;
  const average = total
    ? items.reduce((sum, item) => sum + item.rating, 0) / total
    : 0;

  return { total, average };
}

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      hideLastName: true,
      message: true,
      rating: true,
      createdAt: true,
    },
  });
  const stats = getStats(testimonials);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">המלצות</h1>
        <p className="mt-3 text-sm text-slate-600">
          נשמח לשמוע על החוויה שלכם כדי שאחרים יוכלו להתרשם.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">
            ממוצע דירוג: {stats.average.toFixed(1)} / 5
          </p>
          <span className="text-xs text-slate-500">סה"כ {stats.total} המלצות</span>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">כתבו המלצה</h2>
          <TestimonialsForm />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {testimonials.length === 0 ? (
            <p className="text-sm text-slate-500">עדיין אין המלצות. נשמח להיות הראשונים!</p>
          ) : (
            testimonials.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {getDisplayName(item)}
                  </p>
                  <span className="text-xs font-semibold text-amber-600">
                    כוכבים: {item.rating}/5
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">&quot;{item.message}&quot;</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
