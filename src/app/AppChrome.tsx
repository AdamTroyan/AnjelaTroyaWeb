"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuth from "./HeaderAuth";
import CookieConsent from "@/components/CookieConsent";

type AppChromeProps = {
  isAdmin: boolean;
  children: React.ReactNode;
};

export default function AppChrome({ isAdmin, children }: AppChromeProps) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login";

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="font-display text-2xl font-semibold tracking-wide text-slate-900">
              ANJELA TROYA
            </span>
            <span className="text-sm text-slate-500">
              תיווך נדל&quot;ן | שמאות | ייעוץ אישי
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <Link className="transition hover:text-slate-900" href="/">
              בית
            </Link>
            <Link className="transition hover:text-slate-900" href="/about">
              אודות
            </Link>
            <Link className="transition hover:text-slate-900" href="/properties/sale">
              דירות למכירה
            </Link>
            <Link className="transition hover:text-slate-900" href="/properties/rent">
              דירות להשכרה
            </Link>
            <Link className="transition hover:text-slate-900" href="/owner">
              מעוניין/ת למכור/להשכיר?
            </Link>
            <Link className="transition hover:text-slate-900" href="/favorites">
              שמורים
            </Link>
            <Link className="transition hover:text-slate-900" href="/alerts">
              התראות
            </Link>
            <Link className="transition hover:text-slate-900" href="/valuation">
              הערכת שווי
            </Link>
            <Link className="transition hover:text-slate-900" href="/testimonials">
              המלצות
            </Link>
            <Link className="transition hover:text-slate-900" href="/contact">
              צור קשר
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <HeaderAuth isAdmin={isAdmin} />
            <Link
              className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              href="/contact"
            >
              צור קשר
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-100 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-6 py-3 text-xs font-semibold text-slate-600">
            <Link className="transition hover:text-slate-900" href="/">
              בית
            </Link>
            <Link className="transition hover:text-slate-900" href="/about">
              אודות
            </Link>
            <Link className="transition hover:text-slate-900" href="/properties/sale">
              דירות למכירה
            </Link>
            <Link className="transition hover:text-slate-900" href="/properties/rent">
              דירות להשכרה
            </Link>
            <Link className="transition hover:text-slate-900" href="/owner">
              מעוניין/ת למכור/להשכיר?
            </Link>
            <Link className="transition hover:text-slate-900" href="/favorites">
              שמורים
            </Link>
            <Link className="transition hover:text-slate-900" href="/alerts">
              התראות
            </Link>
            <Link className="transition hover:text-slate-900" href="/valuation">
              הערכת שווי
            </Link>
            <Link className="transition hover:text-slate-900" href="/testimonials">
              המלצות
            </Link>
            <Link className="transition hover:text-slate-900" href="/contact">
              צור קשר
            </Link>
            <Link
              className="transition hover:text-slate-900"
              href={isAdmin ? "/admin/dashboard" : "/admin"}
            >
              {isAdmin ? "דשבורד" : "התחברות"}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-6 py-6 text-center text-sm text-slate-500">
          <p>ANJELA TROYA - נדל&quot;ן ושמאות</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <Link className="transition hover:text-slate-700" href="/terms">
              תנאי שימוש
            </Link>
            <Link className="transition hover:text-slate-700" href="/privacy">
              מדיניות פרטיות
            </Link>
            <Link className="transition hover:text-slate-700" href="/accessibility">
              הצהרת נגישות
            </Link>
          </div>
          <p className="max-w-3xl text-xs text-slate-500">
            המידע באתר להמחשה בלבד ואינו מהווה ייעוץ משפטי/פיננסי או הצעה מחייבת. ייתכנו טעויות ושינויים במחיר, בזמינות ובפרטים. מומלץ לבצע בדיקות עצמאיות טרם קבלת החלטה.
          </p>
          <p>© 2026 כל הזכויות שמורות.</p>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
}
