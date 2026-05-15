import { EventCard } from "@/components/event-card";
import {
  formatKrakowTodayLabel,
  getKrakowTodayISO,
  getTonightEvents,
} from "@/lib/events";

export function Tonight() {
  const todayISO = getKrakowTodayISO();
  const tonightEvents = getTonightEvents(todayISO);
  const todayLabel = formatKrakowTodayLabel(todayISO);

  return (
    <section
      className="mt-14 px-4 pb-20 sm:mt-16 sm:px-6 sm:pb-24 lg:px-8"
      aria-labelledby="tonight-heading"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-200/90">
                Today only
              </span>
            </p>
            <h2
              id="tonight-heading"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Tonight in Kraków
            </h2>
            <p className="mt-1 text-sm text-white/45">
              {todayLabel} · {tonightEvents.length}{" "}
              {tonightEvents.length === 1 ? "event" : "events"}
            </p>
          </div>
        </header>

        {tonightEvents.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {tonightEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} variant="compact" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-10 text-center text-sm text-white/45">
            Nothing scheduled for today. Check trending picks above or come back
            tomorrow.
          </p>
        )}
      </div>
    </section>
  );
}
