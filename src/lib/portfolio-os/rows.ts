import { calculateAnnuityPayment } from "@/lib/calculators";
import {
  computeTwinSnapshot,
  selectLatestMortgageBalance,
  selectLatestValueObservation,
} from "@/lib/digital-twin/compute";
import { compositeRiskScore, dataCompletenessFromInput } from "@/lib/digital-twin/scores";
import type { PropertyDigitalTwin } from "@/lib/digital-twin/types";
import type { PortfolioPropertyRow } from "@/lib/portfolio-os/types";

function latestRent(twin: PropertyDigitalTwin) {
  return [...twin.rentHistory].sort(
    (a, b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom)
  )[0];
}

export function buildPortfolioPropertyRows(
  twins: PropertyDigitalTwin[],
  currentMarketRatePercent: number | null
): PortfolioPropertyRow[] {
  return twins
    .filter((t) => t.relationship === "owned")
    .map((twin) => {
      const snap = computeTwinSnapshot(twin, { currentMarketRatePercent });
      const valueObs = selectLatestValueObservation(twin.valueHistory);
      const balance = selectLatestMortgageBalance(twin);
      const rent = latestRent(twin);
      const payment = twin.financing.monthlyPaymentCzk;
      const annualRent = rent ? rent.rentMonthlyCzk * 12 : null;
      const annualExpenses = twin.expenses
        .filter((e) => Date.parse(e.date) >= Date.now() - 365 * 86_400_000)
        .reduce((s, e) => s + e.amountCzk, 0);
      const annualDebt = payment != null ? payment * 12 : null;
      const netCf =
        annualRent != null && annualDebt != null
          ? (annualRent - annualExpenses - annualDebt) / 12
          : null;

      const grossYield =
        valueObs && rent && valueObs.valueCzk > 0
          ? (rent.rentMonthlyCzk * 12) / valueObs.valueCzk
          : null;

      const ltv =
        snap.estimatedLtv.value != null ? snap.estimatedLtv.value : null;
      const discount = null;

      const risk = compositeRiskScore({
        dscr: snap.estimatedLtv.value != null && payment
          ? (annualRent ?? 0) / (payment * 12)
          : null,
        monthlyCashFlow: netCf ?? 0,
        ltv: ltv ?? 0,
        renovationNeed:
          twin.renovations.some((x) => x.completedAt) ? "light" : "unknown",
        dataCompleteness: dataCompletenessFromInput({
          areaM2: twin.location.areaM2 ?? 0,
          priceCzk: twin.purchase.purchasePriceCzk ?? 0,
          rentMonthlyCzk: rent?.rentMonthlyCzk ?? null,
          equityCzk: null,
          renovationNeed: "unknown",
        }),
        discountPremiumPct: discount,
      });

      const fixation =
        twin.financing.fixationEnd ??
        twin.keyDates.find((k) => k.kind === "fixation_end")?.date ??
        null;

      return {
        twinId: twin.id,
        label: twin.label,
        city: twin.location.city,
        country: twin.location.country,
        propertyType: twin.location.propertyType,
        valueCzk: valueObs?.valueCzk ?? null,
        equityCzk: snap.currentEquity.value,
        debtCzk: balance?.balanceCzk ?? null,
        monthlyGrossRentCzk: rent?.rentMonthlyCzk ?? null,
        monthlyNetCashFlowCzk: netCf,
        monthlyDebtServiceCzk: payment,
        grossYieldPct: grossYield,
        fixationEnd: fixation,
        riskScore: risk,
        valueBlockers: snap.currentEquity.blockers,
      };
    });
}

/** Recompute debt service if rate shifts by deltaPp on remaining balance */
export function stressedDebtService(
  row: PortfolioPropertyRow,
  twin: PropertyDigitalTwin,
  rateDeltaPp: number
): number | null {
  const balance = row.debtCzk;
  const rate = twin.financing.ratePercent;
  const term = twin.financing.termYears;
  if (balance == null || rate == null || term == null) return row.monthlyDebtServiceCzk;
  const newRate = rate + rateDeltaPp;
  if (newRate <= 0) return row.monthlyDebtServiceCzk;
  return Math.round(calculateAnnuityPayment(balance, newRate, term));
}

export type { PropertyDigitalTwin };
