"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    startTransition(() => {
      window.location.href = "/login";
    });
  };

  return (
    <button
      className="mt-6 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      type="button"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? "מתנתק..." : "התנתקות"}
    </button>
  );
}
