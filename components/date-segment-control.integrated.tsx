"use client";

import { useRef } from "react";
import { DatePickerPopover } from "@/components/date-picker-popover";
import { useLocale } from "@/hooks/use-locale";
import {
  DATE_SEGMENT_IDS,
  getCustomSegmentLabel,
  type CustomDateRange,
  type DatePreset,
  type FilterState,
} from "@/lib/filters";

const DATE_LABEL_KEYS: Record<DatePreset, string> = {
  all: "date.all",
  today: "date.today",
  tomorrow: "date.tomorrow",
  weekend: "date.weekend",
  custom: "date.custom",
};

type DateSegmentControlProps = {
  filters: FilterState;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  onSelectPreset: (preset: DatePreset) => void;
  initialRange: CustomDateRange | null;
  onApplyCustomRange: (range: CustomDateRange) => void;
  onClearCustomRange: () => void;
};

export function DateSegmentControl({
  filters,
  pickerOpen,
  onPickerOpenChange,
  onSelectPreset,
  initialRange,
  onApplyCustomRange,
  onClearCustomRange,
}: DateSegmentControlProps) {
  const customButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLocale();

  return (
    <div className="relative">
      <div
        role="group"
        aria-label={t("date.when")}
        className="segment-track hide-scrollbar -mx-0.5 flex overflow-x-auto scroll-touch"
      >
        {DATE_SEGMENT_IDS.map((id) => {
          const isCustom = id === "custom";
          const active = filters.datePreset === id;
          const label = isCustom
            ? (getCustomSegmentLabel(filters) ?? t(DATE_LABEL_KEYS.custom))
            : t(DATE_LABEL_KEYS[id]);

          if (isCustom) {
            return (
              <button
                key={id}
                ref={customButtonRef}
                type="button"
                aria-pressed={active}
                aria-expanded={pickerOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPreset("custom");
                  onPickerOpenChange(true);
                }}
                className={`segment-btn inline-flex max-w-[9.5rem] items-center gap-1.5 ${active || pickerOpen ? "segment-btn-active" : ""} ${active && filters.customRange ? "truncate" : ""}`}
              >
                {!filters.customRange ? <CalendarIcon /> : null}
                <span className="truncate">{label}</span>
              </button>
            );
          }

          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                onPickerOpenChange(false);
                onSelectPreset(id);
              }}
              className={`segment-btn ${active ? "segment-btn-active" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <DatePickerPopover
        open={pickerOpen}
        anchorRef={customButtonRef}
        onClose={() => onPickerOpenChange(false)}
        initialRange={initialRange}
        onApply={onApplyCustomRange}
        onClear={onClearCustomRange}
      />
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="shrink-0 opacity-70"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
