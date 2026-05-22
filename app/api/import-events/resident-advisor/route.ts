import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { saveRaCandidates } from "@/lib/importers/ra-candidates";
import { importRaEvents } from "@/lib/importers/ra";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
/** RA GraphQL listing + up to 10 detail queries. */
export const maxDuration = 60;

type RaImportErrorDebug = {
  message: string;
  name?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorDebug(err: unknown): RaImportErrorDebug {
  const debug: RaImportErrorDebug = {
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
    const parsedItems = await importRaEvents(10);
    const supabase = createClient(await cookies());
    const { parsed, inserted, skipped, candidates } =
      await saveRaCandidates(supabase, parsedItems);

    return NextResponse.json({
      ok: true,
      parsed,
      inserted,
      skipped,
      candidates,
    });
  } catch (err) {
    console.error("[import-events/resident-advisor]", err);
    const debug = getErrorDebug(err);
    return NextResponse.json(
      { ok: false, error: debug.message, debug },
      { status: 500 },
    );
  }
}
