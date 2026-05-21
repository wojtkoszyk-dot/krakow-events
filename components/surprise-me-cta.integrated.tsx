"use client";

import { useLocale } from "@/hooks/use-locale";

type SurpriseMeCtaProps = {
  onSurprise: () => void;
};

export function SurpriseMeCta({ onSurprise }: SurpriseMeCtaProps) {
  const { t } = useLocale();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[max(1rem,env(safe-area-inset-bottom))] md:bottom-5">
      <div className="app-container flex justify-center md:justify-end">
        <button
          type="button"
          onClick={onSurprise}
          className="surprise-fab surprise-fab-btn group pointer-events-auto inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-white/18 bg-white/[0.09] px-4 py-2.5 backdrop-blur-2xl sm:gap-3 sm:px-5 sm:py-2.5"
        >
        <span
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/50 via-violet-600/30 to-fuchsia-500/30 text-white ring-1 ring-white/20 transition-transform duration-350 ease-out group-hover:scale-110"
          aria-hidden
        >
          <span className="surprise-fab-glow absolute inset-0 rounded-full" />
          <ShuffleIcon />
        </span>
        <span className="flex flex-col items-start pr-0.5 text-left">
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-white">
            {t("surprise.title")}
          </span>
          <span className="text-[10px] font-medium leading-tight text-white/48">
            {t("surprise.subtitle")}
          </span>
        </span>
        </button>
      </div>
    </div>
  );
}

function ShuffleIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="relative z-10"
      aria-hidden
    >
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}
