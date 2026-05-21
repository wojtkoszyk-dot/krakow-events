import type { SupabaseClient } from "@supabase/supabase-js";
import type { KarnetImportedItem } from "@/lib/importers/karnet";

/** Matches `public.event_candidates` in Supabase. */
export type EventCandidateDbRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[] | null;
  venue: string | null;
  district: string | null;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
  price: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  status: string;
  quality_score: number;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function toCandidateInsert(item: KarnetImportedItem) {
  return {
    title: item.title,
    description: item.rawText,
    category: "Other",
    tags: [] as string[],
    venue: null,
    district: "Kraków",
    address: null,
    start_date: null,
    end_date: null,
    price: null,
    image_url: null,
    source_name: item.sourceName,
    source_url: item.sourceUrl,
    status: "pending",
    quality_score: 50,
    raw_data: item,
  };
}

export type KarnetCandidateImportResult = {
  parsed: number;
  inserted: number;
  skipped: number;
  candidates: EventCandidateDbRow[];
};

export async function saveKarnetCandidates(
  supabase: SupabaseClient,
  items: KarnetImportedItem[],
): Promise<KarnetCandidateImportResult> {
  const candidates: EventCandidateDbRow[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const { data: existing, error: lookupError } = await supabase
      .from("event_candidates")
      .select("id")
      .eq("title", item.title)
      .eq("source_url", item.sourceUrl)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existing) {
      skipped += 1;
      continue;
    }

    const { data, error: insertError } = await supabase
      .from("event_candidates")
      .insert(toCandidateInsert(item))
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    if (data) {
      candidates.push(data as EventCandidateDbRow);
      inserted += 1;
    }
  }

  return {
    parsed: items.length,
    inserted,
    skipped,
    candidates,
  };
}
