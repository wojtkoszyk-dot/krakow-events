import {
  fetchRaEventDetail,
  fetchRaKrakowListings,
  resolveRaEventUrl,
  type RaGraphqlEventSummary,
} from "@/lib/importers/ra-graphql";
import { listingRowToEntry, parseRaImportedItem } from "@/lib/importers/ra-parse";
import { scoreRaImport } from "@/lib/importers/ra-quality";
import {
  RA_KRAKOW_EVENTS_URL,
  RA_SOURCE_NAME,
  type RaImportedItem,
  type RaListingEntry,
} from "@/lib/importers/ra-types";

export {
  RA_BASE_URL,
  RA_KRAKOW_AREA_ID,
  RA_KRAKOW_EVENTS_URL,
  RA_SOURCE_NAME,
  type RaImportedItem,
  type RaListingEntry,
} from "@/lib/importers/ra-types";

/** Collect unique Kraków events from RA GraphQL listings. */
type RaListingWithSummary = {
  entry: RaListingEntry;
  summary: RaGraphqlEventSummary;
};

export async function collectRaKrakowEntries(
  limit = 10,
): Promise<RaListingWithSummary[]> {
  const seen = new Set<string>();
  const collected: RaListingWithSummary[] = [];

  let page = 1;
  while (collected.length < limit && page <= 5) {
    const rows = await fetchRaKrakowListings(page, Math.max(limit * 2, 20));
    if (rows.length === 0) break;

    for (const row of rows) {
      if (!row.event?.id || seen.has(row.event.id)) continue;
      const entry = listingRowToEntry(row);
      if (!entry) continue;
      seen.add(row.event.id);
      collected.push({ entry, summary: row.event });
      if (collected.length >= limit) break;
    }

    page += 1;
  }

  return collected;
}

/**
 * Import Kraków nightlife/electronic events via RA GraphQL
 * (HTML listing is DataDome-protected; GraphQL works with a browser UA).
 */
export async function importRaEvents(limit = 10): Promise<RaImportedItem[]> {
  const entries = await collectRaKrakowEntries(limit);
  const items: RaImportedItem[] = [];

  for (const { entry, summary } of entries) {
    try {
      const detail = await fetchRaEventDetail(entry.raEventId);
      const parsed = parseRaImportedItem(entry, summary, detail);
      if (parsed) {
        const sourceUrl = resolveRaEventUrl(
          detail?.contentUrl ?? summary.contentUrl,
          entry.raEventId,
        );
        items.push({
          ...parsed,
          sourceUrl,
          ticketUrl: sourceUrl,
          qualityScore: scoreRaImport(parsed),
        });
        continue;
      }
    } catch (err) {
      console.warn(
        "[ra] detail fetch failed, using listing summary:",
        entry.sourceUrl,
        err,
      );
    }

    const fallback = parseRaImportedItem(entry, summary, null);
    if (fallback) {
      items.push({
        ...fallback,
        qualityScore: scoreRaImport(fallback),
      });
    }
  }

  return items;
}
