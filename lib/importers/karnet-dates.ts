/** Polish month names (genitive/nominative) → month number. */
const PL_MONTHS: Record<string, number> = {
  stycznia: 1,
  lutego: 2,
  marca: 3,
  kwietnia: 4,
  maja: 5,
  czerwca: 6,
  lipca: 7,
  sierpnia: 8,
  września: 9,
  października: 10,
  listopada: 11,
  grudnia: 12,
  styczeń: 1,
  luty: 2,
  marzec: 3,
  kwiecień: 4,
  maj: 5,
  czerwiec: 6,
  lipiec: 7,
  sierpień: 8,
  wrzesień: 9,
  październik: 10,
  listopad: 11,
  grudzień: 12,
};

const WEEKDAY_PREFIX =
  /^(?:poniedziałek|wtorek|środa|czwartek|piątek|sobota|niedziela),?\s*/i;

export type KarnetParsedDates = {
  startDate: string | null;
  endDate: string | null;
  time: string | null;
  isRecurring: boolean;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDate(day: number, month: number, year: number): string | null {
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function inferYear(fallbackTexts: string[]): number | null {
  for (const text of fallbackTexts) {
    const y = text.match(/\b(20\d{2})\b/);
    if (y) return Number.parseInt(y[1], 10);
  }
  return null;
}

/** Parse `1.05`, `14.05.2026`, `1.05.2026` marks from line-up. */
export function parseKarnetShortDate(
  mark: string,
  defaultYear?: number | null,
): { date: string | null; time: string | null } {
  const cleaned = mark.replace(/\s+/g, " ").trim();
  const timeMatch = cleaned.match(/\b(\d{1,2}:\d{2})\b/);
  const time = timeMatch?.[1] ?? null;

  const short = cleaned.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/);
  if (!short) return { date: null, time };

  const day = Number.parseInt(short[1], 10);
  const month = Number.parseInt(short[2], 10);
  let year = short[3]
    ? Number.parseInt(short[3].length === 2 ? `20${short[3]}` : short[3], 10)
    : defaultYear ?? new Date().getFullYear();

  return { date: toIsoDate(day, month, year), time };
}

/** Parse "14 maja 2026" or "piątek, 1 maja 2026, 20:00". */
function parsePolishDateFragment(
  fragment: string,
): { date: string | null; time: string | null } {
  let cleaned = fragment.replace(/\s+/g, " ").replace(/,/g, " ").trim();
  cleaned = cleaned.replace(WEEKDAY_PREFIX, "");

  const short = parseKarnetShortDate(cleaned);
  if (short.date) return short;

  const timeMatch = cleaned.match(/\b(\d{1,2}:\d{2})\b/);
  const time = timeMatch?.[1] ?? null;
  const withoutTime = time ? cleaned.replace(time, "").trim() : cleaned;

  const match = withoutTime.match(
    /(\d{1,2})\s+([a-ząćęłńóśźż]+)\s+(\d{4})/i,
  );
  if (!match) {
    return { date: null, time };
  }

  const day = Number.parseInt(match[1], 10);
  const monthKey = match[2].toLowerCase();
  const year = Number.parseInt(match[3], 10);
  const month = PL_MONTHS[monthKey];
  if (!month) {
    return { date: null, time };
  }

  return { date: toIsoDate(day, month, year), time };
}

/** Month-only hint e.g. "maj 2026". */
export function parseKarnetMonthHint(text: string): KarnetParsedDates {
  const match = text.match(/([a-ząćęłńóśźż]+)\s+(\d{4})/i);
  if (!match) {
    return { startDate: null, endDate: null, time: null, isRecurring: false };
  }

  const month = PL_MONTHS[match[1].toLowerCase()];
  const year = Number.parseInt(match[2], 10);
  if (!month) {
    return { startDate: null, endDate: null, time: null, isRecurring: false };
  }

  return {
    startDate: toIsoDate(1, month, year),
    endDate: toIsoDate(lastDayOfMonth(year, month), month, year),
    time: null,
    isRecurring: false,
  };
}

/** Parse one Karnet date string (single day, range, or month). */
export function parseKarnetDateText(
  text: string,
  defaultYear?: number | null,
): KarnetParsedDates {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return { startDate: null, endDate: null, time: null, isRecurring: false };
  }

  if (/^\s*[a-ząćęłńóśźż]+\s+\d{4}\s*$/i.test(normalized)) {
    return parseKarnetMonthHint(normalized);
  }

  const parts = normalized.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) {
    const start = parsePolishDateFragment(parts[0]);
    const end = parsePolishDateFragment(parts[parts.length - 1]);
    if (!end.date && defaultYear) {
      const shortEnd = parseKarnetShortDate(parts[parts.length - 1], defaultYear);
      return {
        startDate: start.date,
        endDate: shortEnd.date ?? start.date,
        time: start.time ?? end.time ?? shortEnd.time,
        isRecurring: false,
      };
    }
    return {
      startDate: start.date,
      endDate: end.date ?? start.date,
      time: start.time ?? end.time,
      isRecurring: false,
    };
  }

  const single = parsePolishDateFragment(normalized);
  if (!single.date && defaultYear) {
    const short = parseKarnetShortDate(normalized, defaultYear);
    return {
      startDate: short.date,
      endDate: short.date,
      time: short.time,
      isRecurring: false,
    };
  }

  return {
    startDate: single.date,
    endDate: single.date,
    time: single.time,
    isRecurring: false,
  };
}

