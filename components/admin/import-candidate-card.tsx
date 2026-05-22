"use client";

import { useTransition } from "react";
import {
  approveCandidateAction,
  rejectCandidateAction,
} from "@/app/admin/imports/actions";
import type { EventCandidateDbRow } from "@/lib/db/event-records";

type ImportCandidateCardProps = {
  candidate: EventCandidateDbRow;
  hasDuplicateTitle: boolean;
  createdLabel: string;
};

function previewText(text: string | null, max = 220): string {
  if (!text) return "—";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trimEnd()}…`;
}

export function ImportCandidateCard({
  candidate,
  hasDuplicateTitle,
  createdLabel,
}: ImportCandidateCardProps) {
  const [isPending, startTransition] = useTransition();
  const tags = candidate.tags?.filter(Boolean) ?? [];

  const run = (action: () => Promise<void>) => {
    startTransition(() => {
      void action();
    });
  };

  return (
    <article className="admin-candidate-card">
      <div className="admin-candidate-card-head">
        <div className="min-w-0 flex-1">
          <h2 className="admin-candidate-title">{candidate.title}</h2>
          <p className="admin-candidate-meta">
            {candidate.source_name ?? "Unknown source"} · {createdLabel}
          </p>
        </div>
        <span className="admin-quality-pill">{candidate.quality_score}</span>
      </div>

      {hasDuplicateTitle ? (
        <p className="admin-duplicate-warning" role="status">
          An event with this title is already published.
        </p>
      ) : null}

      <dl className="admin-candidate-fields">
        <div>
          <dt>Category</dt>
          <dd>{candidate.category || "—"}</dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd>{tags.length > 0 ? tags.join(", ") : "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt>Source</dt>
          <dd>
            {candidate.source_url ? (
              <a
                href={candidate.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-source-link"
              >
                {candidate.source_url}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt>Description</dt>
          <dd className="admin-description-preview">
            {previewText(candidate.description)}
          </dd>
        </div>
      </dl>

      <div className="admin-candidate-actions">
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => approveCandidateAction(candidate.id))}
          className="admin-btn admin-btn-approve"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => rejectCandidateAction(candidate.id))}
          className="admin-btn admin-btn-reject"
        >
          Reject
        </button>
      </div>
    </article>
  );
}
