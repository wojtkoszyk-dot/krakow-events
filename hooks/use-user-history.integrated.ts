"use client";

import { useCallback, useEffect, useState } from "react";
import type { EventCategory } from "@/lib/taxonomy";
import type { CategoryFilterId } from "@/lib/taxonomy";
import {
  loadUserHistory,
  recordCategoryClick,
  recordFilterClick,
  recordDistrictClick,
  recordViewed,
  toggleSaved,
  type UserHistory,
} from "@/lib/user-history";

export function useUserHistory() {
  const [history, setHistory] = useState<UserHistory>({
    categoryClicks: {},
    filterClicks: {},
    districtClicks: {},
    viewedIds: [],
    savedIds: [],
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHistory(loadUserHistory());
    setReady(true);
  }, []);

  const trackCategoryClick = useCallback((category: EventCategory) => {
    setHistory((prev) => recordCategoryClick(prev, category));
  }, []);

  const trackFilterClick = useCallback((category: CategoryFilterId) => {
    setHistory((prev) => recordFilterClick(prev, category));
  }, []);

  const trackDistrictClick = useCallback((district: string) => {
    setHistory((prev) => recordDistrictClick(prev, district));
  }, []);

  const trackViewed = useCallback((eventId: string) => {
    setHistory((prev) => recordViewed(prev, eventId));
  }, []);

  const trackToggleSaved = useCallback((eventId: string) => {
    setHistory((prev) => toggleSaved(prev, eventId));
  }, []);

  const isSaved = useCallback(
    (eventId: string) => history.savedIds.includes(eventId),
    [history.savedIds],
  );

  return {
    history,
    ready,
    trackCategoryClick,
    trackFilterClick,
    trackDistrictClick,
    trackViewed,
    trackToggleSaved,
    isSaved,
  };
}
