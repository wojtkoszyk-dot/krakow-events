import {
  buildKarnetTags,
  mapKarnetCategory,
  type KarnetInferenceInput,
} from "@/lib/importers/karnet-categories";

const TRAVEL_LABEL_MAP: Record<string, string> = {
  festiwale: "festiwale",
  koncerty: "koncerty",
  wystawy: "wystawy",
  "widowiska plenerowe i happeningi": "plener",
  "wydarzenia plenerowe": "plener",
  inne: "inne",
};

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Map listing icon path (`images/category/30.svg`) to a label stem. */
export function labelFromCategoryIconSrc(src: string | undefined): string | null {
  if (!src) return null;
  const match = src.match(/category\/(?:event|(\d+))\.svg/i);
  if (!match) return null;
  if (!match[1]) return "wydarzenie";
  const id = match[1];
  const byId: Record<string, string> = {
    "21": "koncerty",
    "30": "festiwale",
    "35": "wystawy",
    "36": "inne",
  };
  return byId[id] ?? null;
}

export function normalizeTravelLabel(label: string): string {
  const key = fold(label.trim());
  return TRAVEL_LABEL_MAP[key] ?? label.trim();
}

export function mapKrakowTravelCategory(
  input: Omit<KarnetInferenceInput, "karnetLabels"> & {
    travelLabels: string[];
  },
): string {
  return mapKarnetCategory({
    ...input,
    karnetLabels: input.travelLabels.map(normalizeTravelLabel),
  });
}

export function buildKrakowTravelTags(
  input: Omit<KarnetInferenceInput, "karnetLabels"> & {
    travelLabels: string[];
  },
): string[] {
  return buildKarnetTags({
    ...input,
    karnetLabels: input.travelLabels,
  });
}
