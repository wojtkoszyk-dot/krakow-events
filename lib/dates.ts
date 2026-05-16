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

/** Saturday and Sunday ISO dates for the week containing `today` */
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
