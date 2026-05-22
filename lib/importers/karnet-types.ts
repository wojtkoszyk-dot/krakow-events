export const KARNET_SOURCE_NAME = "Karnet Krakow Culture" as const;
export const KARNET_BASE_URL = "https://karnet.krakowculture.pl";
export const KARNET_EVENTS_URL = `${KARNET_BASE_URL}/wydarzenia`;

export type KarnetImportedItem = {
  title: string;
  sourceUrl: string;
  sourceName: typeof KARNET_SOURCE_NAME;
  description: string;
  venue: string | null;
  district: string;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  time: string | null;
  imageUrl: string | null;
  category: string;
  tags: string[];
  price: string | null;
  rawText: string;
  karnetLabels: string[];
  listingHint: string | null;
  isRecurring: boolean;
  qualityScore: number;
};

export type KarnetListingEntry = {
  title: string;
  sourceUrl: string;
  listingHint: string;
};
