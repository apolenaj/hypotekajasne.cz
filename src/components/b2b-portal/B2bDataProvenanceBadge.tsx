import { cn } from "@/lib/utils";
import {
  DATA_PROVENANCE_LABELS,
  type DataProvenanceKind,
} from "@/lib/b2b-portal/types";

const STYLES: Record<DataProvenanceKind, string> = {
  independent_data: "bg-emerald-100 text-emerald-900 border-emerald-300",
  partner_provided: "bg-violet-100 text-violet-900 border-violet-300",
  modelled_estimate: "bg-sky-100 text-sky-900 border-sky-300",
};

export function B2bDataProvenanceBadge({
  kind,
  className,
}: {
  kind: DataProvenanceKind;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        STYLES[kind],
        className
      )}
    >
      {DATA_PROVENANCE_LABELS[kind]}
    </span>
  );
}

export function B2bDataProvenanceLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-xl border border-border bg-white p-3",
        className
      )}
    >
      <p className="w-full text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        Provenance dat v B2B portálu
      </p>
      {(["independent_data", "partner_provided", "modelled_estimate"] as const).map(
        (k) => (
          <B2bDataProvenanceBadge key={k} kind={k} />
        )
      )}
    </div>
  );
}
