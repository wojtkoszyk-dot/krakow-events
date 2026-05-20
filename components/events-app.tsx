"use client";

import { useCallback, useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import { EventModal } from "@/components/event-modal";
import { EventScrollSection } from "@/components/event-scroll-section";
import { SiteHeader } from "@/components/site-header";
import { useUserHistory } from "@/hooks/use-user-history";
import { getEvents, type Event } from "@/lib/data";
import {
  filterEvents,
  filtersEqual,
  QUICK_FILTER_CHIPS,
  type ActiveFilter,
} from "@/lib/filters";
import {
  getPickedForYou,
  isPersonalizedPicks,
} from "@/lib/recommendations";
import {
  getHappeningThisWeekend,
  getHappeningToday,
  getHappeningTomorrow,
  getTrendingInKrakow,
} from "@/lib/sections";

const SCROLL_ROW = "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function EventsApp() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const {
    history,
    ready,
    trackCategoryClick,
    trackDistrictClick,
    trackViewed,
    trackToggleSaved,
    isSaved,
  } = useUserHistory();

  const allEvents = useMemo(() => getEvents(), []);

  const pickedEvents = useMemo(() => {
    if (!ready) return [];
    return getPickedForYou(allEvents, history);
  }, [allEvents, history, ready]);

  const pickedIsPersonalized = ready && isPersonalizedPicks(history);

  const todayEvents = useMemo(() => getHappeningToday(allEvents), [allEvents]);
  const tomorrowEvents = useMemo(
    () => getHappeningTomorrow(allEvents),
    [allEvents],
  );
  const weekendEvents = useMemo(
    () => getHappeningThisWeekend(allEvents),
    [allEvents],
  );
  const trendingEvents = useMemo(
    () => getTrendingInKrakow(allEvents),
    [allEvents],
  );

  const filteredEvents = useMemo(
    () =>
      filterEvents(allEvents, {
        search,
        activeFilter,
        history,
      }),
    [allEvents, search, activeFilter, history],
  );

  const showDiscoverySections = !search.trim();

  const handleFilterClick = useCallback((filter: ActiveFilter) => {
    setActiveFilter((current) =>
      filtersEqual(current, filter) ? null : filter,
    );
  }, []);

  const handleSelect = useCallback(
    (event: Event) => {
      trackViewed(event.id);
      trackCategoryClick(event.category);
      trackDistrictClick(event.district);
      setSelectedEvent(event);
    },
    [trackViewed, trackCategoryClick, trackDistrictClick],
  );

  return (
    <div className="min-h-full bg-black text-white">
      <SiteHeader
        onSearchFocus={() => document.getElementById("event-search")?.focus()}
      />

      <main className="pb-8">
        {/* 1. Search + 2. Quick filters — sticky so discovery stays one thumb-reach away */}
        <section className="sticky top-14 z-40 border-b border-white/[0.06] bg-black/95 px-4 pb-3 pt-4 backdrop-blur-xl sm:top-16 sm:px-6 sm:pt-5 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              Kraków events
            </p>

            <label className="relative block">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white"
                >
                  Clear
                </button>
              ) : null}
            </label>

            <ul
              className={`-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 snap-x ${SCROLL_ROW}`}
            >
              {QUICK_FILTER_CHIPS.map((chip) => {
                const isActive = filtersEqual(activeFilter, chip.filter);
                return (
                  <li key={chip.id} className="shrink-0 snap-start">
                    <button
                      type="button"
                      onClick={() => handleFilterClick(chip.filter)}
                      aria-pressed={isActive}
                      className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
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

        {showDiscoverySections ? (
          <>
            {/* 3. Picked for you */}
            {pickedEvents.length > 0 ? (
              <section
                className="mt-5 px-4 sm:px-6 lg:px-8"
                aria-labelledby="picked-heading"
              >
                <div className="mx-auto max-w-6xl">
                  <h2
                    id="picked-heading"
                    className="text-base font-semibold tracking-tight text-white sm:text-lg"
                  >
                    Picked for you
                  </h2>
                  <p className="mt-1 text-xs text-white/45">
                    Based on what you view and save
                    {pickedIsPersonalized ? "" : " · popular picks for now"}
                  </p>
                  <div
                    className={`-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory ${SCROLL_ROW}`}
                  >
                    {pickedEvents.map((event) => (
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

            {/* 4. Smart date sections */}
            <EventScrollSection
              id="today-heading"
              title="Happening Today"
              events={todayEvents}
              onSelect={handleSelect}
            />
            <EventScrollSection
              id="tomorrow-heading"
              title="Tomorrow"
              events={tomorrowEvents}
              onSelect={handleSelect}
            />
            <EventScrollSection
              id="weekend-heading"
              title="This Weekend"
              events={weekendEvents}
              onSelect={handleSelect}
            />
            <EventScrollSection
              id="trending-heading"
              title="Trending in Kraków"
              events={trendingEvents}
              onSelect={handleSelect}
            />
          </>
        ) : null}

        {/* 5. Full list — respects search + quick filters */}
        <section className="mt-8 px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  {search.trim()
                    ? "Search results"
                    : activeFilter
                      ? "Filtered events"
                      : "All upcoming events"}
                </h2>
                <p className="mt-0.5 text-xs text-white/45 sm:text-sm">
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
                No upcoming events match. Try another filter or clear your
                search.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} kraków.events — for discovery only
          </p>
        </div>
      </footer>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isSaved={selectedEvent ? isSaved(selectedEvent.id) : false}
        onToggleSave={
          selectedEvent
            ? () => trackToggleSaved(selectedEvent.id)
            : undefined
        }
      />
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
