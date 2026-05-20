"use client";

import { useCallback, useEffect, useState } from "react";
import type { EventCategory } from "@/lib/data";
import type { CategoryChipId } from "@/lib/filters";
import {
  loadUserHistory,
  recordCategoryClick,
  recordChipClick,
  recordDistrictClick,
  recordViewed,
  toggleSaved,
  type UserHistory,
} from "@/lib/user-history";

export function useUserHistory() {
  const [history, setHistory] = useState<UserHistory>({
    categoryClicks: {},
    chipClicks: {},
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

  const trackChipClick = useCallback((chip: CategoryChipId) => {
    setHistory((prev) => recordChipClick(prev, chip));
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
    trackChipClick,
    trackDistrictClick,
    trackViewed,
    trackToggleSaved,
    isSaved,
  };
}
