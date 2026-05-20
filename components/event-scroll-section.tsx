import { EventCard } from "@/components/event-card";
import type { Event } from "@/lib/data";

type EventScrollSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  events: Event[];
  onSelect: (event: Event) => void;
  emptyMessage?: string;
};

export function EventScrollSection({
  id,
  title,
  subtitle,
  events,
  onSelect,
  emptyMessage = "Nothing here yet — check back soon.",
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
          <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>
        ) : null}
        <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="featured"
                onSelect={onSelect}
              />
            ))
          ) : (
            <p className="py-6 text-sm text-white/40">{emptyMessage}</p>
          )}
        </div>
      </div>
    </section>
  );
}
