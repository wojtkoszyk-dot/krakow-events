"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/hooks/use-locale";
import {
  addMonths,
  compareISO,
  formatMonthYear,
  formatShortDate,
  getKrakowTodayISO,
  getMonthDayISOList,
  getMonthLeadingBlanks,
  isWeekendISO,
  parseISO,
} from "@/lib/dates";
import type { CustomDateRange } from "@/lib/filters";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const PANEL_WIDTH = 288;

function dayCellClasses(opts: {
  isPast: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  isToday: boolean;
  isWeekend: boolean;
  hasRangeEndpoints: boolean;
}): string {
  const {
    isPast,
    isStart,
    isEnd,
    inRange,
    isToday,
    isWeekend,
    hasRangeEndpoints,
  } = opts;

  if (isPast) {
    return "cursor-not-allowed rounded-lg text-white/15";
  }

  if (isStart || isEnd) {
    return "z-10 rounded-lg bg-white font-semibold text-black shadow-[0_2px_10px_-2px_rgba(255,255,255,0.45)]";
  }

  if (inRange) {
    const rangeBase = isWeekend
      ? "bg-violet-400/18 text-white"
      : "bg-white/12 text-white";
    const round = !hasRangeEndpoints ? "rounded-lg" : "";
    return `${rangeBase} ${round}`.trim();
  }

  if (isToday) {
    if (isWeekend) {
      return "rounded-lg bg-violet-500/12 font-medium text-white shadow-[inset_0_-2px_0_0_rgba(167,139,250,0.55)] ring-1 ring-violet-400/45";
    }
    return "rounded-lg font-medium text-white ring-1 ring-white/45";
  }

  if (isWeekend) {
    return "rounded-lg bg-violet-500/[0.08] font-medium text-violet-100/90 shadow-[inset_0_-2px_0_0_rgba(167,139,250,0.35)] hover:bg-violet-500/[0.14] hover:text-white hover:shadow-[inset_0_-2px_0_0_rgba(167,139,250,0.5)]";
  }

  return "rounded-lg text-white/75 hover:bg-white/[0.07] hover:text-white";
}

type DatePickerPopoverProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
  initialRange: CustomDateRange | null;
  onApply: (range: CustomDateRange) => void;
  onClear: () => void;
};

export function DatePickerPopover({
  open,
  onClose,
  anchorRef,
  initialRange,
  onApply,
  onClear,
}: DatePickerPopoverProps) {
  const { t } = useLocale();
  const today = getKrakowTodayISO();
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const initialMonth = useMemo(() => {
    const source = initialRange?.from ?? today;
    return parseISO(source);
  }, [initialRange, today]);

  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);
  const [draftFrom, setDraftFrom] = useState<string | null>(null);
  const [draftTo, setDraftTo] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const margin = 16;
    let left = rect.right - PANEL_WIDTH;
    left = Math.max(
      margin,
      Math.min(left, window.innerWidth - PANEL_WIDTH - margin),
    );
    setPosition({
      top: rect.bottom + 8,
      left,
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    setDraftFrom(initialRange?.from ?? null);
    setDraftTo(initialRange?.to ?? null);
    const src = initialRange?.from ?? today;
    const { year, month } = parseISO(src);
    setViewYear(year);
    setViewMonth(month);
  }, [open, initialRange, today]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const monthDays = useMemo(
    () => getMonthDayISOList(viewYear, viewMonth),
    [viewYear, viewMonth],
  );
  const leadingBlanks = useMemo(
    () => getMonthLeadingBlanks(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const handleDayClick = useCallback(
    (iso: string) => {
      if (compareISO(iso, today) < 0) return;
      if (!draftFrom || (draftFrom && draftTo)) {
        setDraftFrom(iso);
        setDraftTo(null);
        return;
      }
      if (compareISO(iso, draftFrom) < 0) {
        setDraftTo(draftFrom);
        setDraftFrom(iso);
      } else {
        setDraftTo(iso);
      }
    },
    [draftFrom, draftTo, today],
  );

  const goMonth = (delta: number) => {
    const next = addMonths(viewYear, viewMonth, delta);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const handleApply = () => {
    if (!draftFrom) return;
    onApply({ from: draftFrom, to: draftTo ?? draftFrom });
    onClose();
  };

  if (!open || !mounted) return null;

  const selectionHint =
    draftFrom && draftTo && draftFrom !== draftTo
      ? `${formatShortDate(draftFrom)} – ${formatShortDate(draftTo)}`
      : draftFrom
        ? formatShortDate(draftFrom)
        : t("date.selectDates");

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100]" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="date-picker-title"
        style={{ top: position.top, left: position.left, width: PANEL_WIDTH }}
        className="calendar-popover fixed z-[101] animate-popover-in p-3.5"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p
          id="date-picker-title"
          className="mb-2 text-center text-[11px] font-medium text-white/45"
        >
          {selectionHint}
        </p>

        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label={t("date.prevMonth")}
            onClick={() => goMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-all duration-200 hover:bg-white/[0.08] hover:text-white active:scale-95"
          >
            <ChevronLeft />
          </button>
          <span className="text-sm font-semibold tracking-tight text-white">
            {formatMonthYear(viewYear, viewMonth)}
          </span>
          <button
            type="button"
            aria-label={t("date.nextMonth")}
            onClick={() => goMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-all duration-200 hover:bg-white/[0.08] hover:text-white active:scale-95"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((d, i) => {
            const isWeekendCol = i >= 5;
            return (
              <span
                key={`${d}-${i}`}
                className={`py-1 text-[9px] font-semibold uppercase tracking-wider ${
                  isWeekendCol
                    ? "rounded-md bg-violet-500/[0.08] text-violet-300/75"
                    : "text-white/28"
                }`}
              >
                {d}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <span key={`pad-${i}`} className="h-8" aria-hidden />
          ))}
          {monthDays.map((iso) => {
            const dayNum = parseISO(iso).day;
            const isPast = compareISO(iso, today) < 0;
            const isStart = draftFrom === iso;
            const isEnd = draftTo === iso;
            const inRange =
              draftFrom &&
              draftTo &&
              compareISO(iso, draftFrom) >= 0 &&
              compareISO(iso, draftTo) <= 0;
            const isToday = iso === today;
            const isWeekend = isWeekendISO(iso);
            const inRangeOnly = Boolean(inRange && !isStart && !isEnd);

            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(iso)}
                className={`relative flex h-8 items-center justify-center text-xs transition-all duration-150 active:scale-95 disabled:active:scale-100 ${dayCellClasses(
                  {
                    isPast,
                    isStart,
                    isEnd,
                    inRange: Boolean(inRange),
                    isToday,
                    isWeekend,
                    hasRangeEndpoints: Boolean(draftFrom && draftTo),
                  },
                )} ${inRangeOnly ? "rounded-none" : ""} ${
                  isStart && inRange && draftTo ? "rounded-r-none" : ""
                } ${isEnd && inRange && draftFrom ? "rounded-l-none" : ""}`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2 border-t border-white/[0.06] pt-3">
          <button
            type="button"
            onClick={() => {
              setDraftFrom(null);
              setDraftTo(null);
              onClear();
              onClose();
            }}
            className="flex-1 rounded-full py-2 text-xs font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          >
            {t("date.clear")}
          </button>
          <button
            type="button"
            disabled={!draftFrom}
            onClick={handleApply}
            className="flex-1 rounded-full bg-white py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-35"
          >
            {t("date.apply")}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
