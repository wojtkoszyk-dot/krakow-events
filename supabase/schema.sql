-- Run in Supabase SQL editor. RLS optional until auth is added.

create extension if not exists "pgcrypto";

create type event_candidate_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_on date not null,
  ends_on date,
  time text not null,
  venue text not null,
  district text not null,
  category text not null,
  tags text[] not null default '{}',
  price text not null,
  description text not null default '',
  description_pl text,
  description_en text,
  image_url text not null default '',
  source_name text,
  source_url text,
  trending boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_candidates (
  id uuid primary key default gen_random_uuid(),
  status event_candidate_status not null default 'pending',
  title text not null,
  starts_on date not null,
  ends_on date,
  time text not null,
  venue text not null,
  district text not null,
  category text not null,
  tags text[] not null default '{}',
  price text not null,
  description text not null default '',
  description_pl text,
  description_en text,
  image_url text not null default '',
  trending boolean not null default false,
  source_url text,
  source_name text,
  raw_data jsonb,
  quality_score integer not null default 50,
  event_id uuid references public.events (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz
);

create table if not exists public.event_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_starts_on_idx on public.events (starts_on);
create index if not exists event_candidates_status_idx on public.event_candidates (status);
create index if not exists event_candidates_title_source_url_idx
  on public.event_candidates (title, source_url);
create index if not exists event_sources_enabled_idx on public.event_sources (enabled);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists event_candidates_set_updated_at on public.event_candidates;
create trigger event_candidates_set_updated_at
before update on public.event_candidates
for each row execute function public.set_updated_at();

drop trigger if exists event_sources_set_updated_at on public.event_sources;
create trigger event_sources_set_updated_at
before update on public.event_sources
for each row execute function public.set_updated_at();
