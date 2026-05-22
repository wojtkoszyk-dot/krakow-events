import { scoreKarnetImport } from "@/lib/importers/karnet-quality";
import type { KrakowTravelImportedItem } from "@/lib/importers/krakow-travel-types";

/** Score 0–100 — same signals as Karnet import quality. */
export function scoreKrakowTravelImport(
  item: Pick<
    KrakowTravelImportedItem,
    | "description"
    | "imageUrl"
    | "venue"
    | "startDate"
    | "category"
    | "tags"
    | "district"
  >,
): number {
  return scoreKarnetImport(item);
}
