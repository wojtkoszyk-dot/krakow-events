import type { Event } from "@/lib/data";

const KRAKOW_TZ = "Europe/Warsaw";

export function getKrakowTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KRAKOW_TZ }).format(
    new Date(),
  );
}

export function addDaysISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KRAKOW_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KRAKOW_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getTomorrowISO(today = getKrakowTodayISO()): string {
  return addDaysISO(today, 1);
}

/** Saturday and Sunday ISO dates for the week containing `today`. */
export function getWeekendISO(today = getKrakowTodayISO()): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const saturday = addDaysISO(today, daysUntilSaturday);
  const sunday = addDaysISO(saturday, 1);
  return [saturday, sunday];
}

export function isEventOnDate(
  startsOn: string,
  isoDate: string,
  endsOn?: string,
): boolean {
  if (!startsOn?.trim()) {
    return false;
  }
  if (endsOn) {
    return startsOn <= isoDate && isoDate <= endsOn;
  }
  return startsOn === isoDate;
}

export function isEventOnWeekend(
  startsOn: string,
  endsOn: string | undefined,
  weekendDays: string[],
): boolean {
  return weekendDays.some((day) => isEventOnDate(startsOn, day, endsOn));
}

/** Past = fully ended before today (running exhibitions with endsOn >= today still count). */
export function isPastEvent(event: Event, today = getKrakowTodayISO()): boolean {
  if (event.endsOn) {
    return event.endsOn < today;
  }
  if (!event.startsOn) {
    return false;
  }
  return event.startsOn < today;
}

/**
 * Public feed: hide outdated events.
 * - end_date before today → hidden
 * - start before today with no end_date → hidden
 * - missing start_date → kept (sorted last)
 */
export function isOutdatedPublicEvent(
  event: Event,
  today = getKrakowTodayISO(),
): boolean {
  const startsOn = event.startsOn?.trim() || null;
  const endsOn = event.endsOn?.trim() || null;

  if (endsOn && endsOn < today) {
    return true;
  }
  if (startsOn && startsOn < today && !endsOn) {
    return true;
  }
  return false;
}

export function filterUpcomingEvents(
  events: Event[],
  today = getKrakowTodayISO(),
): Event[] {
  return events.filter((event) => !isPastEvent(event, today));
}

export function filterUpcomingPublicEvents(
  events: Event[],
  today = getKrakowTodayISO(),
): Event[] {
  return events.filter((event) => !isOutdatedPublicEvent(event, today));
}

/** Compare by start_date ascending; undated events sort after dated ones. */
export function comparePublicEventDates(a: Event, b: Event): number {
  const aDate = a.startsOn?.trim() || "";
  const bDate = b.startsOn?.trim() || "";
  if (aDate && !bDate) return -1;
  if (!aDate && bDate) return 1;
  if (aDate && bDate) {
    const cmp = aDate.localeCompare(bDate);
    if (cmp !== 0) return cmp;
  }
  return a.title.localeCompare(b.title);
}

/** Dated events first (ascending), undated events last. */
export function sortPublicEvents(events: Event[]): Event[] {
  return [...events].sort(comparePublicEventDates);
}

export function compareISO(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Event overlaps [rangeFrom, rangeTo] inclusive (ISO dates). */
export function isEventInDateRange(
  startsOn: string,
  endsOn: string | undefined,
  rangeFrom: string,
  rangeTo: string,
): boolean {
  const eventEnd = endsOn ?? startsOn;
  return startsOn <= rangeTo && eventEnd >= rangeFrom;
}

export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KRAKOW_TZ,
    day: "numeric",
    month: "short",
  }).format(date);
}

/** Next N days from `startISO` (inclusive), for lightweight picker grids. */
export function getDayRangeISO(
  startISO: string,
  count: number,
): string[] {
  return Array.from({ length: count }, (_, i) => addDaysISO(startISO, i));
}

export function parseISO(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KRAKOW_TZ,
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Monday-based offset for the first day of a month grid. */
export function getMonthLeadingBlanks(year: number, month: number): number {
  const dow = new Date(year, month - 1, 1).getDay();
  return (dow + 6) % 7;
}

export function getMonthDayISOList(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    toISO(year, month, i + 1),
  );
}

export function isWeekendISO(iso: string): boolean {
  const { year, month, day } = parseISO(iso);
  const dow = new Date(year, month - 1, day).getDay();
  return dow === 0 || dow === 6;
}

export function addMonths(year: number, month: number, delta: number): {
  year: number;
  month: number;
} {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
