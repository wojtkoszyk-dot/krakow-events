import { events, type Event } from "@/lib/data";

const KRAKOW_TZ = "Europe/Warsaw";

export function getKrakowTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KRAKOW_TZ }).format(
    new Date(),
  );
}

export function formatKrakowTodayLabel(isoDate = getKrakowTodayISO()): string {
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

export function isEventOnDate(event: Event, isoDate: string): boolean {
  if (event.endsOn) {
    return event.startsOn <= isoDate && isoDate <= event.endsOn;
  }
  return event.startsOn === isoDate;
}

export function getTonightEvents(isoDate = getKrakowTodayISO()): Event[] {
  return events
    .filter((event) => isEventOnDate(event, isoDate))
    .sort((a, b) => a.time.localeCompare(b.time));
}
