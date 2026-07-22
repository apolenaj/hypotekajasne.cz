"use client";

import { Shield, ShieldOff } from "lucide-react";
import { CALCULATOR_DISCLAIMER } from "@/components/calculators/CalculatorDisclaimer";
import { RpsnDisplay } from "@/components/calculators/RpsnDisplay";
import { formatRateOrOnRequest } from "@/lib/format-rate";
import { missingDataLabel } from "@/lib/data/display";
import { LIVE_RATES_UNAVAILABLE_MESSAGE } from "@/lib/rates/types";
import { cn } from "@/lib/utils";

type InsuranceRateCardsProps = {
  hasInsurance: boolean;
  onSelect: (hasInsurance: boolean) => void;
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  rpsnWithInsurance?: number | null;
  rpsnWithoutInsurance?: number | null;
  /** Zobrazit „*orientačně“ u sazby bez pojištění */
  withoutRateOrientational?: boolean;
  paymentWithInsurance?: string | null;
  paymentWithoutInsurance?: string | null;
  loading?: boolean;
  className?: string;
};

export function InsuranceRateCards({
  hasInsurance,
  onSelect,
  rateWithInsurance,
  rateWithoutInsurance,
  rpsnWithInsurance,
  rpsnWithoutInsurance,
  withoutRateOrientational = false,
  paymentWithInsurance,
  paymentWithoutInsurance,
  loading = false,
  className,
}: InsuranceRateCardsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text-dark">
          Pojištění schopnosti splácet
        </p>
        {loading ? (
          <span className="text-xs text-muted-foreground animate-pulse">
            Načítám aktuální sazby…
          </span>
        ) : rateWithInsurance == null && rateWithoutInsurance == null ? (
          <span className="text-xs text-amber-800">
            {LIVE_RATES_UNAVAILABLE_MESSAGE}
          </span>
        ) : null}      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelect(true)}
          className={cn(
            "text-left rounded-2xl border-2 p-4 transition-all",
            hasInsurance
              ? "border-emerald-600 bg-emerald-50 shadow-sm ring-1 ring-emerald-600/20"
              : "border-gray-200 bg-white/70 hover:border-emerald-300"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                hasInsurance
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-100 text-emerald-700"
              )}
            >
              <Shield className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 leading-snug">
                Měsíční splátka s pojištěním
              </p>
              <p className="mt-1 text-xs text-emerald-800 font-medium">
                {rateWithInsurance != null
                  ? `od ${formatRateOrOnRequest(rateWithInsurance)}`
                  : missingDataLabel(null)}
              </p>
              <RpsnDisplay
                rpsn={rpsnWithInsurance ?? null}
                compact
                className="mt-0.5"
              />
              {paymentWithInsurance && (
                <p className="mt-2 text-lg font-black text-emerald-900 tabular-nums">
                  {paymentWithInsurance}
                  {paymentWithInsurance !== "Individuálně" && (
                    <span className="text-xs font-semibold text-emerald-700/80">
                      {" "}
                      / měs.
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect(false)}
          className={cn(
            "text-left rounded-2xl border-2 p-4 transition-all",
            !hasInsurance
              ? "border-deep-teal bg-deep-teal/5 shadow-sm ring-1 ring-deep-teal/20"
              : "border-gray-200 bg-white/70 hover:border-deep-teal/40"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                !hasInsurance
                  ? "bg-deep-teal text-white"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              <ShieldOff className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 leading-snug">
                Měsíční splátka bez pojištění
              </p>
              <p className="mt-1 text-xs text-deep-teal font-medium">
                {rateWithoutInsurance != null
                  ? `od ${formatRateOrOnRequest(rateWithoutInsurance, {
                      orientational: withoutRateOrientational,
                    })}`
                  : missingDataLabel(null)}
              </p>
              <RpsnDisplay
                rpsn={rpsnWithoutInsurance ?? null}
                compact
                className="mt-0.5"
              />
              {paymentWithoutInsurance && (
                <p className="mt-2 text-lg font-black text-deep-teal tabular-nums">
                  {paymentWithoutInsurance}
                  {paymentWithoutInsurance !== "Individuálně" && (
                    <span className="text-xs font-semibold text-deep-teal/70">
                      {" "}
                      / měs.
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-gray-400">
        {CALCULATOR_DISCLAIMER}
      </p>
    </div>
  );
}
