export const dynamic = "force-dynamic";

import { SiteHeader } from "@/components/site-header";
import { Categories } from "@/components/sections/categories";
import { Hero } from "@/components/sections/hero";
import { Tonight } from "@/components/sections/tonight";
import { Trending } from "@/components/sections/trending";

export default function Home() {
  return (
    <div className="min-h-full bg-black text-white">
      <SiteHeader />
      <main>
        <Hero />
        <Categories />
        <Trending />
        <Tonight />
      </main>
      <footer className="border-t border-white/[0.06] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} kraków.events — for discovery only
          </p>
          <nav className="flex gap-6 text-xs text-white/45">
            <a href="#" className="transition-colors hover:text-white">
              About
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Submit event
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
