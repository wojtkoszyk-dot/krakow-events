import type { EventCategory } from "@/lib/taxonomy";
import type { CategoryFilterId } from "@/lib/taxonomy";

const STORAGE_KEY = "krakow-events:user-history";

export type UserHistory = {
  categoryClicks: Partial<Record<EventCategory, number>>;
  /** Filter chip clicks (same ids as categories). */
  filterClicks?: Partial<Record<CategoryFilterId, number>>;
  /** @deprecated Migrated to filterClicks */
  chipClicks?: Partial<Record<CategoryFilterId, number>>;
  districtClicks: Record<string, number>;
  viewedIds: string[];
  savedIds: string[];
};

const EMPTY_HISTORY: UserHistory = {
  categoryClicks: {},
  filterClicks: {},
  districtClicks: {},
  viewedIds: [],
  savedIds: [],
};

export function loadUserHistory(): UserHistory {
  if (typeof window === "undefined") return { ...EMPTY_HISTORY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_HISTORY };
    const parsed = JSON.parse(raw) as Partial<UserHistory> & {
      chipClicks?: Record<string, number>;
    };
    return {
      categoryClicks: parsed.categoryClicks ?? {},
      filterClicks: parsed.filterClicks ?? parsed.chipClicks ?? {},
      districtClicks: parsed.districtClicks ?? {},
      viewedIds: Array.isArray(parsed.viewedIds) ? parsed.viewedIds : [],
      savedIds: Array.isArray(parsed.savedIds) ? parsed.savedIds : [],
    };
  } catch {
    return { ...EMPTY_HISTORY };
  }
}

export function saveUserHistory(history: UserHistory): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function hasUserHistory(history: UserHistory): boolean {
  const categoryTotal = Object.values(history.categoryClicks).reduce(
    (sum, n) => sum + (n ?? 0),
    0,
  );
  const filterTotal = Object.values(history.filterClicks ?? {}).reduce(
    (sum, n) => sum + (n ?? 0),
    0,
  );
  const districtTotal = Object.values(history.districtClicks).reduce(
    (sum, n) => sum + n,
    0,
  );
  return (
    categoryTotal > 0 ||
    filterTotal > 0 ||
    districtTotal > 0 ||
    history.viewedIds.length > 0 ||
    history.savedIds.length > 0
  );
}

export function getPreferredDistricts(
  history: UserHistory,
  limit = 3,
): string[] {
  const ranked = Object.entries(history.districtClicks)
    .sort((a, b) => b[1] - a[1])
    .map(([district]) => district);
  if (ranked.length > 0) return ranked.slice(0, limit);
  return ["Kazimierz", "Old Town"];
}

export function recordCategoryClick(
  history: UserHistory,
  category: EventCategory,
): UserHistory {
  const next = {
    ...history,
    categoryClicks: {
      ...history.categoryClicks,
      [category]: (history.categoryClicks[category] ?? 0) + 1,
    },
  };
  saveUserHistory(next);
  return next;
}

export function recordFilterClick(
  history: UserHistory,
  category: CategoryFilterId,
): UserHistory {
  const next = {
    ...history,
    filterClicks: {
      ...history.filterClicks,
      [category]: (history.filterClicks?.[category] ?? 0) + 1,
    },
  };
  saveUserHistory(next);
  return next;
}

/** @deprecated Use recordFilterClick */
export const recordChipClick = recordFilterClick;

/** @deprecated Use CategoryFilterId */
export type CategoryChipId = CategoryFilterId;

export function recordDistrictClick(
  history: UserHistory,
  district: string,
): UserHistory {
  const next = {
    ...history,
    districtClicks: {
      ...history.districtClicks,
      [district]: (history.districtClicks[district] ?? 0) + 1,
    },
  };
  saveUserHistory(next);
  return next;
}

export function recordViewed(history: UserHistory, eventId: string): UserHistory {
  if (history.viewedIds.includes(eventId)) return history;
  const next = { ...history, viewedIds: [...history.viewedIds, eventId] };
  saveUserHistory(next);
  return next;
}

export function toggleSaved(history: UserHistory, eventId: string): UserHistory {
  const saved = new Set(history.savedIds);
  if (saved.has(eventId)) saved.delete(eventId);
  else saved.add(eventId);
  const next = { ...history, savedIds: [...saved] };
  saveUserHistory(next);
  return next;
}
