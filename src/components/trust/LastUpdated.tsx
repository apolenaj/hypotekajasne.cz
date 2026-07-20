"use client";

import { formatCzechDateTime } from "@/lib/data/freshness";
import { missingDataLabel } from "@/lib/data/display";
import type { DataStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type LastUpdatedProps = {
  at: string | null | undefined;
  status?: DataStatus | null;
  label?: string;
  className?: string;
  /** compact = jedna řádka */
  compact?: boolean;
};

export function LastUpdated({
  at,
  status,
  label = "Aktualizováno",
  className,
  compact = true,
}: LastUpdatedProps) {
  const formatted =
    at && !Number.isNaN(Date.parse(at))
      ? formatCzechDateTime(at)
      : status === "STALE"
        ? missingDataLabel("STALE")
        : "—";

  return (
    <p
      className={cn(
        "text-xs text-muted-foreground",
        compact ? "inline-flex flex-wrap items-baseline gap-x-1" : "block",
        className
      )}
    >
      <span className="font-medium text-text-dark/70">{label}:</span>
      <time
        dateTime={at && !Number.isNaN(Date.parse(at)) ? at : undefined}
        className="tabular-nums"
      >
        {formatted}
      </time>
    </p>
  );
}
