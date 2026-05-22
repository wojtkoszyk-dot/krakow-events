import type { Locale } from "@/lib/i18n/translations";
import { buildImportDescriptions } from "@/lib/import-description-translations";

export type { ImportTranslationContext } from "@/lib/import-description-translations";
export {
  buildImportDescriptions,
  translateImportDescription,
} from "@/lib/import-description-translations";

type DescriptionRow = {
  description_pl?: string | null;
  description_en?: string | null;
  /** Legacy single column — treated as Polish/original. */
  description?: string | null;
};

/** Read stored bilingual fields (no translation at render time). */
export function mapDescriptionsFromDb(row: DescriptionRow): {
  descriptionPl: string;
  descriptionEn: string;
} {
  const pl =
    row.description_pl?.trim() ||
    row.description?.trim() ||
    "";
  const en = row.description_en?.trim() || "";

  return {
    descriptionPl: pl || en,
    descriptionEn: en || pl,
  };
}

/** Mock seeds / legacy rows without DB columns. */
export function assignEventDescriptions(
  raw: string,
  context?: { title?: string; venue?: string | null },
): { descriptionPl: string; descriptionEn: string } {
  return buildImportDescriptions(raw, {
    title: context?.title ?? "",
    venue: context?.venue ?? null,
  });
}

export function getEventDescription(
  event: { descriptionPl: string; descriptionEn: string },
  locale: Locale,
): string {
  if (locale === "pl") {
    return event.descriptionPl || event.descriptionEn || "";
  }
  return event.descriptionEn || event.descriptionPl || "";
}
