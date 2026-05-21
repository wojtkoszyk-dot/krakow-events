/**
 * Copies *.integrated.tsx/ts over canonical paths after closing editors / dev server.
 * Run: node scripts/finalize-refactor.mjs
 */
import { copyFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

const pairs = [
  ["components/events-app.integrated.tsx", "components/events-app.tsx"],
  ["components/site-header.integrated.tsx", "components/site-header.tsx"],
  ["components/date-segment-control.integrated.tsx", "components/date-segment-control.tsx"],
  ["components/date-picker-popover.integrated.tsx", "components/date-picker-popover.tsx"],
  ["components/event-card.integrated.tsx", "components/event-card.tsx"],
  ["components/event-modal.integrated.tsx", "components/event-modal.tsx"],
  ["components/saved-panel.integrated.tsx", "components/saved-panel.tsx"],
  ["components/surprise-me-cta.integrated.tsx", "components/surprise-me-cta.tsx"],
  ["hooks/use-user-history.integrated.ts", "hooks/use-user-history.ts"],
  ["app/layout.integrated.tsx", "app/layout.tsx"],
];

for (const [src, dest] of pairs) {
  const from = join(root, src);
  const to = join(root, dest);
  if (!existsSync(from)) {
    console.warn("skip (missing):", src);
    continue;
  }
  copyFileSync(from, to);
  console.log("copied:", dest);
}

const cleanup = [
  "lib/i18n/locale-context-patch.ts",
  ...pairs.map(([src]) => join(root, src)),
];

for (const file of cleanup) {
  if (existsSync(file)) {
    try {
      unlinkSync(file);
      console.log("removed:", file.replace(root, ""));
    } catch {
      /* optional */
    }
  }
}

console.log("Done. Update app/page.tsx if it still imports events-app (not .integrated).");
