"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { formatPrice } from "@/lib/format";
import FavoriteToggle from "./FavoriteToggle";
import TurnstileField from "@/components/TurnstileField";
const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      טוען מפה...
    </div>
  ),
});

type PropertyDetailsItem = {
  label: string;
  value: string;
};

export type PropertyCard = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrls: string[];
  status: "AVAILABLE" | "SOLD" | "RENTED";
  type: "SALE" | "RENT";
  isHot?: boolean;
  details?: PropertyDetailsItem[] | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type PropertyListClientProps = {
  properties: PropertyCard[];
  heading: string;
  countSuffix: string;
  emptyLabel: string;
  alertType: "SALE" | "RENT";
};

const ALERT_EMAIL_COOKIE = "alerts_email";
const ALERT_CONSENT_ERROR = "נא לאשר קבלת עדכונים כדי לשמור התראה.";

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

function parsePrice(input: string) {
  const normalized = input.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

function getDetailValue(details: PropertyDetailsItem[] | null | undefined, label: string) {
  if (!Array.isArray(details)) {
    return "";
  }
  return details.find((item) => item.label === label)?.value ?? "";
}

function parseNumber(input: string) {
  const normalized = input.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseSizePart(value: string, label: string) {
  const match = value.match(new RegExp(`${label}\\s*:\\s*([^,]+)`));
  return match?.[1]?.trim() ?? "";
}

export default function PropertyListClient({
  properties,
  heading,
  countSuffix,
  emptyLabel,
  alertType,
}: PropertyListClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minRooms, setMinRooms] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [minFloor, setMinFloor] = useState("");
  const [parkingFilter, setParkingFilter] = useState("ALL");
  const [neighborhoodQuery, setNeighborhoodQuery] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertError, setAlertError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [consentCookie, setConsentCookie] = useState(false);
  const [alertConsent, setAlertConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const alertTriggerRef = useRef<HTMLButtonElement | null>(null);
  const alertDialogRef = useRef<HTMLDivElement | null>(null);
  const alertCloseRef = useRef<HTMLButtonElement | null>(null);

  const closeAlert = () => {
    document.body.style.overflow = "";
    setAlertOpen(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minValue = minPrice.trim() ? parsePrice(minPrice) : null;
    const maxValue = maxPrice.trim() ? parsePrice(maxPrice) : null;
    const minRoomsValue = minRooms.trim() ? parseNumber(minRooms) : null;
    const minSizeValue = minSize.trim() ? parseNumber(minSize) : null;
    const maxSizeValue = maxSize.trim() ? parseNumber(maxSize) : null;
    const minFloorValue = minFloor.trim() ? parseNumber(minFloor) : null;

    return properties.filter((property) => {
      const matchesQuery =
        q.length === 0 ||
        property.title.toLowerCase().includes(q) ||
        property.description.toLowerCase().includes(q);

      const priceValue = parsePrice(property.price) ?? null;
      const matchesMin = minValue === null || (priceValue !== null && priceValue >= minValue);
      const matchesMax = maxValue === null || (priceValue !== null && priceValue <= maxValue);

      const roomsValue = parseNumber(getDetailValue(property.details, "מספר חדרים"));
      const matchesRooms =
        minRoomsValue === null || (roomsValue !== null && roomsValue >= minRoomsValue);

      const sizeValueRaw = getDetailValue(property.details, "גודל");
      const builtValue = parseNumber(parseSizePart(sizeValueRaw, "מ\"ר בנוי"));
      const matchesMinSize =
        minSizeValue === null || (builtValue !== null && builtValue >= minSizeValue);
      const matchesMaxSize =
        maxSizeValue === null || (builtValue !== null && builtValue <= maxSizeValue);

      const floorValue = parseNumber(getDetailValue(property.details, "קומה"));
      const matchesFloor =
        minFloorValue === null || (floorValue !== null && floorValue >= minFloorValue);

      const additionsValue = getDetailValue(property.details, "תוספות");
      const parkingValue = getDetailValue(property.details, "חניה");
      const hasParking =
        parkingValue === "יש" || additionsValue.includes("חניה פרטית");
      const matchesParking =
        parkingFilter === "ALL" ||
        (parkingFilter === "PARKING" && hasParking) ||
        (parkingFilter === "NO_PARKING" && !hasParking);

      const neighborhoodValue = (
        getDetailValue(property.details, "שכונה") ||
        getDetailValue(property.details, "מיקום")
      ).toLowerCase();
      const neighborhoodSearch = neighborhoodQuery.trim().toLowerCase();
      const matchesNeighborhood =
        neighborhoodSearch.length === 0 || neighborhoodValue.includes(neighborhoodSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AVAILABLE" && property.status === "AVAILABLE") ||
        (statusFilter === "SOLD" && property.status === "SOLD") ||
        (statusFilter === "RENTED" && property.status === "RENTED");

      return (
        matchesQuery &&
        matchesMin &&
        matchesMax &&
        matchesStatus &&
        matchesRooms &&
        matchesMinSize &&
        matchesMaxSize &&
        matchesFloor &&
        matchesParking &&
        matchesNeighborhood
      );
    });
  }, [
    properties,
    query,
    minPrice,
    maxPrice,
    statusFilter,
    minRooms,
    minSize,
    maxSize,
    minFloor,
    parkingFilter,
    neighborhoodQuery,
  ]);

  const markers = useMemo(() => {
    return filtered
      .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
      .map((item) => ({
        id: item.id,
        title: item.title,
        address: item.address ?? null,
        latitude: item.latitude as number,
        longitude: item.longitude as number,
        href: `/properties/${item.id}`,
      }));
  }, [filtered]);

  useEffect(() => {
    const savedEmail = getCookieValue(ALERT_EMAIL_COOKIE);
    if (savedEmail) {
      setAlertEmail(savedEmail);
    }
  }, []);

  const getFocusableElements = (container: HTMLElement | null) => {
    if (!container) {
      return [] as HTMLElement[];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        "button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => !element.hasAttribute("disabled"));
  };

  useEffect(() => {
    if (!alertOpen) {
      alertTriggerRef.current?.focus();
      return;
    }

    alertCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAlert();
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(alertDialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [alertOpen]);

  useEffect(() => {
    if (!alertOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [alertOpen]);

  const handleAlertSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlertMessage("");
    setAlertError("");

    if (!alertEmail.trim()) {
      setAlertError("נא להזין כתובת אימייל.");
      return false;
    }

    if (!alertConsent) {
      setAlertError(ALERT_CONSENT_ERROR);
      return false;
    }

    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: alertEmail.trim(),
        type: alertType,
        minPrice: minPrice.trim() ? parseNumber(minPrice) : null,
        maxPrice: maxPrice.trim() ? parseNumber(maxPrice) : null,
        minRooms: minRooms.trim() ? parseNumber(minRooms) : null,
        consentSource: alertType === "SALE" ? "alerts-sale" : "alerts-rent",
        turnstileToken,
      }),
    });

    if (!response.ok) {
      setAlertError("לא הצלחנו לשמור את ההתראה. נסה שוב.");
      return false;
    }

    setAlertMessage("ההתראה נשמרה! נשלח עדכונים לפי הסינון שבחרת.");
    setAlertEmail("");
    return true;
  };

  useEffect(() => {
    if (!alertOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [alertOpen]);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{heading}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {filtered.length} {countSuffix}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">סינון חכם</p>
              <p className="mt-1 text-sm text-slate-600">בחרו את מה שחשוב לכם, ונציג רק נכסים מתאימים.</p>
            </div>
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
              type="button"
              onClick={() => {
                setQuery("");
                setMinPrice("");
                setMaxPrice("");
                setStatusFilter("ALL");
                setMinRooms("");
                setMinSize("");
                setMaxSize("");
                setMinFloor("");
                setParkingFilter("ALL");
                setNeighborhoodQuery("");
              }}
            >
              איפוס סינון
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">חיפוש כללי</p>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                aria-label="חיפוש לפי שם או תיאור"
                placeholder="חיפוש לפי שם או תיאור"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
              />
              <input
                className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                aria-label="שכונה"
                placeholder="שכונה"
                value={neighborhoodQuery}
                onChange={(event) => setNeighborhoodQuery(event.target.value)}
                type="text"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">מחיר וסטטוס</p>
              <div className="mt-2 grid gap-3">
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label="מחיר מינימום"
                  placeholder="מחיר מינימום"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  type="text"
                />
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label="מחיר מקסימום"
                  placeholder="מחיר מקסימום"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  type="text"
                />
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label="סטטוס נכס"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="ALL">כל הסטטוסים</option>
                  <option value="AVAILABLE">זמין</option>
                  <option value="SOLD">נמכר</option>
                  <option value="RENTED">הושכר</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">פרטים חשובים</p>
              <div className="mt-2 grid gap-3">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label="חדרים (מינימום)"
                  value={minRooms}
                  onChange={(event) => setMinRooms(event.target.value)}
                >
                  <option value="">חדרים (מינימום)</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <option key={value} value={value}>
                      {value}+
                    </option>
                  ))}
                </select>
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label='מ"ר בנוי מינימום'
                  placeholder='מ"ר בנוי מינימום'
                  value={minSize}
                  onChange={(event) => setMinSize(event.target.value)}
                  type="text"
                />
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label='מ"ר בנוי מקסימום'
                  placeholder='מ"ר בנוי מקסימום'
                  value={maxSize}
                  onChange={(event) => setMaxSize(event.target.value)}
                  type="text"
                />
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label="קומה מינימום"
                  placeholder="קומה מינימום"
                  value={minFloor}
                  onChange={(event) => setMinFloor(event.target.value)}
                  type="text"
                />
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  aria-label="חניה"
                  value={parkingFilter}
                  onChange={(event) => setParkingFilter(event.target.value)}
                >
                  <option value="ALL">חניה</option>
                  <option value="PARKING">עם חניה</option>
                  <option value="NO_PARKING">בלי חניה</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">התראה חכמה</p>
              <p className="text-xs text-slate-500">נשלח לך נכסים חדשים שמתאימים לסינון שלך.</p>
            </div>
            <button
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="button"
              onClick={() => setAlertOpen(true)}
              ref={alertTriggerRef}
            >
              פתיחת התראה
            </button>
            {alertError && alertError !== ALERT_CONSENT_ERROR ? (
              <span className="text-xs font-semibold text-rose-600" aria-live="polite">
                {alertError}
              </span>
            ) : null}
            {alertMessage ? (
              <span className="text-xs font-semibold text-emerald-600" aria-live="polite">
                {alertMessage}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <PropertyMap markers={markers} height="360px" />
        </div>

        {alertOpen ? (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
            onClick={closeAlert}
          >
            <div
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="alerts-dialog-title"
              ref={alertDialogRef}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-lg font-semibold text-slate-900"
                  id="alerts-dialog-title"
                >
                  התראה על נכסים מתאימים
                </h3>
                <button
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                  type="button"
                  onClick={closeAlert}
                  ref={alertCloseRef}
                >
                  סגירה
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                מילוי מהיר וקצר - נשתמש בהעדפות שתבחרו כאן.
              </p>
              <form
                className="mt-4 grid gap-3"
                onSubmit={async (event) => {
                  const ok = await handleAlertSubmit(event as FormEvent<HTMLFormElement>);
                  if (ok) {
                    if (consentCookie && alertEmail.trim()) {
                      setCookieValue(ALERT_EMAIL_COOKIE, alertEmail.trim(), 180);
                    }
                    setAlertOpen(false);
                  }
                  router.refresh();
                }}
              >
                <input
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  aria-label="האימייל שלך"
                  placeholder="האימייל שלך"
                  value={alertEmail}
                  onChange={(event) => setAlertEmail(event.target.value)}
                  type="email"
                  required
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="מחיר מינימום"
                    placeholder="מחיר מינימום"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    type="text"
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="מחיר מקסימום"
                    placeholder="מחיר מקסימום"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    type="text"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="חדרים (מינימום)"
                    value={minRooms}
                    onChange={(event) => setMinRooms(event.target.value)}
                  >
                    <option value="">חדרים (מינימום)</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <option key={value} value={value}>
                        {value}+
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    className="h-4 w-4 rounded border-slate-300"
                    type="checkbox"
                    checked={alertConsent}
                    onChange={(event) => setAlertConsent(event.target.checked)}
                  />
                  אישור קבלת התראות בדוא"ל.
                </label>
                {alertError === ALERT_CONSENT_ERROR ? (
                  <p className="text-xs font-semibold text-rose-600" aria-live="polite">
                    {ALERT_CONSENT_ERROR}
                  </p>
                ) : null}
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    className="h-4 w-4 rounded border-slate-300"
                    type="checkbox"
                    checked={consentCookie}
                    onChange={(event) => setConsentCookie(event.target.checked)}
                  />
                  אני מסכים/ה לשמירת האימייל בקוקיז לצורך נוחות בניהול התראות.
                </label>
                <TurnstileField className="mt-2" onToken={setTurnstileToken} />
                <p className="text-xs text-slate-500">
                  שמירת התראה מהווה הסכמה לקבלת התראות על נכסים תואמים. ניתן להסיר
                  בכל עת דרך קישור הסרה בכל מייל או מניהול ההתראות באתר. לפרטים:
                  {" "}
                  <a className="font-semibold text-slate-600 hover:text-slate-800" href="/privacy">
                    מדיניות פרטיות
                  </a>
                  {" "}
                  ו-
                  {" "}
                  <a className="font-semibold text-slate-600 hover:text-slate-800" href="/terms">
                    תנאי שימוש
                  </a>
                  .
                </p>
                <button
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  type="submit"
                >
                  שמירת התראה
                </button>
              </form>
            </div>
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">{emptyLabel}</p>
          ) : (
            filtered.map((property) => (
              <Link
                key={property.id}
                className="relative block overflow-hidden rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300"
                href={`/properties/${property.id}`}
              >
                {property.status !== "AVAILABLE" ? (
                  <span className="absolute -left-10 top-6 w-40 -rotate-45 bg-rose-600 py-1 text-center text-xs font-semibold text-white">
                    {property.type === "SALE" ? "נמכר" : "הושכר"}
                  </span>
                ) : null}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <FavoriteToggle propertyId={property.id} compact />
                      {property.isHot ? (
                        <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white">
                          חם
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      דירה: {property.title}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-slate-500">תיאור הנכס:</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {property.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    מחיר: {formatPrice(property.price)}
                  </span>
                </div>
                {property.imageUrls[0] ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500">תמונות מהנכס:</p>
                    <Image
                      className="mt-2 h-40 w-full rounded-xl object-cover"
                      src={property.imageUrls[0]}
                      alt={property.title}
                      width={1200}
                      height={480}
                      sizes="(min-width: 1024px) 640px, 100vw"
                    />
                  </div>
                ) : null}
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
