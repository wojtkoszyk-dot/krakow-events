import { load } from "cheerio";

export const KARNET_SOURCE_NAME = "Karnet Krakow Culture" as const;
export const KARNET_BASE_URL = "https://karnet.krakowculture.pl";
export const KARNET_EVENTS_URL = `${KARNET_BASE_URL}/wydarzenia`;

export type KarnetImportedItem = {
  title: string;
  sourceUrl: string;
  rawText: string;
  sourceName: typeof KARNET_SOURCE_NAME;
};

function resolveKarnetUrl(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `${KARNET_BASE_URL}${href.startsWith("/") ? href : `/${href}`}`;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Parse event cards from Karnet listing HTML. */
export function parseKarnetEventsHtml(
  html: string,
  limit = 10,
): KarnetImportedItem[] {
  const $ = load(html);
  const items: KarnetImportedItem[] = [];

  $(".event-list .event-item").each((_, element) => {
    if (items.length >= limit) {
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

    const parts: string[] = [];
    const eventType = normalizeText($item.find(".event-type").first().text());
    const description = normalizeText($item.find("p.event-text").first().text());
    const location = normalizeText($item.find("p.event-location").first().text());
    const date = normalizeText($item.find("a.event-date span").first().text());

    if (eventType) parts.push(eventType);
    if (description) parts.push(description);
    if (location) parts.push(location);
    if (date) parts.push(date);

    items.push({
      title,
      sourceUrl: resolveKarnetUrl(href),
      rawText: parts.join(" | "),
      sourceName: KARNET_SOURCE_NAME,
    });
  });

  return items;
}
