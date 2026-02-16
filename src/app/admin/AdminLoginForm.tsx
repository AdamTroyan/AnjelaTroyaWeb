"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get("email");
    const passwordValue = formData.get("password");
    const email = typeof emailValue === "string" ? emailValue.trim() : "";
    const password = typeof passwordValue === "string" ? passwordValue : "";

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setError("פרטי התחברות שגויים. נסו שוב.");
      return;
    }
    const data = (await response.json().catch(() => null)) as { role?: string } | null;
    if (data?.role !== "ADMIN") {
      setError("אין הרשאות מנהל למשתמש הזה.");
      return;
    }

    startTransition(() => {
      router.push("/admin/dashboard");
    });
  };

  return (
    <section className="mx-auto w-full max-w-md px-6 py-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">התחברות מנהל</h1>
        <p className="mt-3 text-sm text-slate-600">נא להזין אימייל וסיסמה.</p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold text-slate-700" htmlFor="email">
            אימייל
          </label>
          <input
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            id="email"
            name="email"
            type="email"
            required
          />
          <label className="text-sm font-semibold text-slate-700" htmlFor="password">
            סיסמה
          </label>
          <input
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            id="password"
            name="password"
            type="password"
            required
          />
          {error ? (
            <p className="text-sm text-rose-600" aria-live="polite">
              {error}
            </p>
          ) : null}
          <button
            className="mt-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "מתחבר..." : "התחברות"}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">המערכת תשמור אותך מחובר עד להתנתקות.</p>
      </div>
    </section>
  );
}
