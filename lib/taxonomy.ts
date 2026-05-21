/** Primary event categories — stable ids for filters and data. */
export const EVENT_CATEGORIES = [
  "music",
  "nightlife",
  "culture",
  "comedy",
  "food-drink",
  "outdoor",
  "community",
  "sports",
  "family",
  "other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** Filter chips use the same ids as event categories. */
export type CategoryFilterId = EventCategory;

export const CATEGORY_FILTER_IDS: CategoryFilterId[] = [...EVENT_CATEGORIES];

export function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}

/** @deprecated Use CategoryFilterId / EventCategory */
export type CategoryChipId = EventCategory;
