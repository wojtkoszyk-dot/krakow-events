export const RA_SOURCE_NAME = "Resident Advisor" as const;
export const RA_BASE_URL = "https://ra.co";
export const RA_KRAKOW_EVENTS_URL = `${RA_BASE_URL}/events/pl/krakow`;
/** RA GraphQL area id for Kraków (from `areas(searchTerm: "Krakow")`). */
export const RA_KRAKOW_AREA_ID = 455;

export type RaImportedItem = {
  title: string;
  sourceUrl: string;
  sourceName: typeof RA_SOURCE_NAME;
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
  artists: string[];
  genres: string[];
  /** RA event / ticket page (stored in raw_data; also used as source_url). */
  ticketUrl: string;
  raEventId: string;
  qualityScore: number;
};

export type RaListingEntry = {
  raEventId: string;
  sourceUrl: string;
  title: string;
  listingDate: string | null;
};
