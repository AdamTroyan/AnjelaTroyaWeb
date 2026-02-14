"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import FavoriteToggle from "../properties/FavoriteToggle";

type FavoriteProperty = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrls: string[];
  status: "AVAILABLE" | "SOLD" | "RENTED";
  type: "SALE" | "RENT";
  isHot?: boolean;
};

const STORAGE_KEY = "favoriteProperties";

function loadFavoriteIds() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [] as string[];
  }
}

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFavoriteIds(loadFavoriteIds());
  }, []);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      const response = await fetch("/api/properties/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: favoriteIds }),
      });
      const data = (await response.json()) as { properties: FavoriteProperty[] };
      setProperties(data.properties ?? []);
      setLoading(false);
    };

    load();
  }, [favoriteIds]);

  const orderedProperties = useMemo(() => {
    const map = new Map(properties.map((item) => [item.id, item]));
    return favoriteIds.map((id) => map.get(id)).filter(Boolean) as FavoriteProperty[];
  }, [favoriteIds, properties]);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">נכסים שמורים</h1>
            <p className="mt-2 text-sm text-slate-500">
              {orderedProperties.length} נכסים שמורים
            </p>
          </div>
          <Link className="text-sm font-semibold text-slate-600" href="/properties/sale">
            חזרה לנכסים
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">טוען נכסים...</p>
          ) : orderedProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-600">אין נכסים שמורים כרגע.</p>
              <Link
                className="mt-4 inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                href="/properties/sale"
              >
                לצפייה בנכסים
              </Link>
            </div>
          ) : (
            orderedProperties.map((property) => (
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
                    <img
                      className="mt-2 h-40 w-full rounded-xl object-cover"
                      src={property.imageUrls[0]}
                      alt={property.title}
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
