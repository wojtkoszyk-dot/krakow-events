-- Run in Supabase SQL editor if `events` already exists without source columns.

alter table public.events
  add column if not exists source_name text,
  add column if not exists source_url text;
