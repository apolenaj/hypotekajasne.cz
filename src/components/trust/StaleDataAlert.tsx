"use client";

import { AlertTriangle } from "lucide-react";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { cn } from "@/lib/utils";

type StaleDataAlertProps = {
  message?: string;
  className?: string;
};

export function StaleDataAlert({
  message = "Data jsou neaktuální nebo chybí timestamp. Neinventujeme hodnoty — ověřujeme zdroj.",
  className,
}: StaleDataAlertProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950",
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="mb-1">
          <DataStatusBadge status="STALE" />
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}
