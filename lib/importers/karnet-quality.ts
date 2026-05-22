const FALLBACK_IMAGE_HOST = "images.unsplash.com";

type KarnetQualityInput = {
  description: string;
  imageUrl: string | null;
  venue: string | null;
  startDate: string | null;
  category: string;
  tags: string[];
  district?: string;
};

/** Score 0–100 — rewards fully parsed detail metadata. */
export function scoreKarnetImport(item: KarnetQualityInput): number {
  let score = 10;

  if (item.imageUrl && !item.imageUrl.includes(FALLBACK_IMAGE_HOST)) {
    score += 20;
  }
  if (item.venue) score += 20;
  if (item.startDate) score += 15;
  if (item.category !== "Other") score += 15;
  if (item.tags.length > 0) score += 15;
  if (item.description.trim().length >= 80) score += 10;
  else if (item.description.trim().length >= 20) score += 5;
  if (item.district && item.district !== "Kraków") score += 5;

  return Math.min(100, score);
}
