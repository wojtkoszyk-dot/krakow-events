import type { Event } from "@/lib/data";
import { getKrakowTodayISO } from "@/lib/dates";
import { hasUserHistory, type UserHistory } from "@/lib/user-history";

const PICKED_LIMIT = 5;

/** Days from today until event start (0 = today, negative = already started / ongoing). */
function daysUntilStart(event: Event, today: string): number {
  const [ty, tm, td] = today.split("-").map(Number);
  const [sy, sm, sd] = event.startsOn.split("-").map(Number);
  const todayMs = Date.UTC(ty, tm - 1, td);
  const startMs = Date.UTC(sy, sm - 1, sd);
  return Math.round((startMs - todayMs) / (1000 * 60 * 60 * 24));
}

/**
 * Picked for you — simple local scoring (no backend).
 *
 * Cold start: no clicks, views, or saves → show trending events (up to 5).
 *
 * With history: score every event, sort high → low, take top 5.
 *   +3  category matches a preferred category (from click/view counts)
 *   +2  upcoming soon (starts within 0–3 days)
 *   +1  extra if starting today or tomorrow
 *   +2  same district as any previously viewed event
 *   +4  user saved this event (always surface saves)
 *   −50 already viewed (soft penalty; we prefer fresh picks but can still fill slots)
 *
 * Viewed events are sorted last; we only use them if fewer than 5 unviewed remain.
 */
export function getPickedForYou(
  events: Event[],
  history: UserHistory,
  today = getKrakowTodayISO(),
): Event[] {
  if (!hasUserHistory(history)) {
    return getTrendingFallback(events);
  }

  const viewedSet = new Set(history.viewedIds);
  const savedSet = new Set(history.savedIds);

  const viewedDistricts = new Set(
    history.viewedIds
      .map((id) => events.find((e) => e.id === id)?.district)
      .filter((d): d is string => Boolean(d)),
  );

  const preferredCategories = Object.entries(history.categoryClicks)
    .filter(([, count]) => (count ?? 0) > 0)
    .map(([cat]) => cat as Event["category"]);

  const scored = events.map((event) => {
    let score = 0;
    const isViewed = viewedSet.has(event.id);

    if (savedSet.has(event.id)) score += 4;

    if (preferredCategories.includes(event.category)) score += 3;

    const days = daysUntilStart(event, today);
    if (days >= 0 && days <= 3) score += 2;
    if (days === 0 || days === 1) score += 1;

    if (viewedDistricts.has(event.district)) score += 2;

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
