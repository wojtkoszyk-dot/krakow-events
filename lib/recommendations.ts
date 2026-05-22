import type { Event } from "@/lib/data";
import {
  comparePublicEventDates,
  filterUpcomingEvents,
  getKrakowTodayISO,
  sortPublicEvents,
} from "@/lib/dates";
import type { EventCategory } from "@/lib/taxonomy";
import { hasUserHistory, type UserHistory } from "@/lib/user-history";

const PICKED_LIMIT = 5;
const SURPRISE_POOL = 12;

function daysUntilStart(event: Event, today: string): number {
  if (!event.startsOn?.trim()) {
    return Number.MAX_SAFE_INTEGER;
  }
  const [ty, tm, td] = today.split("-").map(Number);
  const [sy, sm, sd] = event.startsOn.split("-").map(Number);
  const todayMs = Date.UTC(ty, tm - 1, td);
  const startMs = Date.UTC(sy, sm - 1, sd);
  return Math.round((startMs - todayMs) / (1000 * 60 * 60 * 24));
}

function topCategories(history: UserHistory): EventCategory[] {
  return Object.entries(history.categoryClicks)
    .filter(([, n]) => (n ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([cat]) => cat as EventCategory);
}

function topDistricts(history: UserHistory): string[] {
  return Object.entries(history.districtClicks)
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d);
}

/** Tags from events the user viewed — soft taste signal. */
function viewedTagAffinity(event: Event, allEvents: Event[], history: UserHistory): number {
  const byId = new Map(allEvents.map((e) => [e.id, e]));
  const tagCounts = new Map<string, number>();
  for (const id of history.viewedIds) {
    const e = byId.get(id);
    e?.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
  }
  let score = 0;
  for (const tag of event.tags) {
    score += Math.min(tagCounts.get(tag) ?? 0, 3);
  }
  return score;
}

function scoreEvent(
  event: Event,
  history: UserHistory,
  allEvents: Event[],
  today: string,
): { event: Event; score: number; isViewed: boolean } {
  const viewedSet = new Set(history.viewedIds);
  const savedSet = new Set(history.savedIds);
  const preferredCategories = topCategories(history);
  const preferredDistricts = topDistricts(history);
  const isViewed = viewedSet.has(event.id);

  let score = 1;
  if (savedSet.has(event.id)) score += 4;
  if (preferredCategories.includes(event.category)) score += 3;
  if (preferredDistricts.includes(event.district)) score += 3;
  score += viewedTagAffinity(event, allEvents, history);

  const days = daysUntilStart(event, today);
  if (days >= 0 && days <= 3) score += 2;
  if (days === 0 || days === 1) score += 2;
  if (isViewed) score -= 50;

  return { event, score, isViewed };
}

export function getPickedForYou(
  events: Event[],
  history: UserHistory,
  today = getKrakowTodayISO(),
): Event[] {
  const upcoming = sortPublicEvents(filterUpcomingEvents(events, today));

  if (!hasUserHistory(history)) {
    return getTrendingFallback(upcoming);
  }

  const scored = upcoming.map((item) =>
    scoreEvent(item, history, events, today),
  );

  scored.sort((a, b) => {
    if (a.isViewed !== b.isViewed) return a.isViewed ? 1 : -1;
    if (b.score !== a.score) return b.score - a.score;
    return comparePublicEventDates(a.event, b.event);
  });

  return scored.slice(0, PICKED_LIMIT).map((s) => s.event);
}

export function getTrendingFallback(events: Event[]): Event[] {
  const trending = events.filter((e) => e.trending);
  const pool = trending.length >= PICKED_LIMIT ? trending : events;
  return sortPublicEvents(pool).slice(0, PICKED_LIMIT);
}

export function isPersonalizedPicks(history: UserHistory): boolean {
  return hasUserHistory(history);
}

export function pickSurpriseEvent(
  events: Event[],
  history: UserHistory,
  today = getKrakowTodayISO(),
): Event | null {
  const upcoming = sortPublicEvents(filterUpcomingEvents(events, today));
  if (upcoming.length === 0) return null;

  if (!hasUserHistory(history)) {
    const pool = getTrendingFallback(upcoming);
    const pick = pool.length > 0 ? pool : upcoming;
    return pick[Math.floor(Math.random() * pick.length)];
  }

  const scored = upcoming
    .map((item) => scoreEvent(item, history, events, today))
    .sort((a, b) => {
      if (a.isViewed !== b.isViewed) return a.isViewed ? 1 : -1;
      if (b.score !== a.score) return b.score - a.score;
      return comparePublicEventDates(a.event, b.event);
    });

  const candidates = scored.filter((s) => s.score > 0).slice(0, SURPRISE_POOL);
  const pool =
    candidates.length > 0
      ? candidates
      : scored.filter((s) => !s.isViewed).slice(0, SURPRISE_POOL);

  if (pool.length === 0) {
    return upcoming[Math.floor(Math.random() * upcoming.length)];
  }

  const totalWeight = pool.reduce((sum, c) => sum + Math.max(c.score, 1), 0);
  let roll = Math.random() * totalWeight;
  for (const c of pool) {
    roll -= Math.max(c.score, 1);
    if (roll <= 0) return c.event;
  }
  return pool[0].event;
}
