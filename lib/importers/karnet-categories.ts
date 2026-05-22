/** Display labels stored on candidates / events (moderation UI). */
export const KARNET_CATEGORY_LABELS = [
  "Music",
  "Nightlife",
  "Culture",
  "Comedy",
  "Food & Drink",
  "Outdoor",
  "Community",
  "Sports",
  "Family",
  "Other",
] as const;

export type KarnetCategoryLabel = (typeof KARNET_CATEGORY_LABELS)[number];

type KeywordRule = {
  stems: string[];
  tags: string[];
  category: KarnetCategoryLabel;
  weight: number;
};

/** Stem + bilingual tags for search; stems match Polish inflected forms via substring. */
const KEYWORD_RULES: KeywordRule[] = [
  { stems: ["koncert", "concert", "live", "recital"], tags: ["koncert", "concert"], category: "Music", weight: 4 },
  { stems: ["muzyk", "music", "jazz", "rock", "folk", "rap", "hip-hop"], tags: ["muzyka", "music"], category: "Music", weight: 3 },
  { stems: ["festiwal", "festival"], tags: ["festiwal", "festival"], category: "Music", weight: 3 },
  { stems: ["techno", "rave", "house", "electro", "dj ", " dj"], tags: ["techno", "rave"], category: "Nightlife", weight: 4 },
  { stems: ["klub", "club", "night", "afterparty"], tags: ["klub", "club"], category: "Nightlife", weight: 3 },
  { stems: ["wystaw", "exhibit", "galeri", "gallery"], tags: ["wystawa", "exhibition"], category: "Culture", weight: 5 },
  { stems: ["muze", "museum"], tags: ["muzeum", "museum"], category: "Culture", weight: 4 },
  { stems: ["teatr", "theatre", "theater", "spektakl", "performance", "dramat"], tags: ["teatr", "theatre"], category: "Culture", weight: 4 },
  { stems: ["film", "kino", "cinema", "projekcj"], tags: ["film", "cinema"], category: "Culture", weight: 3 },
  { stems: ["literatur", "literature", "czytani", "book"], tags: ["literatura", "literature"], category: "Culture", weight: 3 },
  { stems: ["fotograf", "photograph"], tags: ["fotografia", "photography"], category: "Culture", weight: 3 },
  { stems: ["kultury", "culture", "sztuk", "art "], tags: ["kultura", "culture"], category: "Culture", weight: 2 },
  { stems: ["stand-up", "standup", "komedi", "comedy"], tags: ["stand-up", "comedy"], category: "Comedy", weight: 5 },
  { stems: ["improv", "kabaret"], tags: ["improv", "komedia"], category: "Comedy", weight: 3 },
  { stems: ["jedzen", "food", "degustac", "tasting", "wine", "wino", "beer", "piwo"], tags: ["jedzenie", "food"], category: "Food & Drink", weight: 4 },
  { stems: ["plener", "outdoor", "park", "ogrod", "garden"], tags: ["plener", "outdoor"], category: "Outdoor", weight: 3 },
  { stems: ["warsztat", "workshop", "spotkan", "meetup", "targ", "market"], tags: ["społeczność", "community"], category: "Community", weight: 2 },
  { stems: ["sport", "mecz", "match", "bieg", "run ", "maraton"], tags: ["sport", "sports"], category: "Sports", weight: 4 },
  { stems: ["rodzin", "family", "dziec", "kids", "dzieci"], tags: ["rodzina", "family"], category: "Family", weight: 4 },
];

const KARNET_LABEL_MAP: Record<string, KarnetCategoryLabel> = {
  koncerty: "Music",
  "muzyka rozrywkowa": "Music",
  festiwale: "Music",
  spektakle: "Culture",
  literatura: "Culture",
  film: "Culture",
  wystawy: "Culture",
  "wystawy czasowe": "Culture",
  "w-gminach-metropolii": "Community",
  "w gminach metropolii": "Community",
  inne: "Other",
};

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function includesStem(haystack: string, stem: string): boolean {
  return haystack.includes(fold(stem));
}

export type KarnetInferenceInput = {
  title: string;
  description: string;
  karnetLabels: string[];
  venue?: string | null;
  listingHint?: string | null;
};

function buildHaystack(input: KarnetInferenceInput): string {
  return fold(
    [
      input.title,
      ...input.karnetLabels,
      input.description,
      input.venue ?? "",
      input.listingHint ?? "",
    ].join(" "),
  );
}

export function mapKarnetCategory(input: KarnetInferenceInput): KarnetCategoryLabel {
  const scores = new Map<KarnetCategoryLabel, number>();
  const haystack = buildHaystack(input);

  for (const label of input.karnetLabels) {
    const mapped = KARNET_LABEL_MAP[fold(label)];
    if (mapped) {
      scores.set(mapped, (scores.get(mapped) ?? 0) + 8);
    }
  }

  for (const rule of KEYWORD_RULES) {
    const hit = rule.stems.some((stem) => includesStem(haystack, stem));
    if (hit) {
      scores.set(rule.category, (scores.get(rule.category) ?? 0) + rule.weight);
    }
  }

  let best: KarnetCategoryLabel = "Other";
  let bestScore = 0;
  for (const [category, score] of scores) {
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  return bestScore >= 1 ? best : "Other";
}

/** Bilingual tags from labels, stems, and venue context. */
export function buildKarnetTags(input: KarnetInferenceInput): string[] {
  const tags = new Set<string>();
  const haystack = buildHaystack(input);

  for (const label of input.karnetLabels) {
    const trimmed = label.trim();
    if (trimmed.length > 2) tags.add(trimmed);
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.stems.some((stem) => includesStem(haystack, stem))) {
      for (const tag of rule.tags) {
        tags.add(tag);
      }
    }
  }

  if (tags.size === 0 && input.karnetLabels.length > 0) {
    for (const label of input.karnetLabels) {
      tags.add(label.trim());
    }
  }

  return [...tags].slice(0, 24);
}
