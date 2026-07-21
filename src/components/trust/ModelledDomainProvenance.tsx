"use client";

import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DataSourcePopover } from "@/components/trust/DataSourcePopover";
import { toProvenanceFields } from "@/lib/data/provenance";

/** Provenience pro historické / predikční / výnosové MODEL údaje. */
export function ModelledDomainProvenance({
  topic,
  label,
  source,
  notes,
}: {
  topic: "historical" | "predictions" | "yields" | "prices" | "legal";
  label?: string;
  source: string;
  notes?: string;
}) {
  const record = toProvenanceFields({
    id: `domain.${topic}`,
    value: null,
    unit: "other",
    country: "multi",
    source,
    sourceType: "model",
    status: topic === "legal" ? "ESTIMATE" : "MODEL",
    confidence: topic === "legal" ? 0.55 : 0.4,
    lastVerifiedAt: "2026-04-01",
    notes:
      notes ??
      (topic === "legal"
        ? "Editorial odhad — bez plné externí provenance není Ověřeno."
        : "Orientační model — není aktuální tržní kotace."),
  });

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white/90 px-2.5 py-1.5">
      <DataStatusBadge status={record.status} />
      <DataSourcePopover
        record={record}
        methodologyTopic={topic}
        label={label ?? "Zdroj"}
      />
    </div>
  );
}
