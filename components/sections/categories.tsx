import { categories } from "@/lib/data";

export function Categories() {
  return (
    <section className="px-4 sm:px-6 lg:px-8" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2
              id="categories-heading"
              className="text-lg font-semibold tracking-tight text-white sm:text-xl"
            >
              Categories
            </h2>
            <p className="mt-1 text-sm text-white/45">Browse by mood</p>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-medium tracking-wide text-white/50 transition-colors hover:text-white"
          >
            See all
          </button>
        </div>

        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <li key={category.id} className="shrink-0">
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/85 transition-colors hover:border-white/15 hover:bg-white/[0.06] active:bg-white/[0.08]"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-xs text-white/70"
                  aria-hidden
                >
                  {category.emoji}
                </span>
                {category.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
