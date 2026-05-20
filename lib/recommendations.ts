import type { Event } from "@/lib/data";
import { filterUpcomingEvents, getKrakowTodayISO } from "@/lib/dates";
import { hasUserHistory, type UserHistory } from "@/lib/user-history";

const PICKED_LIMIT = 5;

function daysUntilStart(event: Event, today: string): number {
  const [ty, tm, td] = today.split("-").map(Number);
  const [sy, sm, sd] = event.startsOn.split("-").map(Number);
  const todayMs = Date.UTC(ty, tm - 1, td);
  const startMs = Date.UTC(sy, sm - 1, sd);
  return Math.round((startMs - todayMs) / (1000 * 60 * 60 * 24));
}

function topCategories(history: UserHistory): Event["category"][] {
  return Object.entries(history.categoryClicks)
    .filter(([, n]) => (n ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([cat]) => cat as Event["category"]);
}

function topDistricts(history: UserHistory): string[] {
  return Object.entries(history.districtClicks)
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d);
}

/**
 * Picked for you — localStorage only, no backend.
 *
 * Cold start → trending upcoming events (max 5).
 *
 * With history → score upcoming events only (past excluded):
 *   +3  category in your click history
 *   +3  district in your district click history
 *   +2  starts within 3 days (+1 extra if today/tomorrow)
 *   +4  you saved it
 *   −50 already viewed (deprioritized, used only to fill empty slots)
 */
export function getPickedForYou(
  events: Event[],
  history: UserHistory,
  today = getKrakowTodayISO(),
): Event[] {
  const upcoming = filterUpcomingEvents(events, today);

  if (!hasUserHistory(history)) {
    return getTrendingFallback(upcoming);
  }

  const viewedSet = new Set(history.viewedIds);
  const savedSet = new Set(history.savedIds);
  const preferredCategories = topCategories(history);
  const preferredDistricts = topDistricts(history);

  const scored = upcoming.map((event) => {
    let score = 0;
    const isViewed = viewedSet.has(event.id);

    if (savedSet.has(event.id)) score += 4;
    if (preferredCategories.includes(event.category)) score += 3;
    if (preferredDistricts.includes(event.district)) score += 3;

    const days = daysUntilStart(event, today);
    if (days >= 0 && days <= 3) score += 2;
    if (days === 0 || days === 1) score += 1;

    if (isViewed) score -= 50;

    return { event, score, isViewed };
  });

  scored.sort((a, b) => {
    if (a.isViewed !== b.isViewed) return a.isViewed ? 1 : -1;
    return b.score - a.score;
  });

  return scored.slice(0, PICKED_LIMIT).map((s) => s.event);
}

export function getTrendingFallback(events: Event[]): Event[] {
  const trending = events.filter((e) => e.trending);
  const pool = trending.length >= PICKED_LIMIT ? trending : events;
  return pool.slice(0, PICKED_LIMIT);
}

export function isPersonalizedPicks(history: UserHistory): boolean {
  return hasUserHistory(history);
}
