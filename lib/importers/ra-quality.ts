import { scoreKarnetImport } from "@/lib/importers/karnet-quality";
import type { RaImportedItem } from "@/lib/importers/ra-types";

/** Score 0–100 — rewards RA nightlife metadata richness. */
export function scoreRaImport(
  item: Pick<
    RaImportedItem,
    | "description"
    | "imageUrl"
    | "venue"
    | "startDate"
    | "category"
    | "tags"
    | "district"
    | "artists"
    | "genres"
  >,
): number {
  let score = scoreKarnetImport(item);
  if (item.artists.length > 0) score += 5;
  if (item.genres.length > 0) score += 5;
  if (item.category === "Nightlife") score += 5;
  return Math.min(100, score);
}
