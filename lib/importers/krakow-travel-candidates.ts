import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventCandidateDbRow } from "@/lib/db/event-records";
import { buildEventCandidateInsert } from "@/lib/importers/candidate-insert";
import type { KrakowTravelImportedItem } from "@/lib/importers/krakow-travel-types";

export type { EventCandidateDbRow };

function toCandidateInsert(item: KrakowTravelImportedItem) {
  return buildEventCandidateInsert({
    title: item.title,
    description: item.description || item.rawText,
    category: item.category,
    tags: item.tags,
    venue: item.venue,
    district: item.district,
    address: item.address,
    startDate: item.startDate,
    endDate: item.endDate,
    price: item.price,
    imageUrl: item.imageUrl,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    qualityScore: item.qualityScore,
    rawData: { source: "krakow-travel", ...item },
  });
}

export type KrakowTravelCandidateImportResult = {
  parsed: number;
  inserted: number;
  skipped: number;
  candidates: EventCandidateDbRow[];
};

export async function saveKrakowTravelCandidates(
  supabase: SupabaseClient,
  items: KrakowTravelImportedItem[],
): Promise<KrakowTravelCandidateImportResult> {
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
