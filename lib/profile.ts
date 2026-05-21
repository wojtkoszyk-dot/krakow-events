import type { Event } from "@/lib/data";
import type { EventCategory } from "@/lib/taxonomy";
import type { UserHistory } from "@/lib/user-history";

export function getTopCategories(
  history: UserHistory,
  limit = 4,
): { category: EventCategory; count: number }[] {
  return Object.entries(history.categoryClicks)
    .filter(([, n]) => (n ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, limit)
    .map(([category, count]) => ({
      category: category as EventCategory,
      count: count ?? 0,
    }));
}

export function getTopDistricts(
  history: UserHistory,
  limit = 5,
): { district: string; count: number }[] {
  return Object.entries(history.districtClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([district, count]) => ({ district, count }));
}

export function getRecentlyViewed(
  allEvents: Event[],
  history: UserHistory,
  limit = 6,
): Event[] {
  const byId = new Map(allEvents.map((e) => [e.id, e]));
  return [...history.viewedIds]
    .reverse()
    .map((id) => byId.get(id))
    .filter((e): e is Event => e !== undefined)
    .slice(0, limit);
}

export function getSavedEvents(
  allEvents: Event[],
  history: UserHistory,
): Event[] {
  const savedSet = new Set(history.savedIds);
  return allEvents.filter((e) => savedSet.has(e.id));
}
