export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[11px] font-medium tracking-widest text-white/90 transition-colors group-hover:border-white/25">
            K
          </span>
          <span className="text-sm font-medium tracking-tight text-white">
            kraków
            <span className="text-white/40">.events</span>
          </span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Search events"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white sm:hidden"
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            className="hidden rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium tracking-wide text-white/90 transition-colors hover:border-white/20 hover:bg-white/[0.08] sm:block"
          >
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.5 16.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
