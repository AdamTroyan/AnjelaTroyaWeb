"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-rose-500">שגיאה</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">משהו השתבש</h1>
      <p className="mt-3 text-base text-slate-600">
        אנו מתנצלים. אירעה שגיאה בלתי צפויה. נסו שוב או חזרו לעמוד הראשי.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          type="button"
        >
          נסו שוב
        </button>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          לעמוד הראשי
        </Link>
      </div>
    </section>
  );
}
