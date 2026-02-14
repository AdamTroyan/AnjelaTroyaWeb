"use client";

import Link from "next/link";
import { useTransition } from "react";

type HeaderAuthProps = Readonly<{
  isAdmin: boolean;
}>;

export default function HeaderAuth({ isAdmin }: HeaderAuthProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    startTransition(() => {
      window.location.href = "/login";
    });
  };

  if (!isAdmin) {
    return (
      <Link
        className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        href="/admin"
      >
        התחברות
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        href="/admin/dashboard"
      >
        דשבורד
      </Link>
      <button
        className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        type="button"
        onClick={handleLogout}
        disabled={isPending}
      >
        {isPending ? "מתנתק..." : "התנתקות"}
      </button>
    </div>
  );
}
