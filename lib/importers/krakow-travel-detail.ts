import { load } from "cheerio";
import {
  buildKrakowTravelTags,
  mapKrakowTravelCategory,
} from "@/lib/importers/krakow-travel-categories";
import { parseKarnetDateText } from "@/lib/importers/karnet-dates";
import {
  KRAKOW_TRAVEL_SOURCE_NAME,
  type KrakowTravelImportedItem,
  type KrakowTravelListingEntry,
} from "@/lib/importers/krakow-travel-types";
function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&oacute;/g, "ó")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

/** Prefer largest photo variant from Krakow Travel CDN. */
function normalizeTravelImageUrl(url: string | null): string | null {
  if (!url) return null;
  return url
    .replace(/\/photos\/(\d+)\/m\.jpg/i, "/photos/$1/xl.jpg")
    .replace(/\/photos\/(\d+)\/s\.jpg/i, "/photos/$1/xl.jpg")
    .replace(/\/noresize\.jpg/i, "/xl.jpg");
}

function extractImageUrl($: ReturnType<typeof load>): string | null {
  const candidates: string[] = [];

  const og = $('meta[property="og:image"]').attr("content")?.trim();
  if (og) candidates.push(og);

  $(".photo-slider a[data-lightbox]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (href) candidates.push(href);
  });

  $(".photo-slider img").each((_, el) => {
    const src = $(el).attr("src")?.trim();
    if (src) candidates.push(src);
  });

  const best =
    candidates.find((u) => /\/xl\.jpg|\/xxl\.jpg|noresize/i.test(u)) ??
    candidates[0];
  return normalizeTravelImageUrl(best ?? null);
}

function extractDescription($: ReturnType<typeof load>): string {
  const paragraphs: string[] = [];
  $(".description-info-col .content p").each((_, el) => {
    const text = normalizeText($(el).text());
    if (text.length > 40) {
      paragraphs.push(text);
    }
    if (paragraphs.length >= 5) {
      return false;
    }
  });

  if (paragraphs.length > 0) {
    return paragraphs.join("\n\n").slice(0, 2500);
  }

  const meta = $('meta[name="description"]').attr("content");
  return meta ? normalizeText(decodeHtml(meta)) : "";
}

function extractTravelLabels($: ReturnType<typeof load>): string[] {
  const labels: string[] = [];
  $(".breadcrumbs-item a").each((_, el) => {
    const text = normalizeText($(el).text());
    const href = $(el).attr("href") ?? "";
    if (!text || text === "Start" || text === "Wydarzenia") return;
    if (href.includes("type=event") && !href.includes("category=")) return;
    if (text.length > 2) labels.push(text);
  });
  return labels;
}

function extractVenue($: ReturnType<typeof load>): string | null {
  const venues: string[] = [];
  $(".side-col .recommended-place h6, .place-selected h6").each((_, el) => {
    const name = normalizeText($(el).text());
    if (name.length > 1) venues.push(name);
  });
  return venues[0] ?? null;
}

function extractInfoTags($: ReturnType<typeof load>): string[] {
  const tags: string[] = [];
  $(".description-about-col .text div").each((_, el) => {
    const line = normalizeText($(el).text());
    if (!line) return;
    const value = line.replace(/^[^:]+:\s*/i, "").trim();
    if (value) {
      for (const part of value.split(/,\s*/)) {
        const tag = part.trim();
        if (tag.length > 2 && tag.length < 80) tags.push(tag);
      }
    }
  });
  return tags;
}

function extractPrice($: ReturnType<typeof load>, corpus: string): string | null {
  if ($(".buy-ticket").length > 0) {
    const ticket = normalizeText($(".buy-ticket").first().text());
    if (/bilet/i.test(ticket)) {
      const near = corpus.match(/\b(\d+[\d\s.,]*\s*zł|\d+[\d\s.,]*\s*PLN)\b/i);
      if (near) return normalizeText(near[1]);
      return "See ticket link";
    }
  }

  const pln = corpus.match(/\b(\d+[\d\s.,]*\s*(?:PLN|zł))\b/i);
  if (pln) return normalizeText(pln[1]);

  if (/\b(wstęp wolny|darmowy wstęp|bezpłatnie|wolny wstęp)\b/i.test(corpus)) {
    return "Free admission";
  }

  return null;
}

