import type { Event } from "@/lib/data";
import {
  filterUpcomingEvents,
  getKrakowTodayISO,
  getTomorrowISO,
  getWeekendISO,
  isEventOnDate,
  isEventOnWeekend,
} from "@/lib/dates";

function sortByDateTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const dateCmp = a.startsOn.localeCompare(b.startsOn);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });
}

/** Happening Today — on today (including multi-day runs), not past. */
export function getHappeningToday(
  events: Event[],
  today = getKrakowTodayISO(),
): Event[] {
  return sortByDateTime(
    filterUpcomingEvents(events, today).filter((event) =>
      isEventOnDate(event.startsOn, today, event.endsOn),
    ),
  );
}

/** Tomorrow — single day or range that includes tomorrow. */
export function getHappeningTomorrow(
  events: Event[],
  today = getKrakowTodayISO(),
): Event[] {
  const tomorrow = getTomorrowISO(today);
  return sortByDateTime(
    filterUpcomingEvents(events, today).filter((event) =>
      isEventOnDate(event.startsOn, tomorrow, event.endsOn),
    ),
  );
}

/** This Weekend — Saturday or Sunday of the current week. */
export function getHappeningThisWeekend(
  events: Event[],
  today = getKrakowTodayISO(),
): Event[] {
  const weekend = getWeekendISO(today);
  return sortByDateTime(
    filterUpcomingEvents(events, today).filter((event) =>
      isEventOnWeekend(event.startsOn, event.endsOn, weekend),
    ),
  );
}

/** Trending in Kraków — flagged trending, upcoming only. */
export function getTrendingInKrakow(
  events: Event[],
  today = getKrakowTodayISO(),
): Event[] {
  return sortByDateTime(
    filterUpcomingEvents(events, today).filter((event) => event.trending),
  );
}
