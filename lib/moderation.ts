import { cookies } from "next/headers";
import type { EventCandidateDbRow } from "@/lib/db/event-records";
import { createClient } from "@/utils/supabase/server";

async function getSupabase() {
  return createClient(await cookies());
}

export async function getPendingCandidates(): Promise<EventCandidateDbRow[]> {
  const { data, error } = await (await getSupabase())
    .from("event_candidates")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EventCandidateDbRow[];
}

export async function getDuplicateEventTitles(
  titles: string[],
): Promise<Set<string>> {
  const unique = [...new Set(titles.filter(Boolean))];
  if (unique.length === 0) {
    return new Set();
  }

  const { data, error } = await (await getSupabase())
    .from("events")
    .select("title")
    .in("title", unique);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.title as string));
}

function candidateToEventInsert(candidate: EventCandidateDbRow) {
  return {
    title: candidate.title,
    description: candidate.description?.trim() ?? "",
    category: candidate.category,
    tags: candidate.tags ?? [],
    venue: candidate.venue,
    district: candidate.district,
    address: candidate.address,
    start_date: candidate.start_date,
    end_date: candidate.end_date,
    price: candidate.price,
    image_url: candidate.image_url,
    source_name: candidate.source_name,
    source_url: candidate.source_url,
  };
}

export async function approveCandidate(candidateId: string): Promise<void> {
  const supabase = await getSupabase();

  const { data: candidate, error: fetchError } = await supabase
    .from("event_candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (fetchError) throw fetchError;
  if (!candidate) {
    throw new Error(`Candidate not found: ${candidateId}`);
  }

  const row = candidate as EventCandidateDbRow;
  if (row.status !== "pending") {
    throw new Error(`Candidate ${candidateId} is not pending`);
  }

  const { error: insertError } = await supabase
    .from("events")
    .insert(candidateToEventInsert(row));

  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("event_candidates")
    .update({ status: "approved" })
    .eq("id", candidateId)
    .eq("status", "pending");

  if (updateError) throw updateError;
}

export async function rejectCandidate(candidateId: string): Promise<void> {
  const { error } = await (await getSupabase())
    .from("event_candidates")
    .update({ status: "rejected" })
    .eq("id", candidateId)
    .eq("status", "pending");

  if (error) throw error;
}
