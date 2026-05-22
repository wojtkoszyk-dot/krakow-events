import { load } from "cheerio";
import {
  buildKarnetTags,
  mapKarnetCategory,
  type KarnetInferenceInput,
} from "@/lib/importers/karnet-categories";
import { logKarnetParse } from "@/lib/importers/karnet-debug";
import { parseKarnetDatesFromSources } from "@/lib/importers/karnet-dates";
import {
  extractKarnetVenues,
  pickPrimaryVenue,
} from "@/lib/importers/karnet-venues";
import {
  KARNET_BASE_URL,
  KARNET_SOURCE_NAME,
  type KarnetImportedItem,
} from "@/lib/importers/karnet-types";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function resolveKarnetUrl(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `${KARNET_BASE_URL}${href.startsWith("/") ? href : `/${href}`}`;
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

/** Prefer largest photo variant from Karnet CDN. */
function normalizeKarnetImageUrl(url: string | null): string | null {
  if (!url) return null;
  return url
    .replace(/\/photos\/(\d+)\/s\.jpg/i, "/photos/$1/xl.jpg")
    .replace(/\/photos\/(\d+)\/m\.jpg/i, "/photos/$1/xl.jpg")
    .replace(/\/xxl\.jpg/i, "/xl.jpg");
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

  const best = candidates.find((u) => /\/xl\.jpg|\/xxl\.jpg/i.test(u)) ?? candidates[0];
  return normalizeKarnetImageUrl(best ?? null);
}

function extractDescription($: ReturnType<typeof load>): string {
  const paragraphs: string[] = [];
  $(".article-content > p").each((_, el) => {
    const text = normalizeText($(el).text());
    if (text.length > 30) {
      paragraphs.push(text);
    }
    if (paragraphs.length >= 4) {
      return false;
    }
  });

  if (paragraphs.length > 0) {
    return paragraphs.join("\n\n").slice(0, 2500);
  }

  const meta = $('meta[name="description"]').attr("content");
  return meta ? normalizeText(decodeHtml(meta)) : "";
}

function extractPrice($: ReturnType<typeof load>, corpus: string): string | null {
  const ticketLabel = normalizeText($(".button-orange .label").first().text());
  if (/bilet/i.test(ticketLabel)) {
    const near = corpus.match(/\b(\d+[\d\s.,]*\s*zł|\d+[\d\s.,]*\s*PLN)\b/i);
    if (near) return normalizeText(near[1]);
  }

  const pln = corpus.match(/\b(\d+[\d\s.,]*\s*(?:PLN|zł))\b/i);
  if (pln) return normalizeText(pln[1]);

  if (/\b(wstęp wolny|darmowy wstęp|bezpłatnie|wolny wstęp)\b/i.test(corpus)) {
    return "Free";
  }

  return null;
}

function extractDateMarks($: ReturnType<typeof load>): string[] {
  const marks: string[] = [];
  $(".article-content .mark").each((_, el) => {
    const text = normalizeText($(el).text());
    if (text) marks.push(text);
  });
  return marks;
}

function extractDateTexts($: ReturnType<typeof load>): string[] {
  const texts: string[] = [];
  $("li.event-date .label span").each((_, el) => {
    const text = normalizeText($(el).text());
    if (text) texts.push(text);
  });
  return texts;
}

function extractKarnetLabels($: ReturnType<typeof load>): string[] {
  const labels = new Set<string>();
  const subtitle = normalizeText($(".article-header h4").first().text());
  if (subtitle) labels.add(subtitle);

  $(".breadcrumbs-list a").each((_, el) => {
    const text = normalizeText($(el).text());
    if (
      text &&
      text !== "Start" &&
      text !== "Wydarzenia" &&
      !/^wszystkie$/i.test(text)
    ) {
      labels.add(text);
    }
  });

  const categoryLinks = $('a[href*="/wydarzenia/"]');
  categoryLinks.each((_, el) => {
    const text = normalizeText($(el).text());
    if (text.length > 2 && text.length < 40) {
      labels.add(text);
    }
  });

  return [...labels];
}

/** Parse a Karnet event detail page into a rich import payload. */
export function parseKarnetDetailPage(
  html: string,
  sourceUrl: string,
  listingHint?: string,
): KarnetImportedItem | null {
  const $ = load(html);
  const title = normalizeText($(".article-header h1").first().text());
  if (!title) {
    logKarnetParse("detail:skip", { sourceUrl, reason: "missing title" });
    return null;
  }

  const karnetLabels = extractKarnetLabels($);
  const description = extractDescription($);
  const venueCandidates = extractKarnetVenues($, listingHint, description);
  const primaryVenue = pickPrimaryVenue(venueCandidates);

  const inferenceInput: KarnetInferenceInput = {
    title,
    description,
    karnetLabels,
    venue: primaryVenue?.venue ?? null,
    listingHint: listingHint ?? null,
  };

  const category = mapKarnetCategory(inferenceInput);
  const tags = buildKarnetTags(inferenceInput);

  const dateTexts = extractDateTexts($);
  const marks = extractDateMarks($);
  const dates = parseKarnetDatesFromSources(dateTexts, marks, listingHint);

  const imageUrl = extractImageUrl($);
  const corpus = [title, ...karnetLabels, description, primaryVenue?.venue ?? ""].join(" ");
  const price = extractPrice($, corpus);

  const rawText = [
    karnetLabels.join(" · "),
    dateTexts[0] ?? "",
    primaryVenue ? `${primaryVenue.venue}${primaryVenue.address ? `, ${primaryVenue.address}` : ""}` : "",
    description.slice(0, 280),
  ]
    .filter(Boolean)
    .join(" | ");

  const item: KarnetImportedItem = {
    title,
    sourceUrl,
    sourceName: KARNET_SOURCE_NAME,
    description,
    venue: primaryVenue?.venue ?? null,
    district: primaryVenue?.district ?? "Kraków",
    address: primaryVenue?.address ?? null,
    startDate: dates.startDate,
    endDate: dates.endDate,
    time: dates.time,
    imageUrl,
    category,
    tags,
    price,
    rawText,
    karnetLabels,
    listingHint: listingHint ?? null,
    isRecurring: dates.isRecurring,
    qualityScore: 0,
  };

  logKarnetParse("detail:parsed", {
    sourceUrl,
    title,
    category,
    tags,
    venue: item.venue,
    district: item.district,
    startDate: item.startDate,
    endDate: item.endDate,
    time: item.time,
    imageUrl: item.imageUrl ? "yes" : "no",
    isRecurring: item.isRecurring,
    labelCount: karnetLabels.length,
    venueSources: venueCandidates.map((v) => v.source),
    dateTexts,
    markCount: marks.length,
  });

  return item;
}

/** Shallow parse from listing card when detail fetch fails. */
export function parseKarnetListingFallback(
  title: string,
  sourceUrl: string,
  listingHint: string,
): KarnetImportedItem {
  const dates = parseKarnetDatesFromSources([], [], listingHint);
  const inferenceInput: KarnetInferenceInput = {
    title,
    description: listingHint,
    karnetLabels: listingHint.split("|").map((p) => p.trim()).filter(Boolean),
    listingHint,
  };

  const item: KarnetImportedItem = {
    title,
    sourceUrl,
    sourceName: KARNET_SOURCE_NAME,
    description: listingHint,
    venue: null,
    district: "Kraków",
    address: null,
    startDate: dates.startDate,
    endDate: dates.endDate,
    time: dates.time,
    imageUrl: null,
    category: mapKarnetCategory(inferenceInput),
    tags: buildKarnetTags(inferenceInput),
    price: null,
    rawText: listingHint,
    karnetLabels: inferenceInput.karnetLabels,
    listingHint,
    isRecurring: dates.isRecurring,
    qualityScore: 0,
  };

  logKarnetParse("detail:fallback", {
    sourceUrl,
    title,
    category: item.category,
    tags: item.tags,
    listingHint,
  });

  return item;
}
