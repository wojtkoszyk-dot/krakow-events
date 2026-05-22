-- Bilingual descriptions for imports and published events.

alter table public.event_candidates
  add column if not exists description_pl text,
  add column if not exists description_en text;

alter table public.events
  add column if not exists description_pl text,
  add column if not exists description_en text;

update public.event_candidates
set description_pl = coalesce(description_pl, nullif(trim(description), ''))
where description_pl is null;

update public.events
set description_pl = coalesce(description_pl, nullif(trim(description), ''))
where description_pl is null;
