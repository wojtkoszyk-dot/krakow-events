/**
 * Offline PL→EN translation for import pipelines only (no external APIs).
 * Protects venue names, titles, and quoted brand/artist spans from replacement.
 */

const PLACEHOLDER_OPEN = "\uE000";
const PLACEHOLDER_CLOSE = "\uE001";

export type ImportTranslationContext = {
  /** Branded event name — never translated when present in copy. */
  title: string;
  venue?: string | null;
  /** Optional extra protected strings (e.g. artist names from tags). */
  protectTerms?: string[];
};

/** Longest-first phrase replacements (Polish → natural concise English). */
const PHRASE_REPLACEMENTS: ReadonlyArray<[string, string]> = [
  ["wstęp wolny", "free admission"],
  ["darmowy wstęp", "free admission"],
  ["bezpłatny wstęp", "free admission"],
  ["wolny wstęp", "free admission"],
  ["bilety dostępne", "tickets available"],
  ["kup bilet", "buy tickets"],
  ["godziny otwarcia", "opening hours"],
  ["wydarzenie plenerowe", "outdoor event"],
  ["na żywo", "live"],
  ["muzyka na żywo", "live music"],
  ["wystawa czasowa", "temporary exhibition"],
  ["wystawa stała", "permanent exhibition"],
  ["spektakl teatralny", "theatre performance"],
  ["festiwal muzyczny", "music festival"],
  ["koncert symfoniczny", "symphony concert"],
  ["informacja pochodzi od organizatorów", "info from the organisers"],
  ["rezerwacja zalecana", "booking recommended"],
  ["rezerwacja wymagana", "booking required"],
  ["centrum miasta", "city centre"],
  ["dla dzieci", "for children"],
  ["dla rodzin", "for families"],
  ["dla seniorów", "for seniors"],
  ["wraz z", "along with"],
  ["we współpracy z", "in partnership with"],
  ["godz.", "h"],
  ["ul.", "st."],
];

const WORD_REPLACEMENTS: ReadonlyArray<[string, string]> = [
  ["wydarzenie", "event"],
  ["wydarzenia", "events"],
  ["festiwal", "festival"],
  ["festiwalu", "festival"],
  ["koncert", "concert"],
  ["koncertu", "concert"],
  ["wystawa", "exhibition"],
  ["wystawy", "exhibition"],
  ["muzeum", "museum"],
  ["galeria", "gallery"],
  ["teatr", "theatre"],
  ["spektakl", "performance"],
  ["bilet", "ticket"],
  ["bilety", "tickets"],
  ["bezpłatnie", "free"],
  ["darmowy", "free"],
  ["darmowe", "free"],
  ["organizator", "organiser"],
  ["organizatorów", "organisers"],
  ["program", "programme"],
  ["godzina", "hour"],
  ["godziny", "hours"],
  ["sobota", "Saturday"],
  ["niedziela", "Sunday"],
  ["piątek", "Friday"],
  ["czwartek", "Thursday"],
  ["środa", "Wednesday"],
  ["wtorek", "Tuesday"],
  ["poniedziałek", "Monday"],
  ["czerwca", "June"],
  ["lipca", "July"],
  ["maja", "May"],
  ["kwietnia", "April"],
  ["marca", "March"],
  ["lutego", "February"],
  ["stycznia", "January"],
  ["sierpnia", "August"],
  ["września", "September"],
  ["października", "October"],
  ["listopada", "November"],
  ["grudnia", "December"],
  ["plener", "outdoor"],
  ["widowisko", "show"],
  ["parada", "parade"],
  ["pochód", "parade"],
  ["wstęp", "admission"],
  ["będzie", "will be"],
  ["będą", "will be"],
  ["można", "you can"],
  ["tysiące", "thousands"],
  ["widzów", "visitors"],
  ["mieszkańców", "residents"],
  ["turystów", "tourists"],
  ["miasta", "city"],
  ["miasto", "city"],
  ["oprawa", "production"],
  ["świetlna", "lighting"],
  ["wizualna", "visual"],
  ["muzyka", "music"],
  ["muzyką", "music"],
  ["partnerzy", "partners"],
  ["partnerów", "partners"],
  ["strefa", "zone"],
  ["strefie", "zone"],
  ["konkursy", "contests"],
  ["animacje", "activities"],
  ["atrakcje", "attractions"],
  ["zabawy", "games"],
  ["gry", "games"],
  ["rodzinny", "family"],
  ["rodzinna", "family"],
  ["wieczorne", "evening"],
  ["wieczorny", "evening"],
  ["kulminacją", "highlight"],
  ["prezentowane", "featured"],
  ["konstrukcje", "installations"],
  ["artystów", "artists"],
  ["tancerzy", "dancers"],
  ["orkiestr", "orchestras"],
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function looksPolish(text: string): boolean {
  return (
    /[ąćęłńóśźż]/i.test(text) ||
    /\b(wydarzen|festiwal|koncert|bilet|muzeum|wystaw|organizator|bezpłat|darmow|będzie|można)\w*/i.test(
      text,
    )
  );
}

function collectProtectedSpans(
  text: string,
  context: ImportTranslationContext,
): string[] {
  const spans = new Set<string>();

  const add = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length < 2) return;
    if (text.includes(trimmed)) {
      spans.add(trimmed);
    }
  };

  add(context.title);
  add(context.venue);
  for (const term of context.protectTerms ?? []) {
    add(term);
  }

  const quotePatterns = [
    /„([^„"]+)"/g,
    /"([^"]+)"/g,
    /'([^']+)'/g,
  ];
  for (const pattern of quotePatterns) {
    let match: RegExpExecArray | null;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(text)) !== null) {
      const quoted = match[1]?.trim();
      if (quoted && quoted.length >= 2 && quoted.length <= 120) {
        spans.add(match[0]);
        spans.add(quoted);
      }
    }
  }

  return [...spans].sort((a, b) => b.length - a.length);
}

