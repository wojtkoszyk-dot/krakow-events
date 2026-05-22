import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventCandidateDbRow } from "@/lib/db/event-records";
import {
  buildEventCandidateInsert,
  mergeTags,
} from "@/lib/importers/candidate-insert";
import type { RaImportedItem } from "@/lib/importers/ra-types";

export type { EventCandidateDbRow };

function toCandidateInsert(item: RaImportedItem) {
  const tags = mergeTags(item.tags, item.artists);

  const rawData: Record<string, unknown> = {
    source: "resident-advisor",
    raEventId: item.raEventId,
    artists: item.artists,
    genres: item.genres,
    ticketUrl: item.ticketUrl,
    time: item.time,
    rawText: item.rawText,
    parsed: {
      title: item.title,
      venue: item.venue,
      district: item.district,
      startDate: item.startDate,
      endDate: item.endDate,
      category: item.category,
      price: item.price,
      imageUrl: item.imageUrl,
    },
  };

  return buildEventCandidateInsert({
    title: item.title,
    description: item.description,
    category: item.category,
    tags,
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
    rawData,
    time: item.time,
  });
}

export type RaCandidateImportResult = {
  parsed: number;
  inserted: number;
  skipped: number;
  candidates: EventCandidateDbRow[];
};

export async function saveRaCandidates(
  supabase: SupabaseClient,
  items: RaImportedItem[],
): Promise<RaCandidateImportResult> {
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
