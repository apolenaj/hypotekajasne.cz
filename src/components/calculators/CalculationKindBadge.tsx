"use client";

import {
  CALCULATION_KIND_META,
  type CalculationKind,
} from "@/lib/finance-math/kinds";
import { cn } from "@/lib/utils";

const KIND_STYLE: Record<CalculationKind, string> = {
  exact: "border-emerald-200 bg-emerald-50 text-emerald-950",
  model: "border-amber-200 bg-amber-50 text-amber-950",
  external: "border-sky-200 bg-sky-50 text-sky-950",
};

/**
 * Distinguishes exact calculation vs model assumption vs external data on results.
 */
export function CalculationKindBadge({
  kind,
  className,
  showDescription = false,
}: {
  kind: CalculationKind;
  className?: string;
  showDescription?: boolean;
}) {
  const meta = CALCULATION_KIND_META[kind];
  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-xs",
        KIND_STYLE[kind],
        className
      )}
      role="status"
    >
      <span className="font-semibold uppercase tracking-wide">
        {meta.shortCs}
      </span>
      <span className="mx-1.5 opacity-40">·</span>
      <span className="font-medium">{meta.labelCs}</span>
      {showDescription && (
        <p className="mt-1 text-[11px] leading-snug opacity-90">
          {meta.descriptionCs}
        </p>
      )}
    </div>
  );
}

export function CalculationKindLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3",
        className
      )}
      aria-label="Legenda typu výpočtu"
    >
      {(["exact", "model", "external"] as CalculationKind[]).map((kind) => (
        <CalculationKindBadge key={kind} kind={kind} showDescription />
      ))}
    </div>
  );
}
