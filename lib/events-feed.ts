import { cookies } from "next/headers";
import type { Event } from "@/lib/data";
import { getMockEvents } from "@/lib/data";
import type { EventDbRow } from "@/lib/db/event-records";
import {
  normalizeEventPrice,
  normalizeEventTime,
  normalizeEventVenue,
} from "@/lib/event-display";
import {
  filterUpcomingEvents,
  filterUpcomingPublicEvents,
  formatDisplayDate,
  getKrakowTodayISO,
  sortPublicEvents,
} from "@/lib/dates";
import { mapDescriptionsFromDb } from "@/lib/event-descriptions";
import { isEventCategory, type EventCategory } from "@/lib/taxonomy";
import { createClient } from "@/utils/supabase/server";

/** Used when `events.image_url` is empty (matches seed aesthetic). */
export const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80";

function normalizeCategory(value: string | null | undefined): EventCategory {
  if (!value) return "other";
  const slug = value.trim().toLowerCase().replace(/\s+/g, "-");
  if (isEventCategory(slug)) return slug;
  if (slug === "other") return "other";
  return "other";
}

function formatEventDateLabel(startsOn: string, endsOn?: string): string {
  if (!startsOn) {
    return "";
  }
  if (endsOn && endsOn !== startsOn) {
    return `${formatDisplayDate(startsOn)} — ${formatDisplayDate(endsOn)}`;
  }
  return formatDisplayDate(startsOn);
}

/** Map Supabase `events` row → UI `Event` (no TBA placeholders). */
export function mapEventDbRowToEvent(row: EventDbRow): Event {
  const startsOn = row.start_date?.slice(0, 10) ?? "";
  const endsOn = row.end_date?.slice(0, 10) || undefined;

  const { descriptionPl, descriptionEn } = mapDescriptionsFromDb(row);

  return {
    id: row.id,
    title: row.title,
    startsOn,
    endsOn,
    date: formatEventDateLabel(startsOn, endsOn),
    time: normalizeEventTime(null),
    venue: normalizeEventVenue(row.venue),
    district: row.district?.trim() || "Kraków",
    category: normalizeCategory(row.category),
    tags: row.tags ?? [],
    price: normalizeEventPrice(row.price),
    descriptionPl,
    descriptionEn,
    imageUrl: row.image_url?.trim() || DEFAULT_EVENT_IMAGE,
    trending: false,
    sourceName: row.source_name?.trim() || undefined,
    sourceUrl: row.source_url?.trim() || undefined,
  };
}

/** Fetch from Supabase; returns `null` on error or zero rows (caller uses mock). */
async function fetchEventsFromSupabase(): Promise<Event[] | null> {
  try {
    const supabase = createClient(await cookies());
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("[events-feed] Supabase query failed:", error.message);
      return null;
    }

    if (!data?.length) {
      return null;
    }

    const mapped = (data as EventDbRow[]).map(mapEventDbRowToEvent);
    return sortPublicEvents(filterUpcomingPublicEvents(mapped));
  } catch (err) {
    console.error("[events-feed] Supabase fetch error:", err);
    return null;
  }
}

/**
 * Public app feed: upcoming Supabase events, sorted by start_date.
 * Falls back to mock seeds when Supabase returns nothing or errors.
 */
export async function loadPublicEvents(): Promise<Event[]> {
  const fromSupabase = await fetchEventsFromSupabase();

  if (fromSupabase && fromSupabase.length > 0) {
    return fromSupabase;
  }

  return sortPublicEvents(filterUpcomingEvents(getMockEvents()));
}
