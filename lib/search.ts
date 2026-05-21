import type { Event } from "@/lib/data";
import type { EventCategory } from "@/lib/taxonomy";

/**
 * Synonym groups for multilingual search (EN + PL).
 * If the query matches any term in a group, all terms in that group are used.
 */
const SYNONYM_GROUPS: string[][] = [
  [
    "muzyka",
    "music",
    "concert",
    "concerts",
    "koncert",
    "koncerty",
    "live music",
    "muzyka na żywo",
  ],
  ["techno", "rave", "electronic", "elektronika", "klub", "club"],
  ["jedzenie", "food", "restaurant", "restauracja", "dining"],
  [
    "food & drink",
    "food-drink",
    "drink",
    "drinks",
    "cocktails",
    "koktajle",
    "beer",
    "piwo",
    "wine",
    "wino",
  ],
  ["nightlife", "nocne", "impreza", "party", "klub", "club", "disco"],
  [
    "culture",
    "kultura",
    "museum",
    "muzeum",
    "exhibition",
    "wystawa",
    "galeria",
    "gallery",
    "art",
    "sztuka",
  ],
  ["comedy", "komedia", "stand-up", "standup", "kabaret", "improv"],
  ["outdoor", "na zewnątrz", "open air", "park", "plener"],
  ["jazz", "indie", "dj", "live", "dance", "taniec"],
  ["free", "darmowe", "bezpłatne", "gratis"],
  ["market", "targ", "bazaar", "bazar"],
  ["student", "studencki", "students"],
  ["family", "rodzina", "rodzinne", "kids", "dzieci"],
  ["sports", "sport", "fitness", "bieg"],
  ["community", "społeczność", "lokalne", "local"],
];

/** Category labels in both languages — always indexed for search. */
const CATEGORY_SEARCH_LABELS: Record<EventCategory, { en: string; pl: string }> = {
  music: { en: "music", pl: "muzyka" },
  nightlife: { en: "nightlife", pl: "nightlife imprezy klub" },
  culture: { en: "culture museum exhibition art", pl: "kultura muzeum wystawa sztuka" },
  comedy: { en: "comedy stand-up", pl: "komedia stand-up kabaret" },
  "food-drink": {
    en: "food drink restaurant cocktails beer",
    pl: "jedzenie restauracja koktajle piwo",
  },
  outdoor: { en: "outdoor open air park", pl: "na zewnątrz plener park" },
  community: { en: "community local", pl: "społeczność lokalne" },
  sports: { en: "sports sport", pl: "sport" },
  family: { en: "family kids", pl: "rodzina dzieci" },
  other: { en: "other", pl: "inne" },
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Expand query with synonym groups (lightweight, no backend). */
export function expandSearchTerms(query: string): string[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const terms = new Set<string>([q]);
  const words = q.split(/\s+/).filter(Boolean);
  words.forEach((w) => terms.add(w));

  for (const group of SYNONYM_GROUPS) {
    const normalizedGroup = group.map(normalize);
    const hit = normalizedGroup.some(
      (term) =>
        q.includes(term) ||
        term.includes(q) ||
        words.some((w) => term.includes(w) || w.includes(term)),
    );
    if (hit) normalizedGroup.forEach((term) => terms.add(term));
  }

  return [...terms];
}

/** Searchable text for one event (both languages for categories). */
export function buildEventSearchHaystack(event: Event): string {
  const labels = CATEGORY_SEARCH_LABELS[event.category];
  return normalize(
    [
      event.title,
      event.venue,
      event.district,
      event.description,
      event.category,
      ...event.tags,
      labels.en,
      labels.pl,
    ].join(" "),
  );
}

export function matchesSearch(event: Event, query: string): boolean {
  const q = query.trim();
  if (!q) return true;

  const haystack = buildEventSearchHaystack(event);
  const terms = expandSearchTerms(q);

  return terms.some((term) => haystack.includes(term));
}
