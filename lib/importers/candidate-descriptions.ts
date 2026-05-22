import {
  buildImportDescriptions,
  type ImportTranslationContext,
} from "@/lib/import-description-translations";

type CandidateDescriptionInput = {
  description: string;
  rawText?: string;
  title: string;
  venue?: string | null;
  tags?: string[];
};

/** Resolve PL copy then generate EN once for `event_candidates` insert. */
export function descriptionsForCandidateInsert(
  item: CandidateDescriptionInput,
): { description_pl: string; description_en: string } {
  const polish =
    item.description.trim() || item.rawText?.trim() || "";

  const protectTerms = (item.tags ?? []).filter(
    (tag) => tag.length >= 3 && /[A-Za-z]/.test(tag),
  );

  const { descriptionPl, descriptionEn } = buildImportDescriptions(polish, {
    title: item.title,
    venue: item.venue,
    protectTerms,
  });

  return {
    description_pl: descriptionPl,
    description_en: descriptionEn,
  };
}

export type { ImportTranslationContext };
