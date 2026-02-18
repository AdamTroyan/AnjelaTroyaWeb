"use client";

import { useState } from "react";
import Link from "next/link";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "972543179762";
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+972543179762";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "adamtroy@gmail.com";

type DealType = "SALE" | "RENT";

export default function OwnerLeadCard() {
  const [dealType, setDealType] = useState<DealType>("SALE");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) {
      setStatus("error");
      setErrorMessage("נא למלא את כל השדות החובה.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");
    const details = [
      `סוג פנייה: ${dealType === "SALE" ? "מכירה" : "השכרה"}`,
      `כתובת בניין: ${address.trim()}`,
      "מקור: עמוד מעוניין למכור/להשכיר",
    ].join("\n");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          details,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus("error");
        setErrorMessage(data?.error === "Too many requests" ? "יותר מדי בקשות, נסו שוב מאוחר יותר." : "שליחת הפנייה נכשלה. נסו שוב.");
        return;
      }

      setStatus("success");
      setName("");
      setAddress("");
      setPhone("");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("שגיאת רשת, נסו שוב.");
    }
  };

  const whatsappMessage = `שלום, אני מעוניין/ת ${dealType === "SALE" ? "למכור" : "להשכיר"} נכס.`;

  return (
    <div
      id="owner-lead"
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">מעוניין להשכיר/למכור?</h2>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        השאירו פרטים קצרים ונחזור אליכם במהירות. אפשר גם ליצור קשר ישיר.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
          href={`tel:${CONTACT_PHONE}`}
        >
          התקשרו
        </a>
        <a
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          שליחת אימייל
        </a>
        <a
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>

      <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-2">
          <button
            className={
              dealType === "SALE"
                ? "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                : "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            }
            type="button"
            onClick={() => setDealType("SALE")}
            aria-pressed={dealType === "SALE"}
          >
            מכירה
          </button>
          <button
            className={
              dealType === "RENT"
                ? "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                : "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            }
            type="button"
            onClick={() => setDealType("RENT")}
            aria-pressed={dealType === "RENT"}
          >
            השכרה
          </button>
        </div>
        <label className="sr-only" htmlFor="owner-lead-name">
          שם פרטי ומשפחה
        </label>
        <input
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          id="owner-lead-name"
          placeholder="שם פרטי ומשפחה"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <label className="sr-only" htmlFor="owner-lead-address">
          כתובת הבניין
        </label>
        <input
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          id="owner-lead-address"
          placeholder="כתובת הבניין"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
        <label className="sr-only" htmlFor="owner-lead-phone">
          טלפון
        </label>
        <input
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          id="owner-lead-phone"
          placeholder="טלפון"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
        <label className="sr-only" htmlFor="owner-lead-email">
          אימייל (לא חובה)
        </label>
        <input
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          id="owner-lead-email"
          placeholder="אימייל (לא חובה)"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          type="submit"
          disabled={status === "sending"}
        >
          שליחת פנייה
        </button>
        {status === "success" ? (
          <p className="text-xs font-semibold text-emerald-700" aria-live="polite">
            הפנייה נשלחה בהצלחה.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-xs font-semibold text-rose-600" aria-live="polite">
            {errorMessage}
          </p>
        ) : null}
        <p className="text-xs text-slate-500">
          בלחיצה על "שליחת פנייה" אתם מאשרים את
          {" "}
          <Link className="font-semibold text-slate-600 hover:text-slate-800" href="/privacy">
            מדיניות הפרטיות
          </Link>
          {" "}
          ואת
          {" "}
          <Link className="font-semibold text-slate-600 hover:text-slate-800" href="/terms">
            תנאי השימוש
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
