"use client";

import { useCallback, useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import { EventModal } from "@/components/event-modal";
import { EventScrollSection } from "@/components/event-scroll-section";
import { SiteHeader } from "@/components/site-header";
import { useUserHistory } from "@/hooks/use-user-history";
import { getEvents, type Event } from "@/lib/data";
import {
  CATEGORY_FILTER_CHIPS,
  DATE_FILTER_CHIPS,
  EMPTY_FILTERS,
  filterEvents,
  getResultsTitle,
  hasActiveFilters,
  type CategoryChipId,
  type DateFilter,
  type FilterState,
} from "@/lib/filters";
import {
  getPickedForYou,
  isPersonalizedPicks,
  pickRandomEvent,
} from "@/lib/recommendations";
import {
  getHappeningThisWeekend,
  getHappeningToday,
  getHappeningTomorrow,
  getTrendingInKrakow,
} from "@/lib/sections";

const SCROLL_ROW =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const chipBase =
  "shrink-0 snap-start whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors";
const chipOn = "border-white bg-white text-black";
const chipOff =
  "border-white/[0.08] bg-white/[0.03] text-white/85 hover:border-white/15 hover:bg-white/[0.06]";

export function EventsApp() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [randomEvent, setRandomEvent] = useState<Event | null>(null);

  const {
    history,
    ready,
    trackCategoryClick,
    trackChipClick,
    trackDistrictClick,
    trackViewed,
    trackToggleSaved,
    isSaved,
  } = useUserHistory();

  const allEvents = useMemo(() => getEvents(), []);
  const filtersActive = hasActiveFilters(filters);

  const filteredEvents = useMemo(
    () => filterEvents(allEvents, filters, history),
    [allEvents, filters, history],
  );

  const pickedEvents = useMemo(() => {
    if (!ready || filtersActive) return [];
    return getPickedForYou(allEvents, history);
  }, [allEvents, history, ready, filtersActive]);

  const pickedIsPersonalized = ready && isPersonalizedPicks(history);

  const savedEvents = useMemo(
    () =>
      allEvents.filter((e) => history.savedIds.includes(e.id)),
    [allEvents, history.savedIds],
  );

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

  const resultsTitle = getResultsTitle(filters);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const handleDateChip = useCallback((chip: (typeof DATE_FILTER_CHIPS)[number]) => {
    if ("toggle" in chip) {
      setFilters((f) => ({
        ...f,
        [chip.toggle]: !f[chip.toggle],
      }));
      return;
    }
    setFilters((f) => ({
      ...f,
      date: f.date === chip.value ? null : chip.value,
    }));
  }, []);

  const handleCategoryChip = useCallback(
    (chip: CategoryChipId) => {
      trackChipClick(chip);
      setFilters((f) => ({
        ...f,
        category: chip,
        ...(chip === "free" ? { free: true } : {}),
      }));
    },
    [trackChipClick],
  );

  const handleSelect = useCallback(
    (event: Event) => {
      trackViewed(event.id);
      trackCategoryClick(event.category);
      trackDistrictClick(event.district);
      setSelectedEvent(event);
    },
    [trackViewed, trackCategoryClick, trackDistrictClick],
  );

  const handleRandomPick = useCallback(() => {
    const pick = pickRandomEvent(allEvents);
    if (pick) setRandomEvent(pick);
  }, [allEvents]);

  const toggleSave = useCallback(
    (eventId: string) => trackToggleSaved(eventId),
    [trackToggleSaved],
  );

  return (
    <div className="min-h-full bg-black text-white">
      <SiteHeader
        onSearchFocus={() => document.getElementById("event-search")?.focus()}
      />

      <main className="pb-8">
        {/* Sticky: search + chips only */}
        <section className="sticky top-14 z-40 border-b border-white/[0.06] bg-black/95 backdrop-blur-xl sm:top-16">
          <div className="mx-auto max-w-6xl px-4 pb-3 pt-4 sm:px-6 sm:pt-5 lg:px-8">
            <label className="relative block">
              <span className="sr-only">Search events</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                <SearchIcon />
              </span>
              <input
                id="event-search"
                type="search"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                placeholder="Search events, venues, districts…"
                className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-10 text-base text-white placeholder:text-white/35 outline-none focus:border-white/25 focus:bg-white/[0.06] sm:text-sm"
              />
            </label>

            {/* Date chips */}
            <ul
              className={`-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 snap-x ${SCROLL_ROW}`}
            >
              {DATE_FILTER_CHIPS.map((chip) => {
                const active =
                  "toggle" in chip
                    ? filters[chip.toggle]
                    : filters.date === chip.value;
                return (
                  <li key={chip.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleDateChip(chip)}
                      className={`${chipBase} ${active ? chipOn : chipOff}`}
                    >
                      {chip.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Category chips */}
            <ul
              className={`-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-2 snap-x ${SCROLL_ROW}`}
            >
              {CATEGORY_FILTER_CHIPS.map((chip) => {
                const active = filters.category === chip.id;
                return (
                  <li key={chip.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleCategoryChip(chip.id)}
                      className={`${chipBase} ${active ? chipOn : chipOff}`}
                    >
                      {chip.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={handleRandomPick}
              className="mt-2 w-full rounded-full border border-dashed border-white/15 bg-white/[0.02] py-2.5 text-sm text-white/70 transition-colors hover:border-white/25 hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-5"
            >
              I don&apos;t know where to go
            </button>
          </div>

          {/* Active results — directly under chips */}
          {filtersActive ? (
            <ActiveResults
              title={resultsTitle}
              events={filteredEvents}
              onSelect={handleSelect}
              isSaved={isSaved}
              onToggleSave={toggleSave}
              onReset={resetFilters}
            />
          ) : null}
        </section>

        {/* Discovery mode (no search/filters) */}
        {!filtersActive ? (
          <>
            {pickedEvents.length > 0 ? (
              <section
                className="border-b border-white/[0.06] px-4 py-5 sm:px-6 lg:px-8"
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
                    {pickedIsPersonalized ? "" : " · trending for now"}
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
                        isSaved={isSaved(event.id)}
                        onToggleSave={toggleSave}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {savedEvents.length > 0 ? (
              <EventScrollSection
                id="saved-heading"
                title="Saved"
                subtitle={`${savedEvents.length} saved locally`}
                events={savedEvents}
                onSelect={handleSelect}
                isSaved={isSaved}
                onToggleSave={toggleSave}
              />
            ) : null}

            <EventScrollSection
              id="today-heading"
              title="Happening Today"
              events={todayEvents}
              onSelect={handleSelect}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
            <EventScrollSection
              id="tomorrow-heading"
              title="Tomorrow"
              events={tomorrowEvents}
              onSelect={handleSelect}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
            <EventScrollSection
              id="weekend-heading"
              title="This Weekend"
              events={weekendEvents}
              onSelect={handleSelect}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
            <EventScrollSection
              id="trending-heading"
              title="Trending in Kraków"
              events={trendingEvents}
              onSelect={handleSelect}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />

            <section className="mt-8 px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  All upcoming events
                </h2>
                <p className="mt-0.5 text-xs text-white/45 sm:text-sm">
                  {filteredEvents.length} events
                </p>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event) => (
                    <li key={event.id}>
                      <EventCard
                        event={event}
                        variant="grid"
                        onSelect={handleSelect}
                        isSaved={isSaved(event.id)}
                        onToggleSave={toggleSave}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        ) : (
          /* Filtered: discovery sections moved below results */
          <div className="border-t border-white/[0.06]">
            <p className="px-4 pt-8 text-center text-xs uppercase tracking-[0.2em] text-white/30 sm:px-6">
              Browse more
            </p>
            <EventScrollSection
              id="trending-browse"
              title="Trending in Kraków"
              events={trendingEvents}
              onSelect={handleSelect}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-8 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-6xl text-xs text-white/35">
          © {new Date().getFullYear()} kraków.events
        </p>
      </footer>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isSaved={selectedEvent ? isSaved(selectedEvent.id) : false}
        onToggleSave={
          selectedEvent ? () => toggleSave(selectedEvent.id) : undefined
        }
      />

      <EventModal
        event={randomEvent}
        onClose={() => setRandomEvent(null)}
        isSaved={randomEvent ? isSaved(randomEvent.id) : false}
        onToggleSave={
          randomEvent ? () => toggleSave(randomEvent.id) : undefined
        }
      />
    </div>
  );
}

function ActiveResults({
  title,
  events,
  onSelect,
  isSaved,
  onToggleSave,
  onReset,
}: {
  title: string;
  events: Event[];
  onSelect: (event: Event) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onReset: () => void;
}) {
  return (
    <section
      className="border-t border-white/[0.08] bg-black px-4 py-4 sm:px-6 lg:px-8"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-white/45">
              {events.length} {events.length === 1 ? "event" : "events"}
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:border-white/20 hover:text-white"
          >
            Clear filters
          </button>
        </div>

        {events.length > 0 ? (
          <>
            <ul
              className={`-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:hidden ${SCROLL_ROW}`}
            >
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="featured"
                  onSelect={onSelect}
                  isSaved={isSaved(event.id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </ul>
            <ul className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <li key={event.id}>
                  <EventCard
                    event={event}
                    variant="grid"
                    onSelect={onSelect}
                    isSaved={isSaved(event.id)}
                    onToggleSave={onToggleSave}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-10 text-center text-sm text-white/45">
            No events match. Try clearing filters or another chip.
          </p>
        )}
      </div>
    </section>
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
