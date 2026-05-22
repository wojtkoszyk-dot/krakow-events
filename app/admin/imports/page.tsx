import Link from "next/link";
import { ImportCandidateCard } from "@/components/admin/import-candidate-card";
import {
  getDuplicateEventTitles,
  getPendingCandidates,
} from "@/lib/moderation";

export const dynamic = "force-dynamic";

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(iso));
}

export default async function AdminImportsPage() {
  let candidates: Awaited<ReturnType<typeof getPendingCandidates>> = [];
  let loadError: string | null = null;

  try {
    candidates = await getPendingCandidates();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load candidates";
  }

  const duplicateTitles = loadError
    ? new Set<string>()
    : await getDuplicateEventTitles(candidates.map((c) => c.title));

  return (
    <div className="app-shell min-h-full">
      <main className="app-container mx-auto w-full px-4 py-5 pb-16 md:py-6">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Moderation</p>
            <h1 className="admin-page-title">Import queue</h1>
            <p className="admin-page-subtitle">
              Review imported candidates before they go live on the public feed.
            </p>
          </div>
          <Link href="/" className="admin-back-link">
            ← Back to app
          </Link>
        </header>

        {loadError ? (
          <div className="admin-empty admin-empty-error">
            <p className="admin-empty-title">Could not load queue</p>
            <p className="admin-empty-hint">{loadError}</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">Nothing to review</p>
            <p className="admin-empty-hint">
              Pending imports will show up here after Karnet (or other sources)
              are ingested.
            </p>
          </div>
        ) : (
          <>
            <p className="admin-queue-count">
              {candidates.length} pending
              {candidates.length === 1 ? " candidate" : " candidates"}
            </p>
            <ul className="admin-candidate-list">
              {candidates.map((candidate) => (
                <li key={candidate.id}>
                  <ImportCandidateCard
                    candidate={candidate}
                    hasDuplicateTitle={duplicateTitles.has(candidate.title)}
                    createdLabel={formatCreatedAt(candidate.created_at)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
