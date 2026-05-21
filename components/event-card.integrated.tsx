"use client";

import Image from "next/image";
import { useLocale } from "@/hooks/use-locale";
import type { Event } from "@/lib/data";
import { getCategoryLabel } from "@/lib/i18n/translations";

type EventCardProps = {
  event: Event;
  variant?: "featured" | "grid" | "picked";
  onSelect: (event: Event) => void;
  isSaved?: boolean;
  onToggleSave?: (eventId: string) => void;
};

export function EventCard({
  event,
  variant = "grid",
  onSelect,
  isSaved = false,
  onToggleSave,
}: EventCardProps) {
  const { locale, t } = useLocale();
  const categoryLabel = getCategoryLabel(event.category, locale);
  const isFeatured = variant === "featured" || variant === "picked";
  const isPicked = variant === "picked";

  if (isFeatured && isPicked) {
    return (
      <article className="card-rail-pick group relative w-[196px] shrink-0 snap-start snap-always sm:w-[212px] md:w-[200px] lg:w-[228px] xl:w-[240px]">
        <div className="card-rail-pick-inner relative overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-white/[0.08] transition-[box-shadow,transform] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:ring-white/14 group-hover:shadow-[0_12px_36px_-16px_rgba(0,0,0,0.9)]">
          <button
            type="button"
            onClick={() => onSelect(event)}
            className="block w-full text-left active:scale-[0.98]"
          >
            <div className="relative aspect-[3/2] overflow-hidden bg-zinc-900">
              <EventImage event={event} fill sizes="(max-width: 768px) 212px, 240px" featured />
              <div className="card-scrim-rail absolute inset-0" aria-hidden />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/25 opacity-80" />

              <div className="absolute left-2 top-2 flex max-w-[calc(100%-2.5rem)] gap-1">
                <span className="inline-flex max-w-[5.5rem] truncate rounded-full border border-white/12 bg-black/50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-md">
                  {categoryLabel}
                </span>
                <span className="inline-flex shrink-0 rounded-full bg-white/95 px-1.5 py-0.5 text-[8px] font-bold tabular-nums text-black">
                  {event.time}
                </span>
              </div>
              <SaveButton
                isSaved={isSaved}
                saveLabel={t("saved.save")}
                savedLabel={t("saved.savedBtn")}
                removeLabel={t("saved.remove")}
                onToggle={() => onToggleSave?.(event.id)}
                className="absolute right-1.5 top-1.5"
                compact
              />
            </div>

            <div className="space-y-0.5 px-2.5 pb-2.5 pt-2">
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
                {event.title}
              </h3>
              <p className="truncate text-[11px] font-medium text-white/48">
                {event.venue}
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-white/32">
                {event.district}
                <span className="mx-1 text-white/18">·</span>
                <span className="text-emerald-400/80 normal-case tracking-normal">
                  {event.price}
                </span>
              </p>
            </div>
          </button>
        </div>
      </article>
    );
  }

  if (isFeatured) {
    return (
      <article className="group relative w-[260px] shrink-0 snap-start sm:w-[288px]">
        <div className="card-rail relative overflow-hidden rounded-[1.125rem] bg-zinc-950 ring-1 ring-white/[0.07] transition-[box-shadow,transform] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:ring-white/12 group-hover:shadow-[0_16px_48px_-20px_rgba(0,0,0,0.95)]">
          <button
            type="button"
            onClick={() => onSelect(event)}
            className="block w-full text-left active:scale-[0.985]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
              <EventImage event={event} fill sizes="288px" featured />
              <div className="card-scrim absolute inset-0" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-4 pr-11">
                <h3 className="text-lg font-bold leading-tight tracking-tight text-white">
                  {event.title}
                </h3>
                <p className="mt-1 truncate text-sm text-white/70">{event.venue}</p>
              </div>
            </div>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="relative">
      <button
        type="button"
        onClick={() => onSelect(event)}
        className="group/card card-feed flex h-full min-h-[88px] w-full gap-3 overflow-hidden rounded-[1.125rem] bg-white/[0.025] p-3 pr-11 text-left ring-1 ring-white/[0.06] transition-[background,box-shadow,transform,ring-color] duration-300 ease-out hover:bg-white/[0.045] hover:ring-white/12 active:scale-[0.995] sm:min-h-[92px] sm:gap-3.5 sm:p-3.5 sm:pr-12 lg:min-h-[100px] lg:p-4 lg:pr-14"
      >
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[0.875rem] bg-zinc-900 ring-1 ring-white/[0.08] sm:h-[92px] sm:w-[92px] lg:h-[100px] lg:w-[112px]">
          <EventImage event={event} fill sizes="(max-width: 1024px) 92px, 112px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <time className="absolute bottom-1.5 left-1.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-black shadow-sm">
            {event.time}
          </time>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-0.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
            <span className="text-white/62">{categoryLabel}</span>
            <span className="mx-1.5 text-white/20">·</span>
            {event.district}
          </p>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.25] tracking-[-0.02em] text-white">
            {event.title}
          </h3>
          <p className="truncate text-[13px] font-medium leading-snug text-white/52">
            {event.venue}
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-[11px] leading-none">
            <span className="font-medium text-white/42">{event.date}</span>
            <span className="text-white/18">·</span>
            <span className="font-semibold text-emerald-400/85">{event.price}</span>
          </p>
        </div>
      </button>
      <SaveButton
        isSaved={isSaved}
        saveLabel={t("saved.save")}
        savedLabel={t("saved.savedBtn")}
        removeLabel={t("saved.remove")}
        onToggle={() => onToggleSave?.(event.id)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 sm:right-3"
      />
    </article>
  );
}

function SaveButton({
  isSaved,
  onToggle,
  className,
  saveLabel,
  savedLabel,
  removeLabel,
  compact = false,
}: {
  isSaved: boolean;
  onToggle?: () => void;
  className?: string;
  saveLabel: string;
  savedLabel: string;
  removeLabel: string;
  compact?: boolean;
}) {
  if (!onToggle) return null;

  const size = compact ? "h-7 w-7" : "h-9 w-9";

  return (
    <button
      type="button"
      aria-label={isSaved ? removeLabel : saveLabel}
      aria-pressed={isSaved}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex ${size} items-center justify-center rounded-full border backdrop-blur-md transition-all duration-250 ease-out hover:scale-105 active:scale-95 ${className} ${
        isSaved
          ? "border-white/35 bg-white/25 text-white shadow-[0_4px_16px_-4px_rgba(255,255,255,0.25)]"
          : "border-white/18 bg-black/55 text-white/85 hover:border-white/30 hover:bg-black/75 hover:text-white"
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}

function EventImage({
  event,
  fill,
  sizes,
  featured,
}: {
  event: Event;
  fill?: boolean;
  sizes: string;
  featured?: boolean;
}) {
  return (
    <Image
      src={event.imageUrl}
      alt=""
      fill={fill}
      sizes={sizes}
      className={`object-cover transition-transform duration-[600ms] ease-out ${
        featured
          ? "group-hover:scale-[1.05]"
          : "group-hover/card:scale-[1.04]"
      }`}
    />
  );
}
