import { EventCard } from "@/components/event-card";
import { trendingEvents } from "@/lib/data";

export function Trending() {
  return (
    <section
      className="mt-14 px-4 sm:mt-16 sm:px-6 lg:px-8"
      aria-labelledby="trending-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
              Editor&apos;s pick
            </p>
            <h2
              id="trending-heading"
              className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Trending
            </h2>
          </div>
          <a
            href="#"
            className="shrink-0 text-xs font-medium tracking-wide text-white/50 transition-colors hover:text-white"
          >
            View all →
          </a>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
          {trendingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
