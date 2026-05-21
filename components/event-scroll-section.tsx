import { EventCard } from "@/components/event-card";
import type { Event } from "@/lib/data";

type EventScrollSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  events: Event[];
  onSelect: (event: Event) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  isFirst?: boolean;
  /** Emphasize section title (e.g. Happening Today). */
  accent?: boolean;
};

const SCROLL_ROW =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function EventScrollSection({
  id,
  title,
  subtitle,
  events,
  onSelect,
  isSaved,
  onToggleSave,
  isFirst = false,
  accent = false,
}: EventScrollSectionProps) {
  if (events.length === 0) return null;

  return (
    <section
      className={`px-4 sm:px-6 lg:px-8 ${isFirst ? "pt-4" : "pt-10"}`}
      aria-labelledby={id}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            {accent ? (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/80">
                Live now
              </p>
            ) : null}
            <h2
              id={id}
              className={`font-semibold tracking-tight text-white ${
                accent
                  ? "text-xl sm:text-2xl"
                  : "text-lg sm:text-xl"
              }`}
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-white/45">{subtitle}</p>
            ) : null}
          </div>
          <span className="shrink-0 pb-0.5 text-xs font-medium tabular-nums text-white/30">
            {events.length}
          </span>
        </div>
        <div
          className={`-mx-4 mt-4 flex gap-4 overflow-x-auto scroll-pl-4 px-4 pb-2 snap-x snap-mandatory sm:mt-5 ${SCROLL_ROW}`}
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
          <div className="w-1 shrink-0 snap-end sm:w-2" aria-hidden />
        </div>
      </div>
    </section>
  );
}
