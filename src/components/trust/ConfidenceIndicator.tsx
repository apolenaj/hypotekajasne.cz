"use client";

import { useId } from "react";
import type { DataStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type ConfidenceIndicatorProps = {
  /** 0–1 */
  confidence: number;
  status?: DataStatus;
  className?: string;
  showLabel?: boolean;
};

export function ConfidenceIndicator({
  confidence,
  status,
  className,
  showLabel = true,
}: ConfidenceIndicatorProps) {
  const id = useId();
  const clamped = Math.max(0, Math.min(1, confidence));
  const pct = Math.round(clamped * 100);

  // MODELLED max visual cue — never imply bank-grade confidence
  const capped =
    status === "MODELLED" ? Math.min(clamped, 0.6) : clamped;
  const displayPct = Math.round(capped * 100);

  return (
    <div className={cn("min-w-[7rem]", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>Důvěra</span>
          <span className="tabular-nums font-semibold text-text-dark">
            {displayPct}&nbsp;%
          </span>
        </div>
      )}
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={displayPct}
        aria-labelledby={id}
        className="h-1.5 overflow-hidden rounded-full bg-slate-200"
      >
        <span id={id} className="sr-only">
          Confidence {pct} percent
          {status === "MODELLED" ? " (model capped)" : ""}
        </span>
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            status === "STALE"
              ? "bg-slate-400"
              : status === "MODELLED"
                ? "bg-amber-500"
                : status === "LIVE"
                  ? "bg-deep-teal"
                  : "bg-muted-gold"
          )}
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  );
}
