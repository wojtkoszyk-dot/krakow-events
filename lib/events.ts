import { getEvents, type Event } from "@/lib/data";
import {
  formatLongDate as formatKrakowTodayLabel,
  getKrakowTodayISO,
  isEventOnDate,
} from "@/lib/dates";

export { formatKrakowTodayLabel, getKrakowTodayISO, isEventOnDate };
export type { Event };

export function getTonightEvents(
  isoDate = getKrakowTodayISO(),
  source = getEvents(),
): Event[] {
  return source
    .filter((event) => isEventOnDate(event.startsOn, isoDate, event.endsOn))
    .sort((a, b) => a.time.localeCompare(b.time));
}
