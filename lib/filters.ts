import type { Event } from "@/lib/data";
import {
  filterUpcomingEvents,
  formatShortDate,
  getKrakowTodayISO,
  getTomorrowISO,
  getWeekendISO,
  isEventInDateRange,
  isEventOnDate,
  isEventOnWeekend,
  sortPublicEvents,
} from "@/lib/dates";
import { matchesSearch } from "@/lib/search";
import type { CategoryFilterId, EventCategory } from "@/lib/taxonomy";
import { CATEGORY_FILTER_IDS } from "@/lib/taxonomy";
import type { UserHistory } from "@/lib/user-history";

export type { CategoryFilterId, EventCategory };
export { CATEGORY_FILTER_IDS };

export type DatePreset = "all" | "today" | "tomorrow" | "weekend" | "custom";

export type CustomDateRange = {
  from: string;
  to: string;
};

export type FilterState = {
  search: string;
  datePreset: DatePreset;
  customRange: CustomDateRange | null;
  /** Primary category filter — same ids as event.category */
  category: CategoryFilterId | null;
  free: boolean;
};

export const EMPTY_FILTERS: FilterState = {
  search: "",
  datePreset: "all",
  customRange: null,
  category: null,
  free: false,
};

export const DEFAULT_FILTERS: FilterState = { ...EMPTY_FILTERS };

export const DATE_SEGMENT_IDS: DatePreset[] = [
  "all",
  "today",
  "tomorrow",
  "weekend",
  "custom",
];

export function hasRefinementFilters(state: FilterState): boolean {
  return state.search.trim().length > 0 || state.category !== null;
}

export function isFreeEvent(event: Event): boolean {
  return (
    event.price.toLowerCase().includes("free") || event.tags.includes("free")
  );
}

export function hasActiveFilters(state: FilterState): boolean {
  return (
    state.search.trim().length > 0 ||
    state.datePreset !== "all" ||
    state.category !== null ||
    state.free
  );
}

export function matchesCategoryFilter(
  event: Event,
  category: CategoryFilterId | null,
): boolean {
  if (!category) return true;
  return event.category === category;
}

export function matchesDatePreset(
  event: Event,
  state: FilterState,
  today = getKrakowTodayISO(),
): boolean {
  switch (state.datePreset) {
    case "all":
      return true;
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
    case "custom":
      if (!state.customRange) return true;
      return isEventInDateRange(
        event.startsOn,
        event.endsOn,
        state.customRange.from,
        state.customRange.to,
      );
    default:
      return true;
  }
}

/** i18n keys for feed section titles */
export function getFeedHeadingKey(state: FilterState): string {
  switch (state.datePreset) {
    case "all":
      return "feed.allUpcoming";
    case "today":
      return "feed.today";
    case "tomorrow":
      return "feed.tomorrow";
    case "weekend":
      return "feed.thisWeekend";
    case "custom":
      return "feed.customDates";
    default:
      return "feed.allUpcoming";
  }
}

export function getCustomSegmentLabel(state: FilterState): string | null {
  if (state.datePreset !== "custom" || !state.customRange) return null;
  const { from, to } = state.customRange;
  if (from === to) return formatShortDate(from);
  return `${formatShortDate(from)}–${formatShortDate(to)}`;
}

import { getCategoryLabel } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/translations";

/** @deprecated Use CategoryFilterId */
export type CategoryChipId = CategoryFilterId;

/** @deprecated Use CATEGORY_FILTER_IDS */
export const CATEGORY_FILTER_CHIPS = CATEGORY_FILTER_IDS.map((id) => ({
  id,
  label: getCategoryLabel(id, "en"),
}));

/** @deprecated Use DATE_SEGMENT_IDS + useLocale */
export const DATE_SEGMENT_OPTIONS = DATE_SEGMENT_IDS.map((id) => ({
  id,
  label:
    id === "all"
      ? "All"
      : id === "today"
        ? "Today"
        : id === "tomorrow"
          ? "Tomorrow"
          : id === "weekend"
            ? "Weekend"
            : "Custom",
}));

/** @deprecated Use getFeedHeadingKey + t() */
export function getFeedHeading(state: FilterState, _locale: Locale = "en"): string {
  const key = getFeedHeadingKey(state);
  const labels: Record<string, string> = {
    "feed.allUpcoming": "All upcoming",
    "feed.today": "Today",
    "feed.tomorrow": "Tomorrow",
    "feed.thisWeekend": "This weekend",
    "feed.customDates": "Custom dates",
  };
  return labels[key] ?? "All upcoming";
}

export function filterEvents(
  events: Event[],
  state: FilterState,
  _history?: UserHistory,
  today = getKrakowTodayISO(),
): Event[] {
  const upcoming = filterUpcomingEvents(events, today);

  return sortPublicEvents(
    upcoming
      .filter((event) => matchesSearch(event, state.search))
      .filter((event) => matchesDatePreset(event, state, today))
      .filter((event) => matchesCategoryFilter(event, state.category))
      .filter((event) => (state.free ? isFreeEvent(event) : true)),
  );
}

