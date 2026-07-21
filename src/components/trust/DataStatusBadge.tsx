"use client";

import type { DataStatus } from "@/lib/data/types";
import { statusBadgeLabel, statusDescription } from "@/lib/data/display";
import { cn } from "@/lib/utils";

const TONE: Record<DataStatus, string> = {
  LIVE: "bg-deep-teal/10 text-deep-teal ring-deep-teal/20",
  VERIFIED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  MODEL: "bg-amber-50 text-amber-900 ring-amber-200",
  ESTIMATE: "bg-orange-50 text-orange-900 ring-orange-200",
  UNVERIFIED: "bg-rose-50 text-rose-800 ring-rose-200",
  PARTNER_QUOTE: "bg-muted-gold/25 text-text-dark ring-muted-gold/40",
  STALE: "bg-slate-100 text-slate-600 ring-slate-200",
};

type DataStatusBadgeProps = {
  status: DataStatus;
  className?: string;
  /** Zobrazit title s popisem */
  showTitle?: boolean;
  size?: "sm" | "md";
};

export function DataStatusBadge({
  status,
  className,
  showTitle = true,
  size = "sm",
}: DataStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold uppercase tracking-wide ring-1 ring-inset",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        TONE[status],
        className
      )}
      title={showTitle ? statusDescription(status) : undefined}
    >
      {statusBadgeLabel(status)}
    </span>
  );
}
