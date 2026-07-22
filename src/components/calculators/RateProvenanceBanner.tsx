"use client";

import type { ResolvedMortgageRate } from "@/lib/rates/resolve-engine";
import {
  rateUiBadgeClass,
  rateUiBadgeLabel,
} from "@/lib/rates/resolve-engine";
import { formatRate } from "@/lib/money";
import { cn } from "@/lib/utils";

export function RateProvenanceBanner({
  resolved,
  className,
}: {
  resolved: ResolvedMortgageRate;
  className?: string;
}) {
  const verifiedLabel = resolved.lastVerifiedAt
    ? new Date(resolved.lastVerifiedAt).toLocaleDateString("cs-CZ")
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        resolved.isModelFallback
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : resolved.uiKind === "LIVE"
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : resolved.uiKind === "STALE"
              ? "border-slate-300 bg-slate-50 text-slate-900"
              : "border-sky-200 bg-sky-50 text-sky-950",
        className
      )}
      role="status"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            rateUiBadgeClass(resolved.uiKind)
          )}
        >
          {rateUiBadgeLabel(resolved.uiKind)}
        </span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            resolved.isModelFallback && "text-amber-950"
          )}
        >
          {formatRate(resolved.ratePercent, {
            fractionDigits: 2,
            perAnnum: true,
          })}
          {resolved.isModelFallback ? " (model)" : null}
        </span>
        {verifiedLabel && (
          <span className="text-xs opacity-80">
            Poslední ověření: {verifiedLabel}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed opacity-90">
        {resolved.explanation}
      </p>
      {resolved.isModelFallback ? (
        <p className="mt-1 text-[11px] font-medium leading-snug">
          Modelová sazba není bankovní nabídka a nesmí se tak prezentovat.
        </p>
      ) : null}
    </div>
  );
}
