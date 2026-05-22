import {
  RA_BASE_URL,
  RA_KRAKOW_AREA_ID,
} from "@/lib/importers/ra-types";

export const RA_GRAPHQL_URL = `${RA_BASE_URL}/graphql`;

export const RA_GRAPHQL_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Referer: `${RA_BASE_URL}/events/pl/krakow`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
} as const;

const EVENT_LISTINGS_QUERY = `query GET_EVENT_LISTINGS($filters: FilterInputDtoInput, $filterOptions: FilterOptionsInputDtoInput, $page: Int, $pageSize: Int) {
  eventListings(filters: $filters, filterOptions: $filterOptions, pageSize: $pageSize, page: $page) {
    data {
      id
      listingDate
      event {
        id
        title
        contentUrl
        date
        startTime
        endTime
        isTicketed
        venue { id name }
        artists { id name }
        genres { id name }
        images { filename type }
      }
    }
    totalResults
  }
}`;

const EVENT_DETAIL_QUERY = `query EVENT($id: ID!) {
  event(id: $id) {
    id
    title
    date
    startTime
    endTime
    content
    contentUrl
    cost
    isTicketed
    pick { blurb }
    venue { id name area { id name } }
    artists { id name }
    genres { id name }
    images { filename type }
  }
}`;

export type RaGraphqlArtist = { id: string; name: string };
export type RaGraphqlGenre = { id: string; name: string };
export type RaGraphqlImage = { filename: string | null; type: string | null };

export type RaGraphqlEventSummary = {
  id: string;
  title: string;
  contentUrl: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  isTicketed: boolean | null;
  venue: { id: string; name: string } | null;
  artists: RaGraphqlArtist[] | null;
  genres: RaGraphqlGenre[] | null;
  images: RaGraphqlImage[] | null;
};

export type RaGraphqlListingRow = {
  id: string;
  listingDate: string | null;
  event: RaGraphqlEventSummary | null;
};

export type RaGraphqlEventDetail = RaGraphqlEventSummary & {
  content: string | null;
  cost: string | null;
  pick: { blurb: string | null } | null;
  venue: {
    id: string;
    name: string;
    area: { id: string; name: string } | null;
  } | null;
};

async function postGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(RA_GRAPHQL_URL, {
    method: "POST",
    headers: RA_GRAPHQL_HEADERS,
    cache: "no-store",
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`RA GraphQL HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("RA GraphQL returned no data");
  }

  return payload.data;
}

function listingDateRange(monthsAhead = 3): { gte: string; lte: string } {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + monthsAhead);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    gte: `${fmt(start)}T00:00:00.000Z`,
    lte: `${fmt(end)}T23:59:59.999Z`,
  };
}

export function resolveRaEventUrl(contentUrl: string | null, eventId: string): string {
  if (contentUrl?.startsWith("http")) return contentUrl;
  if (contentUrl?.startsWith("/")) return `${RA_BASE_URL}${contentUrl}`;
  return `${RA_BASE_URL}/events/${eventId}`;
}

/** Kraków listings — equivalent to `/events/pl/krakow` (HTML is DataDome-protected). */
export async function fetchRaKrakowListings(
  page = 1,
  pageSize = 20,
): Promise<RaGraphqlListingRow[]> {
  const range = listingDateRange();
  const data = await postGraphql<{
    eventListings: { data: RaGraphqlListingRow[] };
  }>(EVENT_LISTINGS_QUERY, {
    filters: {
      areas: { eq: RA_KRAKOW_AREA_ID },
      listingDate: range,
    },
    filterOptions: { genre: true },
    page,
    pageSize,
  });

  return data.eventListings.data ?? [];
}

export async function fetchRaEventDetail(
  eventId: string,
): Promise<RaGraphqlEventDetail | null> {
  const data = await postGraphql<{ event: RaGraphqlEventDetail | null }>(
    EVENT_DETAIL_QUERY,
    { id: eventId },
  );
  return data.event;
}
