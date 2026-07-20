"use client";

import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DataSourcePopover } from "@/components/trust/DataSourcePopover";
import { LastUpdated } from "@/components/trust/LastUpdated";
import { StaleDataAlert } from "@/components/trust/StaleDataAlert";
import { resolveEffectiveStatus } from "@/lib/data/freshness";
import type { ProvenanceFields } from "@/lib/data/provenance";
import type { MethodologyTopic } from "@/lib/data/provenance";
import { cn } from "@/lib/utils";

type ProvenanceInlineProps = {
  record: ProvenanceFields;
  methodologyTopic?: MethodologyTopic;
  className?: string;
  showAlert?: boolean;
  showUpdated?: boolean;
};

/**
 * Kompaktní řádek: badge + popover + last updated (+ STALE alert).
 */
export function ProvenanceInline({
  record,
  methodologyTopic = "general",
  className,
  showAlert = true,
  showUpdated = true,
}: ProvenanceInlineProps) {
  const { effectiveStatus, isStaleByAge, referenceAt } =
    resolveEffectiveStatus(record);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <DataStatusBadge status={effectiveStatus} />
        <DataSourcePopover
          record={{ ...record, status: effectiveStatus }}
          methodologyTopic={methodologyTopic}
        />
        {showUpdated && (
          <LastUpdated at={referenceAt} status={effectiveStatus} />
        )}
      </div>
      {showAlert && effectiveStatus === "STALE" && (
        <StaleDataAlert
          message={
            isStaleByAge
              ? "Data jsou starší, než očekáváme — ověřujeme je. Čísla si nevymýšlíme."
              : undefined
          }
        />
      )}
    </div>
  );
}