function maskProtectedSpans(
  text: string,
  spans: string[],
): { masked: string; restore: string[] } {
  let masked = text;
  const restore: string[] = [];

  spans.forEach((span, index) => {
    if (!masked.includes(span)) return;
    const token = `${PLACEHOLDER_OPEN}${index}${PLACEHOLDER_CLOSE}`;
    restore[index] = span;
    masked = masked.split(span).join(token);
  });

  return { masked, restore };
}

function unmaskProtectedSpans(text: string, restore: string[]): string {
  let out = text;
  restore.forEach((span, index) => {
    if (!span) return;
    const token = `${PLACEHOLDER_OPEN}${index}${PLACEHOLDER_CLOSE}`;
    out = out.split(token).join(span);
  });
  return out;
}

function applyPhraseAndWordReplacements(text: string): string {
  let out = text;

  const sortedPhrases = [...PHRASE_REPLACEMENTS].sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [pl, en] of sortedPhrases) {
    out = out.replace(new RegExp(escapeRegExp(pl), "gi"), en);
  }

  for (const [pl, en] of WORD_REPLACEMENTS) {
    out = out.replace(
      new RegExp(`\\b${escapeRegExp(pl)}\\b`, "gi"),
      (match) =>
        match[0] === match[0].toUpperCase()
          ? en.charAt(0).toUpperCase() + en.slice(1)
          : en,
    );
  }

  return out
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Core PL→EN pass with protected spans (import-time only). */
export function translateImportDescription(
  polishText: string,
  context: ImportTranslationContext,
): string {
  const source = polishText.trim();
  if (!source) return "";

  if (!looksPolish(source)) {
    return source;
  }

  const spans = collectProtectedSpans(source, context);
  const { masked, restore } = maskProtectedSpans(source, spans);
  const translated = applyPhraseAndWordReplacements(masked);
  return unmaskProtectedSpans(translated, restore);
}

/**
 * Build bilingual descriptions for DB insert at import time.
 * On failure or empty EN result, EN falls back to PL.
 */
export function buildImportDescriptions(
  polishText: string,
  context: ImportTranslationContext,
): { descriptionPl: string; descriptionEn: string } {
  const descriptionPl = polishText.trim();
  if (!descriptionPl) {
    return { descriptionPl: "", descriptionEn: "" };
  }

  if (!looksPolish(descriptionPl)) {
    return { descriptionPl, descriptionEn: descriptionPl };
  }

  try {
    const descriptionEn = translateImportDescription(descriptionPl, context);
    if (!descriptionEn.trim()) {
      return { descriptionPl, descriptionEn: descriptionPl };
    }
    return { descriptionPl, descriptionEn };
  } catch {
    return { descriptionPl, descriptionEn: descriptionPl };
  }
}
