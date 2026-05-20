import type { EventCategory } from "@/lib/data";

const STORAGE_KEY = "krakow-events:user-history";

export type UserHistory = {
  /** How often the user clicked each category (filters or opened events). */
  categoryClicks: Partial<Record<EventCategory, number>>;
  /** Event ids opened in the detail modal. */
  viewedIds: string[];
  /** Event ids the user explicitly saved. */
  savedIds: string[];
};

const EMPTY_HISTORY: UserHistory = {
  categoryClicks: {},
  viewedIds: [],
  savedIds: [],
};

export function loadUserHistory(): UserHistory {
  if (typeof window === "undefined") return { ...EMPTY_HISTORY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_HISTORY };
    const parsed = JSON.parse(raw) as UserHistory;
    return {
      categoryClicks: parsed.categoryClicks ?? {},
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
  return (
    categoryTotal > 0 ||
    history.viewedIds.length > 0 ||
    history.savedIds.length > 0
  );
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

export function recordViewed(history: UserHistory, eventId: string): UserHistory {
  if (history.viewedIds.includes(eventId)) return history;
  const next = {
    ...history,
    viewedIds: [...history.viewedIds, eventId],
  };
  saveUserHistory(next);
  return next;
}

export function toggleSaved(history: UserHistory, eventId: string): UserHistory {
  const saved = new Set(history.savedIds);
  if (saved.has(eventId)) {
    saved.delete(eventId);
  } else {
    saved.add(eventId);
  }
  const next = { ...history, savedIds: [...saved] };
  saveUserHistory(next);
  return next;
}
