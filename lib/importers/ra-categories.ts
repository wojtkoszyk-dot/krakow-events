const GENRE_TAG_MAP: Record<string, string[]> = {
  Techno: ["techno", "techno (muzyka)", "electronic", "elektronika", "dj", "club", "klub", "rave"],
  House: ["house", "electronic", "dj", "club", "dance", "taniec"],
  Trance: ["trance", "electronic", "dj", "club", "rave"],
  Breakbeat: ["breakbeat", "electronic", "dj"],
  Acid: ["acid", "techno", "electronic", "rave"],
  Dubstep: ["dubstep", "bass", "electronic", "club"],
  Bass: ["bass", "electronic", "club", "dj"],
  Electronica: ["electronica", "electronic", "live set", "live"],
  Disco: ["disco", "house", "dance", "club"],
  "Tech House": ["tech house", "house", "techno", "club", "dj"],
  "Progressive House": ["progressive house", "house", "electronic"],
  "Drum & bass": ["drum and bass", "dnb", "bass", "electronic", "rave"],
  Reggaeton: ["reggaeton", "latin", "club", "dance"],
  "Latin Bass": ["latin bass", "bass", "club", "dance"],
};

const MUSIC_HINTS =
  /\b(live set|live music|live act|concert|orchestra|philharmonic|nospr|festival stage)\b/i;

const NIGHTLIFE_HINTS =
  /\b(techno|house|trance|club|warehouse|rave|afterparty|b2b|all night|open air|dj)\b/i;

function fold(text: string): string {
  return text.toLowerCase();
}

/** Published category labels (match Karnet / moderation). */
export function mapRaCategory(genres: string[], title: string): string {
  const haystack = fold([title, ...genres].join(" "));
  if (MUSIC_HINTS.test(haystack) && !NIGHTLIFE_HINTS.test(haystack)) {
    return "Music";
  }
  if (genres.some((g) => /jazz|classical|folk|indie/i.test(g))) {
    return "Music";
  }
  return "Nightlife";
}

export function buildRaTags(
  genres: string[],
  artists: string[],
  title: string,
): string[] {
  const tags = new Set<string>(["resident advisor", "ra"]);

  for (const genre of genres) {
    const mapped = GENRE_TAG_MAP[genre];
    if (mapped) {
      mapped.forEach((t) => tags.add(t));
    } else if (genre.trim()) {
      tags.add(fold(genre));
    }
  }

  if (NIGHTLIFE_HINTS.test(fold(title))) {
    ["nightlife", "club", "dj", "electronic"].forEach((t) => tags.add(t));
  }

  for (const artist of artists) {
    const name = artist.trim();
    if (name.length >= 2) tags.add(name);
  }

  if (tags.size <= 2) {
    ["electronic", "dj", "club", "dance"].forEach((t) => tags.add(t));
  }

  return [...tags].slice(0, 24);
}

const VENUE_DISTRICT: Record<string, string> = {
  prozak: "Kazimierz",
  "stk 47": "Podgórze",
  szpitalna: "Kazimierz",
  "forum horyzonty": "Grzegórzki",
  "noce krk": "Kazimierz",
};

export function inferRaDistrict(
  venueName: string | null,
  areaName: string | null,
): string {
  if (areaName?.trim()) {
    return areaName.trim() === "Krakow" ? "Kraków" : areaName.trim();
  }
  if (!venueName) return "Kraków";
  const key = fold(venueName);
  for (const [needle, district] of Object.entries(VENUE_DISTRICT)) {
    if (key.includes(needle)) return district;
  }
  return "Kraków";
}
