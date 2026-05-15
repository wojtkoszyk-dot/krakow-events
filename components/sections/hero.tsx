import { events } from "@/lib/data";
import { getTonightEvents } from "@/lib/events";

const tonightEvents = getTonightEvents();

const uniqueVenues = new Set(events.map((e) => e.location)).size;

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[min(100%,520px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(120,120,255,0.14),transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-8 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,140,80,0.08),transparent_70%)] blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
          Discover · Tonight & beyond
        </p>
        <h1 className="max-w-[14ch] text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl sm:leading-[1.02] lg:text-7xl">
          What&apos;s on in{" "}
          <span className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
            Kraków
          </span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
          Curated gigs, clubs, art, and culture — the city&apos;s pulse in one
          place.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <label className="relative flex-1 sm:max-w-md">
            <span className="sr-only">Search events</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Search events, venues, artists…"
              className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none ring-0 transition-[border-color,background-color] focus:border-white/25 focus:bg-white/[0.06]"
            />
          </label>
          <button
            type="button"
            className="h-12 shrink-0 rounded-full bg-white px-6 text-sm font-medium tracking-tight text-black transition-opacity hover:opacity-90 active:opacity-80"
          >
            Explore
          </button>
        </div>

        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-8 sm:mt-12 sm:max-w-lg">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Tonight
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {tonightEvents.length}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              This week
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {events.length}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Venues
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {uniqueVenues}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.5 16.5" />
    </svg>
  );
}
