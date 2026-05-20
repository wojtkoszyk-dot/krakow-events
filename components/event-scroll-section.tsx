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
}: EventScrollSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="mt-6 px-4 sm:px-6 lg:px-8" aria-labelledby={id}>
      <div className="mx-auto max-w-6xl">
        <h2
          id={id}
          className="text-base font-semibold tracking-tight text-white sm:text-lg"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-white/45">{subtitle}</p>
        ) : null}
        <div
          className={`-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory ${SCROLL_ROW}`}
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
        </div>
      </div>
    </section>
  );
}
