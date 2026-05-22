import type { load } from "cheerio";

export type KarnetParsedVenue = {
  venue: string;
  address: string | null;
  district: string;
  source: string;
};

/** Known venues → Kraków district (lowercase keys). */
const VENUE_DISTRICT_MAP: Record<string, string> = {
  "klub re": "Kazimierz",
  "klub spotkań poczta główna": "Stare Miasto",
  "poczta główna": "Stare Miasto",
  betel: "Stare Miasto",
  "pałac potockich": "Stare Miasto",
  "pałac krzysztofory": "Stare Miasto",
  "bunkier sztuki": "Stare Miasto",
  "dom jana matejki": "Stare Miasto",
  "forum horyzonty": "Grzegórzki",
  "ice kraków": "Grzegórzki",
  "tauron arena": "Grzegórzki",
  "muzeum inżynierii i techniki": "Kazimierz",
  "krakowska huta szkła": "Zabłocie",
  "arteteka": "Stare Miasto",
  "kopalnia soli": "Wieliczka",
  "wieliczka": "Wieliczka",
};

const STREET_DISTRICT_RULES: Array<{ pattern: RegExp; district: string }> = [
  { pattern: /rynek\s+główny|floriańsk|szczepańsk|św\.?\s*jana/i, district: "Stare Miasto" },
  { pattern: /św\.?\s*krzyż|plac\s+nowy|józefa/i, district: "Kazimierz" },
  { pattern: /konopnickiej|pilsudskiego|grzegórzeck/i, district: "Grzegórzki" },
  { pattern: /zabłoci|lipowa\s*3/i, district: "Zabłocie" },
  { pattern: /podgórze|krzemionki/i, district: "Podgórze" },
  { pattern: /nowa\s+huta|os\.|osiedle/i, district: "Nowa Huta" },
  { pattern: /dębnik|rondeau/i, district: "Dębniki" },
  { pattern: /krowodrz|królewska/i, district: "Krowodrza" },
];

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function inferDistrict(venue: string, address: string | null): string {
  const venueKey = fold(venue);
  for (const [key, district] of Object.entries(VENUE_DISTRICT_MAP)) {
    if (venueKey.includes(key)) return district;
  }

  const blob = fold([venue, address].filter(Boolean).join(" "));
  for (const rule of STREET_DISTRICT_RULES) {
    if (rule.pattern.test(blob)) return rule.district;
  }

  return "Kraków";
}

function parseLocationLine(raw: string, source: string): KarnetParsedVenue | null {
  const text = normalizeText(raw);
  if (!text || text.length < 3) return null;

  const commaIdx = text.indexOf(",");
  const venue =
    commaIdx > 0 ? text.slice(0, commaIdx).trim() : text;
  const address = commaIdx > 0 ? text : null;

  return {
    venue: venue || text,
    address,
    district: inferDistrict(venue || text, address),
    source,
  };
}

const ADDRESS_REGEX =
  /([A-ZĄĆĘŁŃÓŚŹŻ0-9][A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9\s.'’\-–—&]+?),\s*((?:ul\.|pl\.|al\.|os\.)\s*[^.,|]+)/g;

/** Collect venue lines from Karnet detail DOM + text fallbacks. */
export function extractKarnetVenues(
  $: ReturnType<typeof load>,
  listingHint?: string,
  description?: string,
): KarnetParsedVenue[] {
  const found: KarnetParsedVenue[] = [];
  const seen = new Set<string>();

  const push = (raw: string, source: string) => {
    const parsed = parseLocationLine(raw, source);
    if (!parsed) return;
    const key = fold(parsed.venue);
    if (seen.has(key)) return;
    seen.add(key);
    found.push(parsed);
  };

  $(".event-place .event-list-element, .event-places .event-list-element").each(
    (_, el) => {
      const name = $(el).attr("data-name")?.trim();
      const street = normalizeText($(el).find(".element-footer .data").text());
      if (name) {
        push(street ? `${name}, ${street}` : name, "event-place");
      }
    },
  );

  $("ul.block-list.with-link > li").each((_, el) => {
    if ($(el).hasClass("extra")) return;
    const text = normalizeText($(el).find(".label span").first().text());
    if (text) push(text, "block-list");
  });

  $("li .icon-location").each((_, el) => {
    const text = normalizeText($(el).closest("li").find(".label span").first().text());
    if (text) push(text, "icon-location");
  });

  if (listingHint) {
    const locationPart = listingHint
      .split("|")
      .map((p) => p.trim())
      .find((p) => /ul\.|pl\.|,\s*\d|kopalnia|klub|muzeum|pałac|teatr/i.test(p));
    if (locationPart) push(locationPart, "listing-hint");
  }

  if (description) {
    for (const match of description.matchAll(ADDRESS_REGEX)) {
      push(`${match[1]}, ${match[2]}`, "description-regex");
    }
  }

  return found;
}

export function pickPrimaryVenue(
  venues: KarnetParsedVenue[],
): KarnetParsedVenue | null {
  if (venues.length === 0) return null;
  const priority = ["event-place", "block-list", "icon-location", "listing-hint"];
  for (const source of priority) {
    const hit = venues.find((v) => v.source === source);
    if (hit) return hit;
  }
  return venues[0];
}
