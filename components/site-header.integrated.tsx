"use client";

import { useLocale } from "@/hooks/use-locale";
import { LOCALES } from "@/lib/i18n/translations";

type SiteHeaderProps = {
  searchOpen?: boolean;
  onSearchToggle?: () => void;
  onOpenSaved?: () => void;
  savedCount?: number;
};

export function SiteHeader({
  searchOpen = false,
  onSearchToggle,
  onOpenSaved,
  savedCount = 0,
}: SiteHeaderProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-black/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="app-container flex h-9 items-center justify-between gap-2 sm:h-10">
        <a href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[9px] font-semibold tracking-widest text-white/90">
            K
          </span>
          <span className="truncate text-[13px] font-semibold tracking-[-0.02em] text-white">
            kraków
            <span className="font-normal text-white/38">.events</span>
          </span>
        </a>

        <nav className="flex shrink-0 items-center gap-0.5">
          <div
            className="flex items-center rounded-full border border-white/[0.07] bg-white/[0.03] p-0.5"
            role="group"
            aria-label={t("header.language")}
          >
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                aria-pressed={locale === loc}
                className={`min-h-[28px] min-w-[28px] rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  locale === loc
                    ? "bg-white text-black shadow-sm"
                    : "text-white/42 hover:text-white/72"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
          {onSearchToggle ? (
            <button
              type="button"
              aria-label={t("header.search")}
              aria-expanded={searchOpen}
              aria-pressed={searchOpen}
              onClick={onSearchToggle}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/[0.07] active:scale-95 ${
                searchOpen
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <SearchIcon />
            </button>
          ) : null}
          {onOpenSaved ? (
            <button
              type="button"
              aria-label={`${t("header.saved")}${savedCount > 0 ? `, ${savedCount}` : ""}`}
              onClick={onOpenSaved}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white active:scale-95"
            >
              <HeartIcon />
              {savedCount > 0 ? (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white ring-2 ring-black" />
              ) : null}
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.5 16.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}
