"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_COOKIE = "cookie_consent";
const CONSENT_MAX_AGE_DAYS = 180;

type ConsentValue = "all" | "essential";

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function setCookieValue(name: string, value: string, days: number) {
  if (typeof document === "undefined") {
    return;
  }
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getCookieValue(CONSENT_COOKIE);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleConsent = (value: ConsentValue) => {
    setCookieValue(CONSENT_COOKIE, value, CONSENT_MAX_AGE_DAYS);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto w-full max-w-3xl rounded-3xl border border-slate-600 bg-slate-800 p-5 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-200">
          <p className="font-semibold text-white">שימוש בעוגיות</p>
          <p className="mt-1 text-xs leading-6 text-slate-200">
            אנו משתמשים בעוגיות תפעוליות לצורך תפקוד האתר ושמירת העדפות. תוכלו לבחור
            לאשר את כולן או רק עוגיות חיוניות. לפרטים נוספים:
            {" "}
            <Link className="font-semibold text-white hover:text-slate-100" href="/privacy">
              מדיניות פרטיות
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-slate-500 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400"
            type="button"
            onClick={() => handleConsent("essential")}
          >
            עוגיות חיוניות בלבד
          </button>
          <button
            className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
            type="button"
            onClick={() => handleConsent("all")}
          >
            לאשר הכל
          </button>
        </div>
      </div>
    </div>
  );
}
