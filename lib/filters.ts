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

/** Category chip ids shown in the UI (mapped to event fields below). */
export type CategoryChipId =
  | "all"
  | "museum"
  | "concert"
  | "rave"
  | "techno"
  | "standup"
  | "art"
  | "food"
  | "outdoor"
  | "free";

/**
 * Combined filter state — every active field narrows the list (AND logic).
 * Date chips are mutually exclusive; they can stack with category, free, near me, search.
 */
export type FilterState = {
  search: string;
  date: DateFilter | null;
  category: CategoryChipId;
  free: boolean;
  nearMe: boolean;
};

export const EMPTY_FILTERS: FilterState = {
  search: "",
  date: null,
  category: "all",
  free: false,
  nearMe: false,
};

export const DATE_FILTER_CHIPS = [
  { id: "today" as const, label: "Today", value: "today" as const },
  { id: "tomorrow" as const, label: "Tomorrow", value: "tomorrow" as const },
  { id: "weekend" as const, label: "This Weekend", value: "weekend" as const },
  { id: "free-date" as const, label: "Free", toggle: "free" as const },
  { id: "nearMe" as const, label: "Near Me", toggle: "nearMe" as const },
] as const;

export const CATEGORY_FILTER_CHIPS: { id: CategoryChipId; label: string }[] =
  [
    { id: "all", label: "All" },
    { id: "museum", label: "Museum" },
    { id: "concert", label: "Concert" },
    { id: "rave", label: "Rave" },
    { id: "techno", label: "Techno" },
    { id: "standup", label: "Stand-up" },
    { id: "art", label: "Art" },
    { id: "food", label: "Food" },
    { id: "outdoor", label: "Outdoor" },
    { id: "free", label: "Free" },
  ];

export function isFreeEvent(event: Event): boolean {
  return event.price.toLowerCase().includes("free");
}

export function hasActiveFilters(state: FilterState): boolean {
  return (
    state.search.trim().length > 0 ||
    state.date !== null ||
    state.category !== "all" ||
    state.free ||
    state.nearMe
  );
}

/** Search across copy users might type or skim. */
export function matchesSearch(event: Event, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    event.title,
    event.venue,
    event.category,
    event.district,
    event.description,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function matchesDateFilter(
  event: Event,
  filter: DateFilter,
  today = getKrakowTodayISO(),
): boolean {
  switch (filter) {
    case "today":
      return isEventOnDate(event.startsOn, today, event.endsOn);
    case "tomorrow":
      return isEventOnDate(
        event.startsOn,
        getTomorrowISO(today),
        event.endsOn,
      );
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
  return getPreferredDistricts(history).includes(event.district);
}

/**
 * Category chips map to real event data (no backend).
 * Museum/Outdoor/Rave use keywords + base category.
 */
export function matchesCategoryChip(
  event: Event,
  chip: CategoryChipId,
): boolean {
  if (chip === "all") return true;
  if (chip === "free") return isFreeEvent(event);

  const text = `${event.title} ${event.venue} ${event.description}`.toLowerCase();

  switch (chip) {
    case "museum":
      return (
        event.category === "Art" ||
        /museum|mocak|galeria|gallery|bunkier|starmach|exhibition/i.test(
          text,
        )
      );
    case "concert":
      return (
        event.category === "Music" ||
        /concert|philharmonic|nospr|arena|live/i.test(text)
      );
    case "rave":
      return (
        event.category === "Techno" &&
        /warehouse|club|prozak|szpitalna|re:|shine|electronic/i.test(text)
      );
    case "techno":
      return event.category === "Techno";
    case "standup":
      return (
        event.category === "Stand-up" ||
        /comedy|stand-up|cabaret|improv|komedialnia/i.test(text)
      );
    case "art":
      return event.category === "Art";
    case "food":
      return event.category === "Food";
    case "outdoor":
      return /outdoor|open air|park|riverside|bulwary|hype park|walking tour|planty/i.test(
        text,
      );
    default:
      return true;
  }
}

/** Dynamic heading for the results block directly under the chips. */
export function getResultsTitle(state: FilterState): string {
  if (state.search.trim()) {
    return `Results for “${state.search.trim()}”`;
  }

  const parts: string[] = [];

  if (state.date === "today") parts.push("Today in Kraków");
  else if (state.date === "tomorrow") parts.push("Tomorrow in Kraków");
  else if (state.date === "weekend") parts.push("This weekend");

  if (state.category === "museum") parts.push("Museums & galleries");
  else if (state.category === "concert") parts.push("Concerts");
  else if (state.category === "rave") parts.push("Raves & techno");
  else if (state.category === "techno") parts.push("Techno nights");
  else if (state.category === "standup") parts.push("Stand-up & comedy");
  else if (state.category === "art") parts.push("Art & culture");
  else if (state.category === "food") parts.push("Food & drink");
  else if (state.category === "outdoor") parts.push("Outdoor");

  if (state.free) parts.push("Free events");
  if (state.nearMe) parts.push("Near you");

  if (parts.length === 0) return "Upcoming events";
  return parts.join(" · ");
}

/**
 * Applies search + date + category + free + near me.
 * Past events are removed first so the list stays forward-looking.
 */
export function filterEvents(
  events: Event[],
  state: FilterState,
  history: UserHistory,
  today = getKrakowTodayISO(),
): Event[] {
  const upcoming = filterUpcomingEvents(events, today);

  return upcoming
    .filter((event) => matchesSearch(event, state.search))
    .filter((event) =>
      state.date ? matchesDateFilter(event, state.date, today) : true,
    )
    .filter((event) => matchesCategoryChip(event, state.category))
    .filter((event) => (state.free ? isFreeEvent(event) : true))
    .filter((event) =>
      state.nearMe ? matchesNearMeFilter(event, history) : true,
    )
    .sort((a, b) => {
      const dateCmp = a.startsOn.localeCompare(b.startsOn);
      if (dateCmp !== 0) return dateCmp;
      return a.time.localeCompare(b.time);
    });
}
