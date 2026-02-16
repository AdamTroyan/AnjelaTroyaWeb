"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import HeaderAuth from "./HeaderAuth";
import CookieConsent from "@/components/CookieConsent";

type AppChromeProps = {
  isAdmin: boolean;
  children: React.ReactNode;
};

export default function AppChrome({ isAdmin, children }: AppChromeProps) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login";
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "בית" },
    { href: "/about", label: "אודות" },
    { href: "/properties/sale", label: "דירות למכירה" },
    { href: "/properties/rent", label: "דירות להשכרה" },
    { href: "/owner", label: "מעוניין/ת למכור/להשכיר?" },
    { href: "/favorites", label: "שמורים" },
    { href: "/alerts", label: "התראות" },
    { href: "/valuation", label: "הערכת שווי" },
    { href: "/testimonials", label: "המלצות" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-gradient-to-b from-white via-white/95 to-slate-50/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex flex-col gap-1">
            <span className="font-display text-2xl font-semibold tracking-[0.08em] text-slate-900">
              ANJELA TROYA
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
              תיווך נדל&quot;ן | שמאות | ייעוץ אישי
            </span>
          </div>
          <div className="flex items-center gap-3">
            <HeaderAuth isAdmin={isAdmin} />
            <Link
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              href="/contact"
            >
              צור קשר
            </Link>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 md:hidden"
              type="button"
              aria-label={mobileOpen ? "סגירת תפריט" : "פתיחת תפריט"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        <div className="hidden border-t border-slate-100/80 md:block">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={`relative transition hover:text-slate-900 ${
                  isActive(item.href) ? "text-slate-900" : ""
                }`}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-slate-900 transition-opacity ${
                    isActive(item.href) ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            ))}
          </nav>
        </div>
        {mobileOpen ? (
          <div className="md:hidden">
            <div className="fixed inset-0 z-40 bg-slate-900/20" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-50 border-t border-slate-100 bg-white shadow-lg">
              <nav className="mx-auto grid max-w-6xl gap-1 px-6 py-4 text-sm font-semibold text-slate-700">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    className={`rounded-xl px-3 py-2 transition hover:bg-slate-50 ${
                      isActive(item.href) ? "bg-slate-50 text-slate-900" : ""
                    }`}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  className="rounded-xl px-3 py-2 transition hover:bg-slate-50"
                  href={isAdmin ? "/admin/dashboard" : "/admin"}
                >
                  {isAdmin ? "דשבורד" : "התחברות"}
                </Link>
                <Link
                  className="rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white"
                  href="/contact"
                >
                  צור קשר
                </Link>
              </nav>
            </div>
          </div>
        ) : null}
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
