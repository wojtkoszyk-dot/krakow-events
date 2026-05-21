"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { useLocale } from "@/hooks/use-locale";
import type { Event } from "@/lib/data";

type SavedPanelProps = {
  open: boolean;
  onClose: () => void;
  events: Event[];
  onSelect: (event: Event) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
};

export function SavedPanel({
  open,
  onClose,
  events,
  onSelect,
  isSaved,
  onToggleSave,
}: SavedPanelProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-panel-title"
    >
      <button
        type="button"
        aria-label={t("saved.close")}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/[0.06] bg-zinc-950/98 shadow-[-24px_0_64px_-24px_rgba(0,0,0,0.9)] animate-fade-in-up sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
          <h2
            id="saved-panel-title"
            className="text-base font-bold tracking-[-0.02em] text-white"
          >
            {t("saved.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("modal.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3.5 py-3.5 scroll-touch">
          {events.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {events.map((event) => (
                <li key={event.id}>
                  <EventCard
                    event={event}
                    variant="grid"
                    onSelect={(e) => {
                      onSelect(e);
                      onClose();
                    }}
                    isSaved={isSaved(event.id)}
                    onToggleSave={onToggleSave}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-[50vh] items-center justify-center px-2">
              <EmptyState
                icon="heart"
                title={t("saved.emptyTitle")}
                hint={t("saved.hint")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
