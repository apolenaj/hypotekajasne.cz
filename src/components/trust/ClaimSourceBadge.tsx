"use client";

import { ExternalLink } from "lucide-react";
import { SourceEvidenceBadgeButton } from "@/components/trust/SourceEvidenceDrawer";
import { formatCzechDate } from "@/lib/data/freshness";
import {
  factClaimToLegalClaim,
  formatFactClaimValue,
} from "@/lib/sources/fact-claims-display";
import { factClaimToSourceEvidence } from "@/lib/sources/source-evidence";
import type { FactClaim } from "@/lib/sources/types";
import { cn } from "@/lib/utils";

/**
 * Viditelný mechanismus „Zdroj a ověření“ — vždy z FactClaim.
 * Klik na badge (Ověřeno / …) otevře SourceEvidenceDrawer.
 */
export function ClaimSourceBadge({
  fact,
  className,
  compact = false,
}: {
  fact: FactClaim;
  className?: string;
  compact?: boolean;
}) {
  const legal = factClaimToLegalClaim(fact);
  const evidence = factClaimToSourceEvidence(fact);
  const dateLabel = (() => {
    try {
      return formatCzechDate(legal.asOf);
    } catch {
      return legal.asOf;
    }
  })();

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-slate-50/80 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground",
        className
      )}
      role="note"
      aria-label="Zdroj a ověření"
    >
      <p className="font-semibold uppercase tracking-wide text-deep-teal">
        Zdroj a ověření
      </p>
      {!compact ? (
        <p className="mt-1 text-text-dark/90">{fact.claim}</p>
      ) : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <SourceEvidenceBadgeButton evidence={evidence} />
        <span>
          {fact.sourceName}
          {fact.sourceUrl ? (
            <>
              {" · "}
              <a
                href={fact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-deep-teal underline-offset-2 hover:underline"
              >
                primární zdroj <ExternalLink className="h-3 w-3" />
              </a>
            </>
          ) : (
            <span className="text-amber-800"> · URL k ručnímu ověření</span>
          )}
        </span>
        <span>
          ·{" "}
          {fact.status === "VERIFIED"
            ? `VERIFIED ${dateLabel}`
            : `Kontrola ${dateLabel}`}
        </span>
        {fact.value !== null && fact.value !== undefined ? (
          <span className="w-full font-medium text-text-dark">
            Hodnota: {formatFactClaimValue(fact)}
          </span>
        ) : null}
        {fact.notes ? (
          <span className="w-full text-muted-foreground/90">{fact.notes}</span>
        ) : null}
      </div>
    </div>
  );
}
