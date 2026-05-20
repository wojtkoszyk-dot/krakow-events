import type { Event } from "@/lib/data";
import {
  filterUpcomingEvents,
  getKrakowTodayISO,
  getTomorrowISO,
  getWeekendISO,
  isEventOnDate,
  isEventOnWeekend,
} from "@/lib/dates";
import type { UserHistory } from "@/lib/user-history";
import { getPreferredDistricts } from "@/lib/user-history";

export type DateFilter = "today" | "tomorrow" | "weekend";

export type ActiveFilter =
  | { type: "date"; value: DateFilter }
  | { type: "free" }
  | { type: "nearMe" };

export const QUICK_FILTER_CHIPS = [
  {
    id: "today",
    label: "Today",
    filter: { type: "date" as const, value: "today" as const },
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    filter: { type: "date" as const, value: "tomorrow" as const },
  },
  {
    id: "weekend",
    label: "This Weekend",
    filter: { type: "date" as const, value: "weekend" as const },
  },
  { id: "free", label: "Free", filter: { type: "free" as const } },
  { id: "nearMe", label: "Near Me", filter: { type: "nearMe" as const } },
] as const;

export function filtersEqual(
  a: ActiveFilter | null,
  b: ActiveFilter,
): boolean {
  if (!a) return false;
  if (a.type !== b.type) return false;
  if (a.type === "date" && b.type === "date") return a.value === b.value;
  return true;
}

export function isFreeEvent(event: Event): boolean {
  return event.price.toLowerCase().includes("free");
}

export function matchesSearch(event: Event, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    event.title.toLowerCase().includes(q) ||
    event.venue.toLowerCase().includes(q) ||
    event.category.toLowerCase().includes(q) ||
    event.district.toLowerCase().includes(q)
  );
}

export function matchesDateFilter(
  event: Event,
  filter: DateFilter,
  today = getKrakowTodayISO(),
): boolean {
  switch (filter) {
    case "today":
      return isEventOnDate(event.startsOn, today, event.endsOn);
    case "tomorrow": {
      const tomorrow = getTomorrowISO(today);
      return isEventOnDate(event.startsOn, tomorrow, event.endsOn);
    }
    case "weekend":
      return isEventOnWeekend(
        event.startsOn,
        event.endsOn,
        getWeekendISO(today),
      );
    default:
      return true;
  }
}

export function matchesNearMeFilter(
  event: Event,
  history: UserHistory,
): boolean {
  const districts = getPreferredDistricts(history);
  return districts.includes(event.district);
}

function matchesActiveFilter(
  event: Event,
  filter: ActiveFilter,
  history: UserHistory,
  today: string,
): boolean {
  switch (filter.type) {
    case "date":
      return matchesDateFilter(event, filter.value, today);
    case "free":
      return isFreeEvent(event);
    case "nearMe":
      return matchesNearMeFilter(event, history);
    default:
      return true;
  }
}

/**
 * Filters the main event list: search + one quick chip at a time.
 * Always drops past events first so the list stays forward-looking.
 */
export function filterEvents(
  events: Event[],
  options: {
    search?: string;
    activeFilter?: ActiveFilter | null;
    history?: UserHistory;
    today?: string;
  },
): Event[] {
  const {
    search = "",
    activeFilter = null,
    history = { categoryClicks: {}, districtClicks: {}, viewedIds: [], savedIds: [] },
    today = getKrakowTodayISO(),
  } = options;

  const upcoming = filterUpcomingEvents(events, today);

  return upcoming
    .filter((event) => matchesSearch(event, search))
    .filter((event) => {
      if (!activeFilter) return true;
      return matchesActiveFilter(event, activeFilter, history, today);
    })
    .sort((a, b) => {
      const dateCmp = a.startsOn.localeCompare(b.startsOn);
      if (dateCmp !== 0) return dateCmp;
      return a.time.localeCompare(b.time);
    });
}
