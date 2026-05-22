export const KRAKOW_TRAVEL_FETCH_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "KrakowEventsImporter/1.0",
} as const;

/** Fetch a Krakow Travel HTML page (listing or event detail). */
export async function fetchKrakowTravelHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: KRAKOW_TRAVEL_FETCH_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Krakow Travel returned HTTP ${response.status} for ${url}`,
    );
  }

  return response.text();
}
