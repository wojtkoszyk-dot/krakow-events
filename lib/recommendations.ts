import type { Event } from "@/lib/data";
import { filterUpcomingEvents, getKrakowTodayISO } from "@/lib/dates";
import type { CategoryChipId } from "@/lib/filters";
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

function topChips(history: UserHistory): CategoryChipId[] {
  return Object.entries(history.chipClicks)
    .filter(([, n]) => (n ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([chip]) => chip as CategoryChipId);
}

/** Rough boost when user often taps a chip that relates to this event. */
function chipAffinity(event: Event, chips: CategoryChipId[]): number {
  let score = 0;
  for (const chip of chips) {
    if (chip === "techno" && event.category === "Techno") score += 2;
    if (chip === "concert" && event.category === "Music") score += 2;
    if (chip === "standup" && event.category === "Stand-up") score += 2;
    if (chip === "art" && event.category === "Art") score += 2;
    if (chip === "food" && event.category === "Food") score += 2;
    if (chip === "museum" && event.category === "Art") score += 1;
    if (chip === "rave" && event.category === "Techno") score += 2;
  }
  return score;
}

/**
 * Picked for you — localStorage only.
 *
 * No history → trending upcoming events (max 5).
 *
 * With history → score upcoming events:
 *   +3  event category you clicked often
 *   +3  district you clicked often
 *   +2  chip affinity (Museum, Rave, etc.)
 *   +2  starts within 3 days (+1 if today/tomorrow)
 *   +4  saved by you
 *   −50 viewed already (deprioritized)
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
  const preferredChips = topChips(history);

  const scored = upcoming.map((event) => {
    let score = 0;
    const isViewed = viewedSet.has(event.id);

    if (savedSet.has(event.id)) score += 4;
    if (preferredCategories.includes(event.category)) score += 3;
    if (preferredDistricts.includes(event.district)) score += 3;
    score += chipAffinity(event, preferredChips);

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

/** One random upcoming event for "I don't know where to go". */
export function pickRandomEvent(
  events: Event[],
  today = getKrakowTodayISO(),
): Event | null {
  const upcoming = filterUpcomingEvents(events, today);
  if (upcoming.length === 0) return null;
  return upcoming[Math.floor(Math.random() * upcoming.length)];
}
