"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "favoriteProperties";

function loadFavorites() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

function saveFavorites(favorites: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
}

type FavoriteToggleProps = {
  propertyId: string;
  compact?: boolean;
};

export default function FavoriteToggle({ propertyId, compact }: FavoriteToggleProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const isFavorite = favorites.has(propertyId);

  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      saveFavorites(next);
      return next;
    });
  };

  return (
    <button
      className={
        compact
          ? "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
      }
      type="button"
      onClick={toggleFavorite}
    >
      {isFavorite ? "נשמר" : "שמירה"}
    </button>
  );
}
