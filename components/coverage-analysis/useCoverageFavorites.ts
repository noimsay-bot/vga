import { useSyncExternalStore } from "react";
import type { CoverageItem } from "./types";

export interface FavoriteCoverage {
  id: string;
  name: string;
  needed: number;
}

const STORAGE_KEY = "coverage-analysis:favorites:v1";
const CHANGE_EVENT = "coverage-favorites-changed";
const EMPTY_FAVORITES: FavoriteCoverage[] = [];
let cachedRaw = "";
let cachedFavorites: FavoriteCoverage[] = EMPTY_FAVORITES;

const parseFavorites = (raw: string): FavoriteCoverage[] => {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return EMPTY_FAVORITES;
    return parsed.filter(
      (entry): entry is FavoriteCoverage =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as FavoriteCoverage).id === "string" &&
        typeof (entry as FavoriteCoverage).name === "string" &&
        typeof (entry as FavoriteCoverage).needed === "number",
    );
  } catch {
    return EMPTY_FAVORITES;
  }
};

const getSnapshot = () => {
  const raw = localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedFavorites = parseFavorites(raw);
  }
  return cachedFavorites;
};

const subscribe = (notify: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) notify();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, notify);
  };
};

const persist = (next: FavoriteCoverage[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export default function useCoverageFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_FAVORITES);

  const toggleFavorite = (item: Pick<CoverageItem, "name" | "needed">) => {
    const existing = favorites.find((favorite) => favorite.name === item.name);
    if (existing) {
      persist(favorites.filter((favorite) => favorite.id !== existing.id));
      return;
    }
    persist([
      ...favorites,
      {
        id: `favorite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: item.name,
        needed: item.needed,
      },
    ]);
  };

  const deleteFavorite = (favoriteId: string) =>
    persist(favorites.filter((favorite) => favorite.id !== favoriteId));

  return { favorites, toggleFavorite, deleteFavorite };
}
