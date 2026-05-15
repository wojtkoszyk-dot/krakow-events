import type { Event } from "@/lib/data";

type EventCardProps = {
  event: Event;
  variant?: "featured" | "compact";
};

export function EventCard({ event, variant = "featured" }: EventCardProps) {
  if (variant === "compact") {
    return (
      <article className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/12 hover:bg-white/[0.04] sm:p-4">
        <div
          className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${event.gradient} sm:h-20 sm:w-20`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
          <time className="absolute bottom-2 left-2 text-[10px] font-medium uppercase tracking-wider text-white/80">
            {event.time}
          </time>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            {event.category}
          </p>
          <h3 className="truncate text-base font-medium tracking-tight text-white">
            {event.title}
          </h3>
          <p className="truncate text-sm text-white/50">{event.location}</p>
          <p className="line-clamp-2 text-xs leading-relaxed text-white/35">
            {event.description}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative w-[260px] shrink-0 snap-start sm:w-[280px]">
      <a
        href="#"
        className="block overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950 transition-transform duration-300 active:scale-[0.98] sm:hover:scale-[1.02]"
      >
        <div
          className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${event.gradient}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute left-4 top-4">
            <span className="inline-flex rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
              {event.category}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
              {event.date}
            </p>
            <h3 className="text-xl font-semibold leading-tight tracking-tight text-white">
              {event.title}
            </h3>
            <p className="mt-1 text-sm text-white/60">{event.location}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/45">
              {event.description}
            </p>
          </div>
        </div>
      </a>
    </article>
  );
}