function mergeDateResults(results: KarnetParsedDates[]): KarnetParsedDates {
  const starts = results.map((r) => r.startDate).filter(Boolean) as string[];
  const ends = results.map((r) => r.endDate).filter(Boolean) as string[];
  const times = results.map((r) => r.time).filter(Boolean) as string[];

  if (starts.length === 0) {
    return { startDate: null, endDate: null, time: times[0] ?? null, isRecurring: false };
  }

  starts.sort();
  ends.sort();
  return {
    startDate: starts[0],
    endDate: ends[ends.length - 1] ?? starts[starts.length - 1],
    time: times[0] ?? null,
    isRecurring: results.some((r) => r.isRecurring),
  };
}

/** Line-up `.mark` nodes → recurring span. */
export function expandRecurringFromMarks(
  marks: string[],
  fallback: KarnetParsedDates,
  defaultYear?: number | null,
): KarnetParsedDates {
  const isoDates: string[] = [];
  let time: string | null = fallback.time;

  for (const mark of marks) {
    const short = parseKarnetShortDate(mark, defaultYear);
    if (short.date) {
      isoDates.push(short.date);
      time = time ?? short.time;
      continue;
    }
    const parsed = parseKarnetDateText(mark, defaultYear);
    if (parsed.startDate) isoDates.push(parsed.startDate);
    if (parsed.endDate) isoDates.push(parsed.endDate);
    time = time ?? parsed.time;
  }

  if (isoDates.length < 2) {
    return fallback;
  }

  isoDates.sort();
  return {
    startDate: isoDates[0],
    endDate: isoDates[isoDates.length - 1],
    time,
    isRecurring: true,
  };
}

/** Merge multiple `event-date` blocks + listing hints. */
export function parseKarnetDatesFromSources(
  dateTexts: string[],
  marks: string[],
  listingHint?: string,
): KarnetParsedDates {
  const year = inferYear([...dateTexts, listingHint ?? ""]);
  const parsedBlocks = dateTexts.map((t) => parseKarnetDateText(t, year));
  let merged = mergeDateResults(parsedBlocks);

  if (marks.length > 0) {
    merged = expandRecurringFromMarks(marks, merged, year);
  }

  if (!merged.startDate && listingHint) {
    merged = parseKarnetDateText(listingHint, year);
  }

  return merged;
}
