import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { formatDisplayDate } from "@/lib/dates";
import { getSupabaseKey, getSupabaseUrl } from "@/utils/supabase/env";
import type { Event } from "@/lib/data";
import type { EventCategory } from "@/lib/taxonomy";
import { isEventCategory } from "@/lib/taxonomy";

export type EventCandidateStatus = "pending" | "approved" | "rejected";

/** Row shape for `public.events` (snake_case). */
export type EventRow = {
  id: string;
  title: string;
  starts_on: string;
  ends_on: string | null;
  time: string;
  venue: string;
  district: string;
  category: string;
  tags: string[] | null;
  price: string;
  description: string;
  image_url: string;
  trending: boolean;
  created_at: string;
  updated_at: string;
};

/** Row shape for `public.event_candidates`. */
export type EventCandidateRow = EventRow & {
  status: EventCandidateStatus;
  source_url: string | null;
  source_name: string | null;
  raw_data: Record<string, unknown> | null;
  quality_score: number;
  event_id: string | null;
  approved_at: string | null;
  rejected_at: string | null;
};

/** Candidate queue item for admin/import (same fields as Event + workflow metadata). */
export type EventCandidate = Event & {
  status: EventCandidateStatus;
  sourceUrl?: string;
  eventId?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
};

let supabase: SupabaseClient | null = null;

/** Legacy singleton client (`@supabase/supabase-js`). Prefer `@/utils/supabase/*` for SSR. */
export function createSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(getSupabaseUrl(), getSupabaseKey());
  }
  return supabase;
}

function rowToEvent(row: EventRow): Event {
  const startsOn = row.starts_on;
  const endsOn = row.ends_on ?? undefined;
  const category = isEventCategory(row.category) ? row.category : "other";

  return {
    id: row.id,
    title: row.title,
    startsOn,
    endsOn,
    date: endsOn
      ? `${formatDisplayDate(startsOn)} — ${formatDisplayDate(endsOn)}`
      : formatDisplayDate(startsOn),
    time: row.time,
    venue: row.venue,
    district: row.district,
    category: category as EventCategory,
    tags: row.tags ?? [],
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
    trending: row.trending ?? false,
  };
}

function rowToCandidate(row: EventCandidateRow): EventCandidate {
  const event = rowToEvent(row);
  return {
    ...event,
    status: row.status,
    sourceUrl: row.source_url ?? undefined,
    eventId: row.event_id ?? undefined,
    createdAt: row.created_at,
    approvedAt: row.approved_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
  };
}

function eventInsertFromCandidate(row: EventCandidateRow) {
  return {
    title: row.title,
    starts_on: row.starts_on,
    ends_on: row.ends_on,
    time: row.time,
    venue: row.venue,
    district: row.district,
    category: row.category,
    tags: row.tags ?? [],
    price: row.price,
    description: row.description,
    image_url: row.image_url,
    trending: row.trending ?? false,
  };
}

/** Public feed — approved events from `events` table. */
export async function getApprovedEvents(): Promise<Event[]> {
  const { data, error } = await createSupabaseClient()
    .from("events")
    .select("*")
    .order("starts_on", { ascending: true })
    .order("time", { ascending: true });

  if (error) throw error;
  return (data as EventRow[]).map(rowToEvent);
}

/** Admin queue — pending candidates awaiting review. */
export async function getEventCandidates(): Promise<EventCandidate[]> {
  const { data, error } = await createSupabaseClient()
    .from("event_candidates")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as EventCandidateRow[]).map(rowToCandidate);
}

/** Copy candidate into `events` and mark candidate approved. */
export async function approveEventCandidate(
  candidateId: string,
): Promise<{ event: Event; candidate: EventCandidate }> {
  const client = createSupabaseClient();

  const { data: candidate, error: fetchError } = await client
    .from("event_candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (fetchError) throw fetchError;
  if (!candidate) throw new Error(`Candidate not found: ${candidateId}`);

  const row = candidate as EventCandidateRow;
  if (row.status !== "pending") {
    throw new Error(`Candidate ${candidateId} is not pending (status: ${row.status})`);
  }

  const { data: inserted, error: insertError } = await client
    .from("events")
    .insert(eventInsertFromCandidate(row))
    .select("*")
    .single();

  if (insertError) throw insertError;
  if (!inserted) throw new Error("Failed to create event from candidate");

  const eventRow = inserted as EventRow;
  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await client
    .from("event_candidates")
    .update({
      status: "approved",
      event_id: eventRow.id,
      approved_at: now,
      rejected_at: null,
    })
    .eq("id", candidateId)
    .select("*")
    .single();

  if (updateError) throw updateError;
  if (!updated) throw new Error("Failed to update candidate after approval");

  return {
    event: rowToEvent(eventRow),
    candidate: rowToCandidate(updated as EventCandidateRow),
  };
}

/** Mark candidate as rejected (does not touch `events`). */
export async function rejectEventCandidate(
  candidateId: string,
): Promise<EventCandidate> {
  const now = new Date().toISOString();

  const { data, error } = await createSupabaseClient()
    .from("event_candidates")
    .update({
      status: "rejected",
      rejected_at: now,
    })
    .eq("id", candidateId)
    .eq("status", "pending")
    .select("*")
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error(
      `Candidate not found or not pending: ${candidateId}`,
    );
  }

  return rowToCandidate(data as EventCandidateRow);
}
