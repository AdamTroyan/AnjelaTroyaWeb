import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">הדף לא נמצא</h1>
      <p className="mt-3 text-base text-slate-600">
        לא הצלחנו למצוא את הדף שחיפשת. ייתכן שהקישור שגוי או שהדף הוסר.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          לעמוד הראשי
        </Link>
        <Link
          href="/properties/sale"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          נכסים למכירה
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          צור קשר
        </Link>
      </div>
    </section>
  );
}
