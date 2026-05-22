import { load } from "cheerio";
import { fetchKarnetHtml } from "@/lib/importers/karnet-fetch";
import {
  parseKarnetDetailPage,
  parseKarnetListingFallback,
  resolveKarnetUrl,
} from "@/lib/importers/karnet-detail";
import { parseKarnetDateText } from "@/lib/importers/karnet-dates";
import { logKarnetParse } from "@/lib/importers/karnet-debug";
import { scoreKarnetImport } from "@/lib/importers/karnet-quality";
import {
  KARNET_EVENTS_URL,
  KARNET_SOURCE_NAME,
  type KarnetImportedItem,
  type KarnetListingEntry,
} from "@/lib/importers/karnet-types";

export {
  KARNET_BASE_URL,
  KARNET_EVENTS_URL,
  KARNET_SOURCE_NAME,
  type KarnetImportedItem,
  type KarnetListingEntry,
} from "@/lib/importers/karnet-types";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Step 1 — parse listing page and collect event detail URLs. */
export function extractKarnetListingEntries(
  html: string,
  limit = 10,
): KarnetListingEntry[] {
  const $ = load(html);
  const entries: KarnetListingEntry[] = [];

  $(".event-list .event-item").each((_, element) => {
    if (entries.length >= limit) {
      return false;
    }

    const $item = $(element);
    const title = normalizeText($item.find("h3.event-title").first().text());
    const href =
      $item.find("a.event-content").first().attr("href") ??
      $item.find("a[href*='-krakow-']").first().attr("href");

    if (!title || !href) {
      return;
    }

    const eventType = normalizeText($item.find(".event-type").first().text());
    const description = normalizeText($item.find("p.event-text").first().text());
    const location = normalizeText($item.find("p.event-location").first().text());
    const dateHint = normalizeText($item.find("a.event-date span").first().text());

    const listingHint = [eventType, description, location, dateHint]
      .filter(Boolean)
      .join(" | ");

    entries.push({
      title,
      sourceUrl: resolveKarnetUrl(href),
      listingHint,
    });
  });

  return entries;
}

/** Fetch listing + each detail page; returns richly parsed events. */
export async function importKarnetEvents(
  limit = 10,
): Promise<KarnetImportedItem[]> {
  const listingHtml = await fetchKarnetHtml(KARNET_EVENTS_URL);
  const entries = extractKarnetListingEntries(listingHtml, limit);
  logKarnetParse("listing:done", { count: entries.length, urls: entries.map((e) => e.sourceUrl) });
  const items: KarnetImportedItem[] = [];

  for (const entry of entries) {
    try {
      const detailHtml = await fetchKarnetHtml(entry.sourceUrl);
      const parsed = parseKarnetDetailPage(
        detailHtml,
        entry.sourceUrl,
        entry.listingHint,
      );

      if (parsed) {
        const scored = {
          ...parsed,
          qualityScore: scoreKarnetImport(parsed),
        };
        logKarnetParse("import:scored", {
          sourceUrl: entry.sourceUrl,
          qualityScore: scored.qualityScore,
          category: scored.category,
          tagCount: scored.tags.length,
        });
        items.push(scored);
        continue;
      }
    } catch (err) {
      console.warn(
        "[karnet] detail fetch failed, using listing fallback:",
        entry.sourceUrl,
        err,
      );
    }

    const fallback = parseKarnetListingFallback(
      entry.title,
      entry.sourceUrl,
      entry.listingHint,
    );
    items.push({
      ...fallback,
      qualityScore: scoreKarnetImport(fallback),
    });
  }

  return items;
}

/** @deprecated Listing-only parse. Prefer `importKarnetEvents`. */
export function parseKarnetEventsHtml(
  html: string,
  limit = 10,
): KarnetImportedItem[] {
  return extractKarnetListingEntries(html, limit).map((entry) => {
    const dates = parseKarnetDateText(entry.listingHint);
    const item: KarnetImportedItem = {
      title: entry.title,
      sourceUrl: entry.sourceUrl,
      sourceName: KARNET_SOURCE_NAME,
      description: entry.listingHint,
      venue: null,
      district: "Kraków",
      address: null,
      startDate: dates.startDate,
      endDate: dates.endDate,
      time: dates.time,
      imageUrl: null,
      category: "Other",
      tags: [],
      price: null,
      rawText: entry.listingHint,
      karnetLabels: [],
      listingHint: entry.listingHint,
      isRecurring: false,
      qualityScore: 0,
    };
    item.qualityScore = scoreKarnetImport(item);
    return item;
  });
}
