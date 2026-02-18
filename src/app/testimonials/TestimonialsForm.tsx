"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const defaultRating = 5;

export default function TestimonialsForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [hideLastName, setHideLastName] = useState(false);
  const [rating, setRating] = useState(defaultRating);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const response = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        message,
        rating,
        hideLastName,
      }),
    });

    if (!response.ok) {
      setStatus("error");
      setError("לא הצלחנו לשמור את ההמלצה. נסה שוב.");
      return;
    }

    setStatus("success");
    setFirstName("");
    setLastName("");
    setMessage("");
    setHideLastName(false);
    setRating(defaultRating);
    router.refresh();
  };

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          placeholder="שם פרטי"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
        />
        <input
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          placeholder="שם משפחה"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold text-slate-500">דירוג</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className={
                rating === value
                  ? "rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700"
                  : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600"
              }
            >
              <input
                className="sr-only"
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
              />
              <span className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: value }, (_, index) => (
                  <span key={index} className="text-amber-500">
                    ⭐
                  </span>
                ))}
              </span>
              <span className="sr-only">{value === 1 ? "כוכב אחד" : `${value} כוכבים`}</span>
            </label>
          ))}
        </div>
      </div>

      <textarea
        className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        placeholder="המלצה"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
      />

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          className="h-4 w-4 rounded border-slate-300"
          type="checkbox"
          checked={hideLastName}
          onChange={(event) => setHideLastName(event.target.checked)}
        />
        להסתיר את שם המשפחה בפרסום ההמלצה
      </label>

      {status === "error" ? (
        <p className="text-sm font-semibold text-rose-600" aria-live="polite">
          {error}
        </p>
      ) : null}

      {status === "success" ? (
        <p className="text-sm font-semibold text-emerald-600" aria-live="polite">
          תודה! ההמלצה שלך נשמרה.
        </p>
      ) : null}

      <button
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        type="submit"
        disabled={status === "sending"}
      >
        שליחת המלצה
      </button>
    </form>
  );
}
