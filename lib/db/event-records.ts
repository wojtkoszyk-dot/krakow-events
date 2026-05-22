/** `public.event_candidates` row (Supabase). */
export type EventCandidateDbRow = {
  id: string;
  title: string;
  description: string | null;
  description_pl: string | null;
  description_en: string | null;
  category: string;
  tags: string[] | null;
  venue: string | null;
  district: string | null;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
  price: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  status: string;
  quality_score: number;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

/** `public.events` row (Supabase) — publishable fields. */
export type EventDbRow = {
  id: string;
  title: string;
  description: string | null;
  description_pl: string | null;
  description_en: string | null;
  category: string;
  tags: string[] | null;
  venue: string | null;
  district: string | null;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
  price: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
};