function extractDateTexts($: ReturnType<typeof load>): string[] {
  const texts: string[] = [];
  const headerDate = normalizeText(
    $(".detail-main-header.event .head > p").first().text(),
  );
  if (headerDate) texts.push(headerDate);

  $(".event-dates .dates-list .text").each((_, el) => {
    const t = normalizeText($(el).text());
    if (t) texts.push(t);
  });

  return texts;
}

const KRAKOW_DISTRICTS = [
  "Stare Miasto",
  "Kazimierz",
  "Podgórze",
  "Krowodrza",
  "Nowa Huta",
  "Zwierzyniec",
  "Łobzów",
  "Grzegórzki",
  "Dębniki",
  "Bronowice",
];

function inferDistrict(venue: string | null, description: string): string {
  const haystack = `${venue ?? ""} ${description}`;
  for (const district of KRAKOW_DISTRICTS) {
    if (haystack.includes(district)) {
      return district;
    }
  }
  return "Kraków";
}

export function parseKrakowTravelDetailPage(
  html: string,
  sourceUrl: string,
  listing: Pick<
    KrakowTravelListingEntry,
    "listingHint" | "travelLabels" | "listingImageUrl" | "title"
  >,
): KrakowTravelImportedItem | null {
  const $ = load(html);
  const title =
    normalizeText($(".detail-main-header.event h3").first().text()) ||
    listing.title;
  if (!title) return null;

  const travelLabels = [
    ...listing.travelLabels,
    ...extractTravelLabels($),
  ];
  const uniqueLabels = [...new Set(travelLabels.map((l) => l.trim()).filter(Boolean))];

  const description = extractDescription($);
  const venue = extractVenue($);
  const corpus = normalizeText($("body").text());
  const price = extractPrice($, corpus);
  const dateTexts = extractDateTexts($);
  const dates = parseKarnetDateText(
    dateTexts[0] ?? listing.listingHint ?? "",
  );
  if (!dates.startDate && listing.listingHint) {
    const fromHint = parseKarnetDateText(listing.listingHint);
    Object.assign(dates, fromHint);
  }

  const infoTags = extractInfoTags($);
  const category = mapKrakowTravelCategory({
    title,
    description,
    venue,
    listingHint: listing.listingHint,
    travelLabels: uniqueLabels,
  });
  const tags = [
    ...new Set([
      ...buildKrakowTravelTags({
        title,
        description,
        venue,
        listingHint: listing.listingHint,
        travelLabels: uniqueLabels,
      }),
      ...infoTags,
    ]),
  ].slice(0, 24);

  const imageUrl =
    extractImageUrl($) ?? listing.listingImageUrl ?? null;

  const rawText = [
    title,
    ...dateTexts,
    venue,
    description.slice(0, 500),
    ...uniqueLabels,
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    title,
    sourceUrl,
    sourceName: KRAKOW_TRAVEL_SOURCE_NAME,
    description,
    venue,
    district: inferDistrict(venue, description),
    address: null,
    startDate: dates.startDate,
    endDate: dates.endDate,
    imageUrl,
    category,
    tags,
    price,
    rawText,
    travelLabels: uniqueLabels,
    listingHint: listing.listingHint,
    qualityScore: 0,
  };
}

export function parseKrakowTravelListingFallback(
  entry: KrakowTravelListingEntry,
): KrakowTravelImportedItem {
  const dates = parseKarnetDateText(entry.listingHint);
  const category = mapKrakowTravelCategory({
    title: entry.title,
    description: entry.listingHint,
    travelLabels: entry.travelLabels,
    listingHint: entry.listingHint,
  });

  return {
    title: entry.title,
    sourceUrl: entry.sourceUrl,
    sourceName: KRAKOW_TRAVEL_SOURCE_NAME,
    description: entry.listingHint,
    venue: null,
    district: "Kraków",
    address: null,
    startDate: dates.startDate,
    endDate: dates.endDate,
    imageUrl: entry.listingImageUrl,
    category,
    tags: buildKrakowTravelTags({
      title: entry.title,
      description: entry.listingHint,
      travelLabels: entry.travelLabels,
      listingHint: entry.listingHint,
    }),
    price: null,
    rawText: entry.listingHint,
    travelLabels: entry.travelLabels,
    listingHint: entry.listingHint,
    qualityScore: 0,
  };
}
