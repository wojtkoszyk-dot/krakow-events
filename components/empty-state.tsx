import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  hint: string;
  icon?: "search" | "calendar" | "filter" | "heart" | "spark";
  action?: ReactNode;
};

export function EmptyState({ title, hint, icon = "spark", action }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in-up">
      <span className="empty-state-icon" aria-hidden>
        <EmptyIcon variant={icon} />
      </span>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-hint">{hint}</p>
      {action ? <div className="mt-3.5">{action}</div> : null}
    </div>
  );
}

function EmptyIcon({ variant }: { variant: EmptyStateProps["icon"] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (variant) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L16.5 16.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path d="M5 19l1 2M19 17l-1 2" opacity="0.6" />
        </svg>
      );
  }
}
