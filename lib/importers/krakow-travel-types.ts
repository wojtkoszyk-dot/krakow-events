export const KRAKOW_TRAVEL_SOURCE_NAME = "Krakow Travel" as const;
export const KRAKOW_TRAVEL_BASE_URL = "https://krakow.travel";
export const KRAKOW_TRAVEL_EVENTS_URL = `${KRAKOW_TRAVEL_BASE_URL}/wydarzenia`;

export type KrakowTravelImportedItem = {
  title: string;
  sourceUrl: string;
  sourceName: typeof KRAKOW_TRAVEL_SOURCE_NAME;
  description: string;
  venue: string | null;
  district: string;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  category: string;
  tags: string[];
  price: string | null;
  rawText: string;
  travelLabels: string[];
  listingHint: string | null;
  qualityScore: number;
};

export type KrakowTravelListingEntry = {
  title: string;
  sourceUrl: string;
  listingHint: string;
  travelLabels: string[];
  listingImageUrl: string | null;
};
