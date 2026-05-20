"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { Event } from "@/lib/data";

type EventModalProps = {
  event: Event | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
};

export function EventModal({
  event,
  onClose,
  isSaved = false,
  onToggleSave,
}: EventModalProps) {
  useEffect(() => {
    if (!event) return;
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
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-zinc-950 shadow-2xl sm:max-h-[85vh] sm:rounded-3xl">
        <div className="relative h-48 shrink-0 sm:h-56">
          <Image
            src={event.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <CloseIcon />
          </button>
          <span className="absolute bottom-3 left-4 inline-flex rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
            {event.category}
          </span>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 pb-8 pt-4 sm:px-6">
          <h2
            id="event-modal-title"
            className="text-2xl font-semibold leading-tight tracking-tight text-white"
          >
            {event.title}
          </h2>
          <p className="mt-2 text-sm text-white/50">
            {event.date} · {event.time}
          </p>

          <dl className="mt-5 grid gap-3 text-sm">
            <DetailRow label="Venue" value={event.venue} />
            <DetailRow label="District" value={event.district} />
            <DetailRow label="Price" value={event.price} />
          </dl>

          <p className="mt-5 text-sm leading-relaxed text-white/65">
            {event.description}
          </p>

          <button
            type="button"
            onClick={onToggleSave}
            className={`mt-6 h-12 w-full rounded-full text-sm font-medium tracking-tight transition-opacity hover:opacity-90 active:opacity-80 ${
              isSaved
                ? "border border-white/20 bg-white/10 text-white"
                : "bg-white text-black"
            }`}
          >
            {isSaved ? "Saved" : "Save event"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-white/[0.06] pb-3 last:border-0">
      <dt className="w-20 shrink-0 text-white/40">{label}</dt>
      <dd className="text-white/90">{value}</dd>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
