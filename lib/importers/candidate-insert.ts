/** Columns accepted by live `public.event_candidates` (PostgREST). */
export type EventCandidateInsert = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  venue: string | null;
  district: string | null;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
  price: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string;
  status: "pending";
  quality_score: number;
  raw_data: Record<string, unknown>;
};

export function mergeTags(
  tags: string[],
  extra: string[] = [],
): string[] {
  const merged = new Set<string>();
  for (const value of [...tags, ...extra]) {
    const tag = value.trim();
    if (tag.length > 0) merged.add(tag);
  }
  return [...merged].slice(0, 24);
}

/** Prefer date-only `start_date`; keep clock time in raw_data when column is `date`. */
export function resolveCandidateStartDate(
  startDate: string | null,
  time: string | null,
): { start_date: string | null; timeInRawData: string | null } {
  if (!startDate?.trim()) {
    return { start_date: null, timeInRawData: time };
  }
  const date = startDate.trim().slice(0, 10);
  return { start_date: date, timeInRawData: time };
}

export function buildEventCandidateInsert(input: {
  title: string;
  description: string;
  category: string;
  tags: string[];
  venue: string | null;
  district: string | null;
  address?: string | null;
  startDate: string | null;
  endDate: string | null;
  price: string | null;
  imageUrl: string | null;
  sourceName: string;
  sourceUrl: string;
  qualityScore: number;
  rawData: Record<string, unknown>;
  time?: string | null;
}): EventCandidateInsert {
  const { start_date, timeInRawData } = resolveCandidateStartDate(
    input.startDate,
    input.time ?? null,
  );

  const raw_data: Record<string, unknown> = {
    ...input.rawData,
  };
  if (timeInRawData) {
    raw_data.time = timeInRawData;
  }

  return {
    title: input.title,
    description: input.description.trim() || String(raw_data.rawText ?? ""),
    category: input.category,
    tags: input.tags,
    venue: input.venue,
    district: input.district,
    address: input.address ?? null,
    start_date,
    end_date: input.endDate,
    price: input.price,
    image_url: input.imageUrl,
    source_name: input.sourceName,
    source_url: input.sourceUrl,
    status: "pending",
    quality_score: input.qualityScore,
    raw_data,
  };
}
