/** Normalize placeholder values from DB/import into empty strings. */
const PLACEHOLDER_TIME = new Set(["tba", "—", "-", "n/a"]);
const PLACEHOLDER_PRICE = new Set(["tba", "—", "-", "n/a"]);
const PLACEHOLDER_VENUE = new Set([
  "tba",
  "venue tba",
  "venue to be announced",
  "—",
  "-",
  "n/a",
]);

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function normalizeEventTime(value: string | null | undefined): string {
  const v = clean(value);
  if (!v || PLACEHOLDER_TIME.has(v.toLowerCase())) return "";
  return v;
}

export function normalizeEventPrice(value: string | null | undefined): string {
  const v = clean(value);
  if (!v || PLACEHOLDER_PRICE.has(v.toLowerCase())) return "";
  return v;
}

export function normalizeEventVenue(value: string | null | undefined): string {
  const v = clean(value);
  if (!v || PLACEHOLDER_VENUE.has(v.toLowerCase())) return "";
  return v;
}

export function hasDisplayTime(time: string): boolean {
  return normalizeEventTime(time).length > 0;
}

export function hasDisplayPrice(price: string): boolean {
  return normalizeEventPrice(price).length > 0;
}

export function getDisplayPrice(
  price: string,
  seeDetailsLabel = "See details",
): string {
  return hasDisplayPrice(price) ? normalizeEventPrice(price) : seeDetailsLabel;
}

export function isPlaceholderPriceDisplay(
  price: string,
  seeDetailsLabel = "See details",
): boolean {
  return getDisplayPrice(price, seeDetailsLabel) === seeDetailsLabel;
}

import type { Event } from "@/lib/data";

export type EventSourceAttribution = {
  name: string;
  url: string | null;
  hasLink: boolean;
};

export function getEventSourceAttribution(
  event: Event,
): EventSourceAttribution | null {
  const name = event.sourceName?.trim();
  const url = event.sourceUrl?.trim();
  if (!name && !url) return null;
  return {
    name: name ?? "Unknown source",
    url: url || null,
    hasLink: Boolean(url),
  };
}

export function getDisplayVenue(
  venue: string,
  announcedLabel = "Venue to be announced",
): { text: string; isAnnounced: boolean } {
  const normalized = normalizeEventVenue(venue);
  if (!normalized) {
    return { text: announcedLabel, isAnnounced: true };
  }
  return { text: normalized, isAnnounced: false };
}
