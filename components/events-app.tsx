"use client";

import { useCallback, useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import { EventModal } from "@/components/event-modal";
import { SiteHeader } from "@/components/site-header";
import { FILTER_CHIPS, getEvents, type Event } from "@/lib/data";
import type { ActiveFilter } from "@/lib/filters";
import { filterEvents } from "@/lib/filters";
import { getTonightEvents } from "@/lib/events";

function filtersEqual(a: ActiveFilter | null, b: ActiveFilter): boolean {
  if (!a) return false;
  return a.type === b.type && a.value === b.value;
}

export function EventsApp() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const allEvents = useMemo(() => getEvents(), []);
  const trendingEvents = useMemo(
    () => allEvents.filter((e) => e.trending),
    [allEvents],
  );
  const tonightEvents = useMemo(
    () => getTonightEvents(undefined, allEvents),
    [allEvents],
  );
  const filteredEvents = useMemo(
    () => filterEvents(allEvents, { search, activeFilter }),
    [allEvents, search, activeFilter],
  );

  const handleFilterClick = useCallback((filter: ActiveFilter) => {
    setActiveFilter((current) =>
      filtersEqual(current, filter) ? null : filter,
    );
  }, []);

  const handleSelect = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  const uniqueVenues = new Set(allEvents.map((e) => e.venue)).size;

  return (
    <div className="min-h-full bg-black text-white">
      <SiteHeader onSearchFocus={() => document.getElementById("event-search")?.focus()} />

      <main>
        <section className="relative overflow-hidden px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12 lg:px-8">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[min(100%,520px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(120,120,255,0.14),transparent_70%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              Discover · Tonight & beyond
            </p>
            <h1 className="max-w-[14ch] text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl sm:leading-[1.02] lg:text-7xl">
              What&apos;s on in{" "}
              <span className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                Kraków
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
              Curated gigs, clubs, art, and culture — filter, search, and explore.
            </p>

            <label className="relative mt-8 block sm:mt-10 sm:max-w-md">
              <span className="sr-only">Search events</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                <SearchIcon />
              </span>
              <input
                id="event-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, venue, category…"
                className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-10 text-base text-white placeholder:text-white/35 outline-none transition-[border-color,background-color] focus:border-white/25 focus:bg-white/[0.06] sm:text-sm"
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs text-white/50 hover:text-white"
                >
                  Clear
                </button>
              ) : null}
            </label>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-6 sm:max-w-lg">
              <Stat label="Tonight" value={tonightEvents.length} />
              <Stat label="Listed" value={allEvents.length} />
              <Stat label="Venues" value={uniqueVenues} />
            </dl>
          </div>
        </section>

        <section className="sticky top-14 z-40 border-b border-white/[0.06] bg-black/90 px-4 py-3 backdrop-blur-xl sm:top-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {FILTER_CHIPS.map((chip) => {
                const isActive = filtersEqual(activeFilter, chip.filter);
                return (
                  <li key={chip.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFilterClick(chip.filter)}
                      aria-pressed={isActive}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-white bg-white text-black"
                          : "border-white/[0.08] bg-white/[0.03] text-white/85 hover:border-white/15 hover:bg-white/[0.06]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {trendingEvents.length > 0 && !search && !activeFilter ? (
          <section className="mt-8 px-4 sm:px-6 lg:px-8" aria-labelledby="trending-heading">
            <div className="mx-auto max-w-6xl">
              <h2
                id="trending-heading"
                className="mb-4 text-lg font-semibold tracking-tight text-white sm:text-xl"
              >
                Trending
              </h2>
              <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
                {trendingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="featured"
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8 px-4 pb-24 sm:mt-10 sm:px-6 sm:pb-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {activeFilter || search ? "Results" : "All events"}
                </h2>
                <p className="mt-0.5 text-sm text-white/45">
                  {filteredEvents.length}{" "}
                  {filteredEvents.length === 1 ? "event" : "events"}
                </p>
              </div>
              {(activeFilter || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter(null);
                    setSearch("");
                  }}
                  className="shrink-0 text-xs font-medium text-white/50 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>

            {filteredEvents.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <li key={event.id}>
                    <EventCard
                      event={event}
                      variant="grid"
                      onSelect={handleSelect}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-12 text-center text-sm text-white/45">
                No events match your search. Try another filter or clear the
                search.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} kraków.events — for discovery only
          </p>
          <p className="text-xs text-white/35">22 events · no database yet</p>
        </div>
      </footer>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </dd>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.5 16.5" />
    </svg>
  );
}
