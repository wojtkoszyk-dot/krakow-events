import type { Event } from "@/lib/data";
import { getEventSourceAttribution } from "@/lib/event-display";

type EventSourceAttributionProps = {
  event: Event;
  sourceLabel: string;
  viewOriginalLabel: string;
  variant?: "modal" | "card";
};

/** Subtle source line for cards; full block + link in modal. */
export function EventSourceAttribution({
  event,
  sourceLabel,
  viewOriginalLabel,
  variant = "card",
}: EventSourceAttributionProps) {
  const attribution = getEventSourceAttribution(event);
  if (!attribution) return null;

  if (variant === "card") {
    return (
      <p className="truncate text-[9px] font-medium tracking-wide text-white/28">
        via {attribution.name}
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
      <p className="text-sm text-white/55">
        <span className="text-white/40">{sourceLabel}: </span>
        {attribution.name}
      </p>
      {attribution.hasLink && attribution.url ? (
        <a
          href={attribution.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/75 underline decoration-white/20 underline-offset-[3px] transition-colors hover:text-white hover:decoration-white/40"
        >
          {viewOriginalLabel}
          <ExternalIcon />
        </a>
      ) : null}
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  );
}
