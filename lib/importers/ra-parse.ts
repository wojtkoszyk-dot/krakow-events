import {
  buildRaTags,
  inferRaDistrict,
  mapRaCategory,
} from "@/lib/importers/ra-categories";
import {
  resolveRaEventUrl,
  type RaGraphqlEventDetail,
  type RaGraphqlEventSummary,
} from "@/lib/importers/ra-graphql";
import {
  RA_SOURCE_NAME,
  type RaImportedItem,
  type RaListingEntry,
} from "@/lib/importers/ra-types";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function isoToDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

export function isoToTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  return `${match[1]}:${match[2]}`;
}

function pickFlyerImage(
  images: RaGraphqlEventSummary["images"],
  flyerFront?: string | null,
): string | null {
  const fromList =
    images?.find((img) => img.type === "FLYERFRONT")?.filename ??
    images?.[0]?.filename ??
    null;
  return fromList ?? flyerFront ?? null;
}

function parsePrice(
  cost: string | null | undefined,
  isTicketed: boolean | null | undefined,
  content: string | null | undefined,
): string | null {
  const trimmed = cost?.trim();
  if (trimmed) return trimmed;

  const tax = content?.match(/tax\s*:\s*([^\n.]+)/i);
  if (tax) return normalizeText(tax[1]);

  if (isTicketed) return "Tickets on RA";
  if (/\bfree\b/i.test(content ?? "")) return "Free";
  return null;
}

function buildDescription(
  detail: RaGraphqlEventDetail | null,
  summary: RaGraphqlEventSummary | null,
  artists: string[],
  genres: string[],
): string {
  const parts: string[] = [];

  const blurb = detail?.pick?.blurb?.trim();
  if (blurb) parts.push(blurb);

  const content = detail?.content?.trim();
  if (content) parts.push(content);

  if (artists.length > 0) {
    parts.push(`Line-up: ${artists.join(", ")}`);
  }
  if (genres.length > 0) {
    parts.push(`Genres: ${genres.join(", ")}`);
  }

  if (parts.length > 0) {
    return parts.join("\n\n").slice(0, 2500);
  }

  const title = summary?.title ?? detail?.title ?? "";
  return title ? `${title} — listed on Resident Advisor.` : "";
}

export function listingRowToEntry(row: {
  listingDate: string | null;
  event: RaGraphqlEventSummary | null;
}): RaListingEntry | null {
  const event = row.event;
  if (!event?.id || !event.title) return null;

  return {
    raEventId: event.id,
    sourceUrl: resolveRaEventUrl(event.contentUrl, event.id),
    title: normalizeText(event.title),
    listingDate: row.listingDate,
  };
}

export function parseRaImportedItem(
  entry: RaListingEntry,
  summary: RaGraphqlEventSummary | null,
  detail: RaGraphqlEventDetail | null,
): RaImportedItem | null {
  const event = detail ?? summary;
  if (!event?.title) return null;

  const title = normalizeText(event.title);
  const artists = (detail?.artists ?? summary?.artists ?? [])
    .map((a) => normalizeText(a.name))
    .filter(Boolean);
  const genres = (detail?.genres ?? summary?.genres ?? [])
    .map((g) => normalizeText(g.name))
    .filter(Boolean);

  const venueName = normalizeText(
    detail?.venue?.name ?? summary?.venue?.name ?? "",
  );
  const venue = venueName || null;
  const district = inferRaDistrict(
    venue,
    detail?.venue?.area?.name ?? null,
  );

  const startDate =
    isoToDate(detail?.startTime ?? summary?.startTime) ??
    isoToDate(detail?.date ?? summary?.date) ??
    isoToDate(entry.listingDate);
  const endDate = isoToDate(detail?.endTime ?? summary?.endTime);
  const time = isoToTime(detail?.startTime ?? summary?.startTime);

  const description = buildDescription(detail, summary, artists, genres);
  const category = mapRaCategory(genres, title);
  const tags = buildRaTags(genres, artists, title);
  const imageUrl = pickFlyerImage(
    detail?.images ?? summary?.images ?? null,
    null,
  );
  const price = parsePrice(
    detail?.cost,
    detail?.isTicketed ?? summary?.isTicketed,
    detail?.content,
  );

  const rawText = [
    title,
    venue,
    district,
    startDate,
    time,
    ...artists,
    ...genres,
    description.slice(0, 400),
  ]
    .filter(Boolean)
    .join(" | ");

  const ticketUrl = entry.sourceUrl;

  const item: RaImportedItem = {
    title,
    sourceUrl: ticketUrl,
    sourceName: RA_SOURCE_NAME,
    ticketUrl,
    description,
    venue,
    district,
    address: null,
    startDate,
    endDate: endDate && endDate !== startDate ? endDate : null,
    time,
    imageUrl,
    category,
    tags,
    price,
    rawText,
    artists,
    genres,
    raEventId: entry.raEventId,
    qualityScore: 0,
  };

  return item;
}
