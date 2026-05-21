import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { saveKarnetCandidates } from "@/lib/importers/karnet-candidates";
import { KARNET_EVENTS_URL, parseKarnetEventsHtml } from "@/lib/importers/karnet";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type KarnetImportErrorDebug = {
  message: string;
  name?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorDebug(err: unknown): KarnetImportErrorDebug {
  const debug: KarnetImportErrorDebug = {
    message:
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Unknown error",
  };

  if (err instanceof Error) {
    debug.name = err.name;
  }

  if (isRecord(err)) {
    if (typeof err.code === "string") {
      debug.code = err.code;
    }
    if (typeof err.details === "string") {
      debug.details = err.details;
    }
    if (typeof err.hint === "string") {
      debug.hint = err.hint;
    }
  }

  return debug;
}

export async function GET() {
  try {
    const response = await fetch(KARNET_EVENTS_URL, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "KrakowEventsImporter/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Karnet returned HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const html = await response.text();
    const parsedItems = parseKarnetEventsHtml(html, 10);
    const supabase = createClient(await cookies());
    const { parsed, inserted, skipped, candidates } =
      await saveKarnetCandidates(supabase, parsedItems);

    return NextResponse.json({
      ok: true,
      parsed,
      inserted,
      skipped,
      candidates,
    });
  } catch (err) {
    console.error("[import-events/karnet]", err);
    const debug = getErrorDebug(err);
    return NextResponse.json(
      { ok: false, error: debug.message, debug },
      { status: 500 },
    );
  }
}
