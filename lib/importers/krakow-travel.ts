import { fetchKrakowTravelHtml } from "@/lib/importers/krakow-travel-fetch";
import {
  parseKrakowTravelDetailPage,
  parseKrakowTravelListingFallback,
} from "@/lib/importers/krakow-travel-detail";
import { extractKrakowTravelListingEntries } from "@/lib/importers/krakow-travel-listing";
import { scoreKrakowTravelImport } from "@/lib/importers/krakow-travel-quality";
import {
  KRAKOW_TRAVEL_EVENTS_URL,
  KRAKOW_TRAVEL_SOURCE_NAME,
  type KrakowTravelImportedItem,
  type KrakowTravelListingEntry,
} from "@/lib/importers/krakow-travel-types";

export {
  KRAKOW_TRAVEL_BASE_URL,
  KRAKOW_TRAVEL_EVENTS_URL,
  KRAKOW_TRAVEL_SOURCE_NAME,
  type KrakowTravelImportedItem,
  type KrakowTravelListingEntry,
} from "@/lib/importers/krakow-travel-types";

/** Fetch listing + up to `limit` detail pages. */
export async function importKrakowTravelEvents(
  limit = 10,
): Promise<KrakowTravelImportedItem[]> {
  const listingHtml = await fetchKrakowTravelHtml(KRAKOW_TRAVEL_EVENTS_URL);
  const entries = extractKrakowTravelListingEntries(listingHtml, limit);
  const items: KrakowTravelImportedItem[] = [];

  for (const entry of entries) {
    try {
      const detailHtml = await fetchKrakowTravelHtml(entry.sourceUrl);
      const parsed = parseKrakowTravelDetailPage(
        detailHtml,
        entry.sourceUrl,
        entry,
      );

      if (parsed) {
        items.push({
          ...parsed,
          qualityScore: scoreKrakowTravelImport(parsed),
        });
        continue;
      }
    } catch (err) {
      console.warn(
        "[krakow-travel] detail fetch failed, using listing fallback:",
        entry.sourceUrl,
        err,
      );
    }

    const fallback = parseKrakowTravelListingFallback(entry);
    items.push({
      ...fallback,
      qualityScore: scoreKrakowTravelImport(fallback),
    });
  }

  return items;
}
