import { cn } from "@/lib/utils";
import {
  ANALYSIS_METHOD_DESCRIPTIONS,
  ANALYSIS_METHOD_LABELS,
  CLAIM_KIND_DESCRIPTIONS,
  CLAIM_KIND_LABELS,
  type AnalysisMethod,
  type ClaimKind,
} from "@/lib/property-rentgen/types";

const KIND_STYLES: Record<ClaimKind, string> = {
  DATA: "bg-emerald-100 text-emerald-900 border-emerald-200",
  MODEL: "bg-sky-100 text-sky-900 border-sky-200",
  ODHAD: "bg-amber-100 text-amber-950 border-amber-200",
  NEOVERENO: "bg-stone-200 text-stone-800 border-stone-300",
};

const METHOD_STYLES: Record<AnalysisMethod, string> = {
  automated_calculation: "bg-violet-100 text-violet-900 border-violet-200",
  ai_analysis: "bg-indigo-100 text-indigo-900 border-indigo-200",
  human_verification: "bg-rose-100 text-rose-900 border-rose-200",
};

export function ClaimBadge({
  kind,
  className,
}: {
  kind: ClaimKind;
  className?: string;
}) {
  return (
    <span
      title={CLAIM_KIND_DESCRIPTIONS[kind]}
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-[11px] font-semibold leading-tight",
        KIND_STYLES[kind],
        className
      )}
    >
      {CLAIM_KIND_LABELS[kind]}
    </span>
  );
}

export function MethodBadge({
  method,
  className,
}: {
  method: AnalysisMethod;
  className?: string;
}) {
  return (
    <span
      title={ANALYSIS_METHOD_DESCRIPTIONS[method]}
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-[10px] font-semibold leading-tight",
        METHOD_STYLES[method],
        className
      )}
    >
      {ANALYSIS_METHOD_LABELS[method]}
    </span>
  );
}

export function ClaimLegend({ className }: { className?: string }) {
  const kinds: ClaimKind[] = ["DATA", "MODEL", "ODHAD", "NEOVERENO"];
  const methods: AnalysisMethod[] = [
    "automated_calculation",
    "ai_analysis",
    "human_verification",
  ];
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-[#f7f8f7] p-4",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
        Typy údajů
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {kinds.map((k) => (
          <li key={k} className="flex items-start gap-2 text-xs text-muted-foreground">
            <ClaimBadge kind={k} className="mt-0.5" />
            <span>{CLAIM_KIND_DESCRIPTIONS[k]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-deep-teal">
        Metoda sekce reportu
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {methods.map((m) => (
          <li key={m} className="flex items-start gap-2 text-xs text-muted-foreground">
            <MethodBadge method={m} className="mt-0.5" />
            <span>{ANALYSIS_METHOD_DESCRIPTIONS[m]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
