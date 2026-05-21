"use client";

import { useCallback, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { EventModal } from "@/components/event-modal";
import { DateSegmentControl } from "@/components/date-segment-control";
import { SavedPanel } from "@/components/saved-panel";
import { SiteHeader } from "@/components/site-header";
import { SurpriseMeCta } from "@/components/surprise-me-cta";
import { AppLocaleShell, useLocale } from "@/hooks/use-locale";
import { useUserHistory } from "@/hooks/use-user-history.integrated";
import { getEvents, type Event } from "@/lib/data";
import { getCategoryLabel } from "@/lib/i18n/translations";
import {
  CATEGORY_FILTER_IDS,
  DEFAULT_FILTERS,
  filterEvents,
  getFeedHeadingKey,
  hasActiveFilters,
  hasRefinementFilters,
  type CategoryFilterId,
  type CustomDateRange,
  type DatePreset,
  type FilterState,
} from "@/lib/filters";
import { getSavedEvents } from "@/lib/profile";
import {
  getPickedForYou,
  isPersonalizedPicks,
  pickSurpriseEvent,
} from "@/lib/recommendations";

function EventsAppInner() {
  const { locale, t } = useLocale();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [surpriseEvent, setSurpriseEvent] = useState<Event | null>(null);

  const {
    history,
    ready,
    trackCategoryClick,
    trackFilterClick,
    trackDistrictClick,
    trackViewed,
    trackToggleSaved,
    isSaved,
  } = useUserHistory();

  const allEvents = useMemo(() => getEvents(), []);
  const refined = hasRefinementFilters(filters);

  const feedEvents = useMemo(
    () => filterEvents(allEvents, filters),
    [allEvents, filters],
  );

  const pickedEvents = useMemo(() => {
    if (!ready || refined) return [];
    return getPickedForYou(allEvents, history);
  }, [allEvents, history, ready, refined]);

  const pickedIsPersonalized = ready && isPersonalizedPicks(history);

  const savedEvents = useMemo(
    () => getSavedEvents(allEvents, history),
    [allEvents, history.savedIds],
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

  const handleSurprise = useCallback(() => {
    const pick = pickSurpriseEvent(allEvents, history);
    if (pick) {
      trackViewed(pick.id);
      trackCategoryClick(pick.category);
      trackDistrictClick(pick.district);
      setSurpriseEvent(pick);
    }
  }, [
    allEvents,
    history,
    trackViewed,
    trackCategoryClick,
    trackDistrictClick,
  ]);

  const toggleSave = useCallback(
    (eventId: string) => trackToggleSaved(eventId),
    [trackToggleSaved],
  );

  const handleDatePreset = useCallback((preset: DatePreset) => {
    setFilters((f) => ({
      ...f,
      datePreset: preset,
      customRange: preset === "custom" ? f.customRange : null,
    }));
    if (preset !== "custom") setDatePickerOpen(false);
  }, []);

  const handleApplyCustomRange = useCallback((range: CustomDateRange) => {
    setFilters((f) => ({
      ...f,
      datePreset: "custom",
      customRange: range,
    }));
    setDatePickerOpen(false);
  }, []);

  const handleClearCustomRange = useCallback(() => {
    setFilters((f) => ({
      ...f,
      datePreset: "all",
      customRange: null,
    }));
    setDatePickerOpen(false);
  }, []);

  const handleCategoryFilter = useCallback(
    (category: CategoryFilterId) => {
      trackFilterClick(category);
      setFilters((f) => ({
        ...f,
        category: f.category === category ? null : category,
      }));
    },
    [trackFilterClick],
  );

  const clearRefinements = useCallback(() => {
    setFilters((f) => ({
      ...DEFAULT_FILTERS,
      datePreset: f.datePreset,
      customRange: f.customRange,
    }));
    setSearchOpen(false);
  }, []);

  const feedHeading = t(getFeedHeadingKey(filters));
  const eventCountLabel =
    feedEvents.length === 1 ? t("feed.event") : t("feed.events");

  const emptyFeed = useMemo(() => {
    if (filters.search.trim()) {
      return {
        icon: "search" as const,
        title: t("feed.emptySearchTitle"),
        hint: t("feed.emptySearchHint"),
      };
    }
    if (filters.category) {
      return {
        icon: "filter" as const,
        title: t("feed.emptyFilterTitle"),
        hint: t("feed.emptyFilterHint"),
      };
    }
    if (filters.datePreset === "weekend") {
      return {
        icon: "calendar" as const,
        title: t("feed.emptyDateWeekendTitle"),
        hint: t("feed.emptyDateWeekendHint"),
      };
    }
    if (hasActiveFilters(filters) && filters.datePreset !== "all") {
      return {
        icon: "calendar" as const,
        title: t("feed.emptyDateTitle"),
        hint: t("feed.emptyDateHint"),
      };
    }
    return {
      icon: "spark" as const,
      title: t("feed.emptyDefaultTitle"),
      hint: t("feed.emptyDefaultHint"),
    };
  }, [filters, t]);

  return (
    <div className="min-h-full bg-black text-white">
      <SiteHeader
        searchOpen={searchOpen}
        onSearchToggle={() => {
          if (searchOpen) {
            setSearchOpen(false);
            setFilters((f) => ({ ...f, search: "" }));
            return;
          }
          setSearchOpen(true);
          requestAnimationFrame(() =>
            document.getElementById("event-search")?.focus(),
          );
        }}
        onOpenSaved={() => setSavedOpen(true)}
        savedCount={history.savedIds.length}
      />

      <main className={!refined ? "pb-[5.5rem] sm:pb-6" : "pb-5"}>
        <section className="filter-dock sticky top-9 z-40 overflow-visible border-b border-white/[0.05] bg-black/88 backdrop-blur-2xl sm:top-10">
          <div className="mx-auto max-w-6xl space-y-1.5 px-4 pb-2 pt-1.5 sm:px-6 sm:pb-2 sm:pt-2 lg:px-8">
            {searchOpen ? (
              <label className="search-field search-field--open animate-fade-in-up">
                <span className="sr-only">{t("search.label")}</span>
                <span className="search-field-icon">
                  <SearchIcon />
                </span>
                <input
                  id="event-search"
                  type="search"
                  enterKeyHint="search"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  placeholder={t("search.placeholder")}
                  className="search-field-input"
                  autoComplete="off"
                />
                <button
                  type="button"
                  aria-label={t("search.close")}
                  onClick={() => {
                    setFilters((f) => ({ ...f, search: "" }));
                    setSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/38 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <CloseIcon />
                </button>
              </label>
            ) : null}

            <DateSegmentControl
              filters={filters}
              pickerOpen={datePickerOpen}
              onPickerOpenChange={setDatePickerOpen}
              onSelectPreset={handleDatePreset}
              initialRange={filters.customRange}
              onApplyCustomRange={handleApplyCustomRange}
              onClearCustomRange={handleClearCustomRange}
            />

            <ul
              className="hide-scrollbar -mx-4 flex gap-1.5 overflow-x-auto scroll-touch scroll-pl-4 px-4 pb-px"
              aria-label={t("category.filterLabel")}
            >
              {CATEGORY_FILTER_IDS.map((categoryId) => {
                const active = filters.category === categoryId;
                return (
                  <li key={categoryId}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleCategoryFilter(categoryId)}
                      className={`chip ${active ? "chip-active" : ""}`}
                    >
                      {getCategoryLabel(categoryId, locale)}
                    </button>
                  </li>
                );
              })}
            </ul>

            {refined ? (
              <button
                type="button"
                onClick={clearRefinements}
                className="text-[11px] font-medium text-white/38 transition-colors duration-200 hover:text-white/65"
              >
                {t("filters.clearRefinements")}
              </button>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {!refined && ready && pickedEvents.length > 0 ? (
            <section
              className="animate-section-in pt-2.5 sm:pt-3"
              aria-labelledby="picks-heading"
            >
              <div className="flex items-end justify-between gap-2">
                <div>
                  <h2 id="picks-heading" className="section-title section-title-compact">
                    {t("picks.title")}
                  </h2>
                  <p className="mt-0.5 text-[10px] font-medium leading-snug text-white/36">
                    {pickedIsPersonalized
                      ? t("picks.curated")
                      : t("picks.trending")}
                  </p>
                </div>
              </div>
              <div className="scroll-rail -mx-4 mt-2 sm:-mx-6 lg:-mx-8">
                <div className="hide-scrollbar flex gap-2.5 overflow-x-auto scroll-touch scroll-pl-4 px-4 pb-0.5 snap-x snap-proximity sm:gap-3 sm:px-6 lg:px-8">
                  {pickedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      variant="picked"
                      onSelect={handleSelect}
                      isSaved={isSaved(event.id)}
                      onToggleSave={toggleSave}
                    />
                  ))}
                  <div
                    className="w-[calc(1rem-4px)] shrink-0 snap-end sm:w-6"
                    aria-hidden
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section
            className={`animate-section-in pb-3 ${!refined && ready && pickedEvents.length > 0 ? "pt-3.5 sm:pt-4" : "pt-3 sm:pt-3.5"}`}
            aria-labelledby="feed-heading"
          >
            <div className="flex items-baseline justify-between gap-2 border-b border-white/[0.05] pb-2">
              <div>
                <h2 id="feed-heading" className="feed-title">
                  {feedHeading}
                </h2>
                <p className="feed-meta">
                  {feedEvents.length} {eventCountLabel}
                </p>
              </div>
            </div>

            {feedEvents.length > 0 ? (
              <ul className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:gap-2.5">
                {feedEvents.map((event) => (
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
            ) : (
              <div className="mt-3 py-2">
                <EmptyState
                  icon={emptyFeed.icon}
                  title={emptyFeed.title}
                  hint={emptyFeed.hint}
                  action={
                    refined || hasActiveFilters(filters) ? (
                      <button
                        type="button"
                        onClick={clearRefinements}
                        className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/75 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                      >
                        {t("filters.clearRefinements")}
                      </button>
                    ) : undefined
                  }
                />
              </div>
            )}
          </section>
        </div>
      </main>

      {!refined ? <SurpriseMeCta onSurprise={handleSurprise} /> : null}

      <SavedPanel
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        events={savedEvents}
        onSelect={handleSelect}
        isSaved={isSaved}
        onToggleSave={toggleSave}
      />

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isSaved={selectedEvent ? isSaved(selectedEvent.id) : false}
        onToggleSave={
          selectedEvent ? () => toggleSave(selectedEvent.id) : undefined
        }
      />

      <EventModal
        event={surpriseEvent}
        onClose={() => setSurpriseEvent(null)}
        variant="surprise"
        isSaved={surpriseEvent ? isSaved(surpriseEvent.id) : false}
        onToggleSave={
          surpriseEvent ? () => toggleSave(surpriseEvent.id) : undefined
        }
      />
    </div>
  );
}

export function EventsApp() {
  return (
    <AppLocaleShell>
      <EventsAppInner />
    </AppLocaleShell>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.5 16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
