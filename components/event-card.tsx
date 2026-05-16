"use client";

import Image from "next/image";
import type { Event } from "@/lib/data";

type EventCardProps = {
  event: Event;
  variant?: "featured" | "grid";
  onSelect: (event: Event) => void;
};

export function EventCard({
  event,
  variant = "grid",
  onSelect,
}: EventCardProps) {
  if (variant === "featured") {
    return (
      <article className="group relative w-[260px] shrink-0 snap-start sm:w-[280px]">
        <button
          type="button"
          onClick={() => onSelect(event)}
          className="block w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950 text-left transition-transform duration-300 active:scale-[0.98] sm:hover:scale-[1.02]"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
            <EventImage event={event} fill sizes="280px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <span className="absolute left-4 top-4 inline-flex rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
              {event.category}
            </span>
            <span className="absolute bottom-0 left-0 right-0 p-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                {event.date}
              </p>
              <h3 className="text-xl font-semibold leading-tight tracking-tight text-white">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-white/60">{event.venue}</p>
              <p className="mt-1 text-xs text-white/45">{event.price}</p>
            </span>
          </div>
        </button>
      </article>
    );
  }

  return (
    <article>
      <button
        type="button"
        onClick={() => onSelect(event)}
        className="group flex w-full gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-colors hover:border-white/12 hover:bg-white/[0.04] active:bg-white/[0.06] sm:gap-4 sm:p-4"
      >
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:h-24 sm:w-24">
          <EventImage event={event} fill sizes="96px" />
          <time className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            {event.time}
          </time>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            {event.category} · {event.district}
          </p>
          <h3 className="line-clamp-2 text-base font-medium leading-snug tracking-tight text-white">
            {event.title}
          </h3>
          <p className="truncate text-sm text-white/50">{event.venue}</p>
          <p className="text-xs text-white/40">
            {event.date} · {event.price}
          </p>
        </div>
      </button>
    </article>
  );
}

function EventImage({
  event,
  fill,
  sizes,
}: {
  event: Event;
  fill?: boolean;
  sizes: string;
}) {
  return (
    <Image
      src={event.imageUrl}
      alt=""
      fill={fill}
      sizes={sizes}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}
