export const KARNET_FETCH_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "KrakowEventsImporter/1.0",
} as const;

/** Fetch a Karnet HTML page (listing or event detail). */
export async function fetchKarnetHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: KARNET_FETCH_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Karnet returned HTTP ${response.status} for ${url}`);
  }

  return response.text();
}
