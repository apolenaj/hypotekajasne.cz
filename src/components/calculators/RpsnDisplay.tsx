"use client";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DataSourcePopover } from "@/components/trust/DataSourcePopover";
import { missingDataLabel } from "@/lib/data/display";
import { toProvenanceFields } from "@/lib/data/provenance";
import { resolveEffectiveStatus } from "@/lib/data/freshness";
import type { DataStatus } from "@/lib/data/types";
import { formatRate } from "@/lib/money";
import { cn } from "@/lib/utils";

export const RPSN_TOOLTIP =
  "RPSN (Roční procentní sazba nákladů) ukazuje celkové náklady na úvěr za jeden rok. Zahrnuje nejen samotný úrok, ale i všechny související poplatky (za odhad nemovitosti, zpracování úvěru, vedení účtu atd.). Číslo je orientační a přesná hodnota závisí na finální výši úvěru.";

type RpsnDisplayProps = {
  rpsn: number | null | undefined;
  className?: string;
  compact?: boolean;
  /** Timestamp ze scrape — pro freshness */
  updatedAt?: string | null;
  sourceUrl?: string | null;
  declaredStatus?: DataStatus;
};

export function RpsnDisplay({
  rpsn,
  className,
  compact = false,
  updatedAt = null,
  sourceUrl = null,
  declaredStatus,
}: RpsnDisplayProps) {
  const hasValue = rpsn != null && Number.isFinite(rpsn);
  const record = toProvenanceFields({
    id: "rpsn.display",
    value: hasValue ? rpsn : null,
    unit: "percent_pa",
    country: "cz",
    source: sourceUrl ?? "Oficiální weby českých bank",
    sourceUrl,
    sourceType: "supabase",
    status: declaredStatus ?? (hasValue ? "LIVE" : "STALE"),
    confidence: hasValue ? 0.8 : 0,
    lastFetchedAt: updatedAt,
    notes: hasValue
      ? null
      : "RPSN chybí ve zdroji — Neinventujeme.",
  });
  const { effectiveStatus } = resolveEffectiveStatus(record);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-gray-500",
        compact ? "text-[11px] leading-snug" : "text-sm",
        className
      )}
    >
      <span className="min-w-0">
        {hasValue ? (
          <>RPSN: {formatRate(rpsn!, { fractionDigits: 2 })}</>
        ) : (
          <>RPSN: {missingDataLabel(effectiveStatus)}</>
        )}
      </span>
      <DataStatusBadge status={effectiveStatus} />
      <DataSourcePopover
        record={{ ...record, status: effectiveStatus }}
        methodologyTopic="rpsn"
        label="Zdroj"
      />
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/30"
          aria-label="Co je RPSN?"
        >
          <HelpCircle className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] bg-gray-900 px-3.5 py-2.5 text-left text-xs leading-relaxed text-white shadow-lg"
        >
          {RPSN_TOOLTIP}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
