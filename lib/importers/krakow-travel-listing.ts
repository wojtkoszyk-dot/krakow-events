import { load } from "cheerio";
import { labelFromCategoryIconSrc } from "@/lib/importers/krakow-travel-categories";
import {
  KRAKOW_TRAVEL_BASE_URL,
  type KrakowTravelListingEntry,
} from "@/lib/importers/krakow-travel-types";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function resolveKrakowTravelUrl(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `${KRAKOW_TRAVEL_BASE_URL}${href.startsWith("/") ? href : `/${href}`}`;
}

const EVENT_PATH = /\/\d+-krakow-/i;

/** Parse `/wydarzenia` listing and collect event detail URLs. */
export function extractKrakowTravelListingEntries(
  html: string,
  limit = 10,
): KrakowTravelListingEntry[] {
  const $ = load(html);
  const entries: KrakowTravelListingEntry[] = [];
  const seen = new Set<string>();

  $(".hover-block").each((_, element) => {
    if (entries.length >= limit) {
      return false;
    }

    const $block = $(element);
    const href =
      $block.find("a.thumbnail[href]").first().attr("href") ??
      $block.find("a[href]").filter((__, el) => {
        const h = $(el).attr("href") ?? "";
        return EVENT_PATH.test(h);
      }).first().attr("href");

    if (!href || !EVENT_PATH.test(href)) {
      return;
    }

    const sourceUrl = resolveKrakowTravelUrl(href);
    if (seen.has(sourceUrl)) {
      return;
    }
    seen.add(sourceUrl);

    const title = normalizeText($block.find("h5.title").first().text());
    if (!title) {
      return;
    }

    const dateHint = normalizeText($block.find("span.address").first().text());
    const caption = normalizeText($block.find("p.caption").first().text());
    const iconSrc = $block.find(".icon-museum img").first().attr("src");
    const iconLabel = labelFromCategoryIconSrc(iconSrc);
    const travelLabels = iconLabel ? [iconLabel] : [];

    const listingHint = [dateHint, caption].filter(Boolean).join(" | ");

    const bgStyle =
      $block.find(".background-image").first().attr("style") ?? "";
    const bgMatch = bgStyle.match(/url\(['"]?([^'")]+)['"]?\)/i);
    let listingImageUrl: string | null = null;
    if (bgMatch?.[1]) {
      const url = bgMatch[1].replace(/\/m\.jpg/i, "/xl.jpg");
      listingImageUrl = url.startsWith("http")
        ? url
        : resolveKrakowTravelUrl(url);
    }

    entries.push({
      title,
      sourceUrl,
      listingHint,
      travelLabels,
      listingImageUrl,
    });
  });

  return entries;
}
