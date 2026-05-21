-- Run in Supabase SQL editor if event_candidates already exists.

alter table public.event_candidates
  add column if not exists source_name text,
  add column if not exists raw_data jsonb,
  add column if not exists quality_score integer not null default 50;

create index if not exists event_candidates_title_source_url_idx
  on public.event_candidates (title, source_url);
