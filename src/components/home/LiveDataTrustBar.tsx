"use client";

import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DataSourcePopover } from "@/components/trust/DataSourcePopover";
import { LastUpdated } from "@/components/trust/LastUpdated";
import { StaleDataAlert } from "@/components/trust/StaleDataAlert";
import { MethodologyDrawer } from "@/components/trust/MethodologyDrawer";
import { marketAggregateToRecords } from "@/lib/data/live-rates";
import { withEffectiveStatus } from "@/lib/data/freshness";
import {
  TRACKED_CZ_BANKS_COUNT,
  TRACKED_MARKETS_COUNT,
} from "@/lib/destination-metrics";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function LiveDataTrustBar({ className }: { className?: string }) {
  const { rates, loading } = useCurrentRates();
  const live = withEffectiveStatus(
    marketAggregateToRecords(rates).withInsurance
  );
  const status = live.status;
  const hasLive = status === "LIVE" && live.value != null;

  const rateLabel =
    hasLive && typeof live.value === "number"
      ? `od ${live.value.toFixed(2)} %`
      : null;

  return (
    <section
      aria-label="Stav hypotečních dat"
      className={cn("border-b border-border bg-white", className)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-3.5">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 sm:gap-8 lg:flex lg:flex-1 lg:gap-10">
          <li className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Sledované trhy
            </p>
            <p className="mt-0.5 font-heading text-xl font-bold tabular-nums text-text-dark sm:text-2xl">
              {TRACKED_MARKETS_COUNT}
            </p>
          </li>
          <li className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              CZ banky
            </p>
            <p className="mt-0.5 font-heading text-xl font-bold tabular-nums text-text-dark sm:text-2xl">
              {TRACKED_CZ_BANKS_COUNT}
            </p>
          </li>
          <li className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Stav dat
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {loading ? (
                <span className="text-sm text-muted-foreground">Načítám…</span>
              ) : (
                <>
                  <DataStatusBadge status={status} />
                  {rateLabel && (
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {rateLabel}
                    </span>
                  )}
                  <DataSourcePopover
                    record={live}
                    methodologyTopic="rates"
                    label="Zdroj"
                  />
                </>
              )}
            </div>
          </li>
          <li className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Poslední update
            </p>
            <div className="mt-1">
              <LastUpdated
                at={rates.updatedAt}
                status={status}
                label=""
                className="text-sm font-semibold text-text-dark [&_span]:hidden"
              />
            </div>
          </li>
        </ul>

        <div className="flex flex-wrap items-center gap-3">
          <MethodologyDrawer topic="rates" triggerLabel="Metodika" />
          <Link
            href={routes.metodika}
            className="shrink-0 text-sm font-medium text-deep-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
          >
            /metodika →
          </Link>
        </div>
      </div>
      {!loading && status === "STALE" && (
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <StaleDataAlert />
        </div>
      )}
    </section>
  );
}
