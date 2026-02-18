"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AlertItem = {
  id: string;
  type: "SALE" | "RENT";
  minPrice: number | null;
  maxPrice: number | null;
  minRooms: number | null;
  createdAt: string;
};

function formatAlertValue(label: string, value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }
  return `${label}: ${value}`;
}

export default function AlertsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [unsubscribeToken, setUnsubscribeToken] = useState("");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [autoLoaded, setAutoLoaded] = useState(false);

  useEffect(() => {
    const emailMatch = document.cookie.match(/(?:^|; )alerts_email=([^;]*)/);
    if (emailMatch) {
      const stored = decodeURIComponent(emailMatch[1]);
      setEmail(stored);
    }
    const tokenMatch = document.cookie.match(/(?:^|; )alerts_token=([^;]*)/);
    if (tokenMatch) {
      setUnsubscribeToken(decodeURIComponent(tokenMatch[1]));
    }
  }, []);

  useEffect(() => {
    if (!autoLoaded && email && unsubscribeToken) {
      setAutoLoaded(true);
      void loadAlerts();
    }
  }, [autoLoaded, email, unsubscribeToken]);

  const loadAlerts = async () => {
    if (!unsubscribeToken) {
      setError("לא נמצא אסימון הרשאה. נסו להירשם להתראה מחדש.");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    const response = await fetch("/api/alerts/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribeToken }),
    });
    if (!response.ok) {
      setError("לא נמצאו התראות או שהאימייל לא תקין.");
      setAlerts([]);
      setLoading(false);
      return;
    }
    const data = (await response.json()) as { alerts: AlertItem[] };
    setAlerts(data.alerts ?? []);
    setMessage(data.alerts?.length ? "" : "אין התראות פעילות." );
    setLoading(false);
    router.refresh();
  };

  const deleteAlert = async (id: string) => {
    const response = await fetch("/api/alerts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email, unsubscribeToken }),
    });
    if (!response.ok) {
      setError("לא הצלחנו למחוק את ההתראה.");
      return;
    }
    setAlerts((current) => current.filter((alert) => alert.id !== id));
    router.refresh();
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">ההתראות שלי</h1>
        <p className="mt-2 text-sm text-slate-600">
          כאן אפשר לצפות בהתראות קיימות ולבטל אותן.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="alerts-email">
            האימייל שלך
          </label>
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 md:w-80"
            id="alerts-email"
            placeholder="האימייל שלך"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
          <button
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
            onClick={loadAlerts}
            disabled={!email || loading}
          >
            הצגת התראות
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-rose-600" aria-live="polite">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-3 text-sm text-slate-600" aria-live="polite">
            {message}
          </p>
        ) : null}
        {loading ? (
          <p className="mt-3 text-sm text-slate-500" aria-live="polite">
            טוען...
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {alerts.map((alert) => {
            const parts = [
              alert.type === "SALE" ? "למכירה" : "להשכרה",
              formatAlertValue("מינימום", alert.minPrice),
              formatAlertValue("מקסימום", alert.maxPrice),
              formatAlertValue("חדרים", alert.minRooms),
            ].filter(Boolean);

            return (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {parts.join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    נוצרה ב-{new Date(alert.createdAt).toLocaleDateString("he-IL")}
                  </p>
                </div>
                <button
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                  type="button"
                  onClick={() => deleteAlert(alert.id)}
                >
                  הסרה
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
