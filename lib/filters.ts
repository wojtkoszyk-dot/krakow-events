import type { Event, EventCategory } from "@/lib/data";
import {
  getKrakowTodayISO,
  getTomorrowISO,
  getWeekendISO,
  isEventOnDate,
  isEventOnWeekend,
} from "@/lib/dates";

export type DateFilter = "today" | "tomorrow" | "weekend";
export type CategoryFilter = Lowercase<EventCategory>;

const CATEGORY_FROM_FILTER: Record<CategoryFilter, EventCategory> = {
  music: "Music",
  techno: "Techno",
  "stand-up": "Stand-up",
  art: "Art",
  food: "Food",
};

export function categoryFilterToEventCategory(
  filter: CategoryFilter,
): EventCategory {
  return CATEGORY_FROM_FILTER[filter];
}

export type ActiveFilter =
  | { type: "date"; value: DateFilter }
  | { type: "category"; value: CategoryFilter };

export function matchesSearch(event: Event, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    event.title.toLowerCase().includes(q) ||
    event.venue.toLowerCase().includes(q) ||
    event.category.toLowerCase().includes(q)
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

export function matchesCategoryFilter(
  event: Event,
  filter: CategoryFilter,
): boolean {
  return event.category.toLowerCase() === filter;
}

export function filterEvents(
  events: Event[],
  options: {
    search?: string;
    activeFilter?: ActiveFilter | null;
  },
): Event[] {
  const { search = "", activeFilter = null } = options;

  return events
    .filter((event) => matchesSearch(event, search))
    .filter((event) => {
      if (!activeFilter) return true;
      if (activeFilter.type === "date") {
        return matchesDateFilter(event, activeFilter.value);
      }
      return matchesCategoryFilter(event, activeFilter.value);
    })
    .sort((a, b) => {
      const dateCmp = a.startsOn.localeCompare(b.startsOn);
      if (dateCmp !== 0) return dateCmp;
      return a.time.localeCompare(b.time);
    });
}
