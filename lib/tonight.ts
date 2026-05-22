import type { Event } from "@/lib/data";
import { getKrakowTodayISO } from "@/lib/dates";
import { hasDisplayTime } from "@/lib/event-display";
import { isFreeEvent } from "@/lib/filters";
import { getHappeningToday } from "@/lib/sections";

const KRAKOW_TZ = "Europe/Warsaw";

/** Minutes since midnight in Kraków (24h). */
export function getKrakowNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KRAKOW_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function parseEventTimeMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function popularityScore(event: Event): number {
  return event.trending ? 2 : 0;
}

function compareEventTime(a: Event, b: Event): number {
  const aHas = hasDisplayTime(a.time);
  const bHas = hasDisplayTime(b.time);
  if (aHas && !bHas) return -1;
  if (!aHas && bHas) return 1;
  if (!aHas && !bHas) return 0;
  return a.time.localeCompare(b.time);
}

function sortByPopularityThenTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const pop = popularityScore(b) - popularityScore(a);
    if (pop !== 0) return pop;
    return compareEventTime(a, b);
  });
}

function sortByTime(events: Event[]): Event[] {
  return [...events].sort(compareEventTime);
}

/** Events on today, sorted for quick nightlife decisions. */
export function getTonightAll(events: Event[], today = getKrakowTodayISO()): Event[] {
  return sortByPopularityThenTime(getHappeningToday(events, today));
}

/**
 * Live now — started within the last ~2h or on now (evening bias after 17:00).
 */
export function getLiveNowTonight(
  events: Event[],
  nowMinutes = getKrakowNowMinutes(),
  today = getKrakowTodayISO(),
): Event[] {
  const todayEvents = getHappeningToday(events, today);
  const live = todayEvents.filter((event) => {
    if (!hasDisplayTime(event.time)) return false;
    const start = parseEventTimeMinutes(event.time);
    const evening = start >= 17 * 60;
    return evening && start <= nowMinutes + 30 && start >= nowMinutes - 120;
  });
  return sortByPopularityThenTime(live);
}

/** Starting soon — later today, within the next ~5 hours. */
export function getStartingSoonTonight(
  events: Event[],
  nowMinutes = getKrakowNowMinutes(),
  today = getKrakowTodayISO(),
): Event[] {
  const todayEvents = getHappeningToday(events, today);
  const soon = todayEvents.filter((event) => {
    if (!hasDisplayTime(event.time)) return false;
    const start = parseEventTimeMinutes(event.time);
    return start > nowMinutes && start <= nowMinutes + 5 * 60;
  });
  return sortByTime(soon);
}

/** Free or under ~50 PLN tonight. */
export function isCheapTonight(event: Event): boolean {
  if (isFreeEvent(event)) return true;
  const match = event.price.match(/(\d+)/);
  if (!match) return false;
  return Number(match[1]) <= 50;
}

export function getCheapFreeTonight(
  events: Event[],
  today = getKrakowTodayISO(),
): Event[] {
  const todayEvents = getHappeningToday(events, today);
  return sortByPopularityThenTime(todayEvents.filter(isCheapTonight));
}
