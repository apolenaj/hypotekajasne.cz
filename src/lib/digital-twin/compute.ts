/**
 * Property Digital Twin — derived metrics (pure functions).
 * Returns null + blockers when inputs missing — never invents value.
 */

import type {
  ComputedMetric,
  EstimatedValueObservation,
  PropertyDigitalTwin,
  RefinanceOpportunitySignal,
  TwinComputedSnapshot,
} from "@/lib/digital-twin/types";

export type TwinComputeContext = {
  now?: Date;
  /** Platform model mortgage rate % — for refinance signal only */
  currentMarketRatePercent: number | null;
};

function blockers(...msgs: string[]): string[] {
  return msgs.filter(Boolean);
}

function metric(
  value: number | null,
  formula: string,
  inputsUsed: string[],
  blockersList: string[],
  claimKind: "DATA" | "MODEL" | "ODHAD" | "NEOVERENO" = "MODEL"
): ComputedMetric {
  return {
    value,
    claimKind: blockersList.length > 0 && value == null ? "NEOVERENO" : claimKind,
    computedAt: new Date().toISOString(),
    formula,
    inputsUsed,
    blockers: blockersList,
  };
}

/**
 * Latest value observation by observedAt — NOT “most optimistic”.
 * Returns null if history empty.
 */
export function selectLatestValueObservation(
  history: EstimatedValueObservation[]
): EstimatedValueObservation | null {
  if (history.length === 0) return null;
  return [...history].sort(
    (a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt)
  )[0]!;
}

export function selectLatestMortgageBalance(
  twin: PropertyDigitalTwin
): { balanceCzk: number; asOf: string } | null {
  const h = twin.mortgageBalanceHistory;
  if (h.length === 0) {
    if (twin.financing.loanAmountCzk != null) {
      return {
        balanceCzk: twin.financing.loanAmountCzk,
        asOf: twin.financing.updatedAt ?? twin.updatedAt,
      };
    }
    return null;
  }
  const latest = [...h].sort(
    (a, b) => Date.parse(b.asOf) - Date.parse(a.asOf)
  )[0]!;
  return { balanceCzk: latest.balanceCzk, asOf: latest.asOf };
}

export function computeCurrentEquity(
  twin: PropertyDigitalTwin
): ComputedMetric {
  const latestValue = selectLatestValueObservation(twin.valueHistory);
  const balance = selectLatestMortgageBalance(twin);
  const block: string[] = [];
  if (!latestValue) {
    block.push("Chybí valueHistory — nezobrazujeme odhad equity.");
  }
  if (!balance) {
    block.push("Chybí zůstatek hypotéky (history nebo financing.loanAmount).");
  }
  if (block.length > 0) {
    return metric(null, "equity = latestValue − mortgageBalance", [], block);
  }
  const equity = latestValue!.valueCzk - balance!.balanceCzk;
  return metric(
    Math.round(equity),
    "equity = latestValueObservation.valueCzk − latestMortgageBalance",
    [
      `value:${latestValue!.id}@${latestValue!.observedAt}`,
      `balance@${balance!.asOf}`,
    ],
    [],
    latestValue!.claimKind === "DATA" ? "DATA" : "MODEL"
  );
}

export function computeEstimatedLtv(twin: PropertyDigitalTwin): ComputedMetric {
  const latestValue = selectLatestValueObservation(twin.valueHistory);
  const balance = selectLatestMortgageBalance(twin);
  const block: string[] = [];
  if (!latestValue) block.push("LTV vyžaduje platnou value observation.");
  if (!balance) block.push("LTV vyžaduje zůstatek úvěru.");
  if (block.length > 0) {
    return metric(null, "ltv = balance / value", [], block);
  }
  const ltv = balance!.balanceCzk / latestValue!.valueCzk;
  return metric(
    Math.round(ltv * 1000) / 1000,
    "ltv = mortgageBalance / latestValueObservation",
    [`value:${latestValue!.id}`, `balance@${balance!.asOf}`],
    [],
    "MODEL"
  );
}

export function computeCashOnCashReturn(
  twin: PropertyDigitalTwin,
  annualNetCashFlowCzk: number | null
): ComputedMetric {
  const equity = computeCurrentEquity(twin);
  if (equity.value == null || equity.value <= 0) {
    return metric(
      null,
      "coc = annualNetCashFlow / equityInvested",
      equity.inputsUsed,
      [...equity.blockers, "Chybí roční net cash flow."],
      "NEOVERENO"
    );
  }
  if (annualNetCashFlowCzk == null) {
    return metric(
      null,
      "coc = annualNetCashFlow / equityInvested",
      equity.inputsUsed,
      ["annualNetCashFlow — doplnit z rent/expenses nebo investment engine."],
      "NEOVERENO"
    );
  }
  return metric(
    Math.round((annualNetCashFlowCzk / equity.value) * 1000) / 1000,
    "cashOnCash = annualNetCashFlow / currentEquity",
    [...equity.inputsUsed, "annualNetCashFlow"],
    [],
    "MODEL"
  );
}

export function computeRentGrowthYoy(twin: PropertyDigitalTwin): ComputedMetric {
  const rents = [...twin.rentHistory].sort(
    (a, b) => Date.parse(a.effectiveFrom) - Date.parse(b.effectiveFrom)
  );
  if (rents.length < 2) {
    return metric(
      null,
      "rentGrowthYoy = (rent_now − rent_12m_ago) / rent_12m_ago",
      [],
      ["Potřeba alespoň 2 rent observations v historii."],
      "NEOVERENO"
    );
  }
  const now = rents.at(-1)!;
  const yearAgo = new Date(Date.parse(now.effectiveFrom));
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const prior = [...rents]
    .reverse()
    .find((r) => Date.parse(r.effectiveFrom) <= yearAgo.getTime());
  if (!prior) {
    return metric(
      null,
      "rentGrowthYoy",
      [now.id],
      ["Chybí nájem starší ~12 měsíců."],
      "NEOVERENO"
    );
  }
  const growth = (now.rentMonthlyCzk - prior.rentMonthlyCzk) / prior.rentMonthlyCzk;
  return metric(
    Math.round(growth * 1000) / 1000,
    "rentGrowthYoy",
    [prior.id, now.id],
    [],
    "DATA"
  );
}

export function computeMaintenanceBurden(twin: PropertyDigitalTwin): ComputedMetric {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  const repairSum = twin.repairs
    .filter((r) => Date.parse(r.date) >= yearStart)
    .reduce((s, r) => s + r.costCzk, 0);
  const expenseSum = twin.expenses
    .filter(
      (e) =>
        Date.parse(e.date) >= yearStart &&
        (e.category === "other" || e.category === "hoa")
    )
    .reduce((s, e) => s + e.amountCzk, 0);
  const latestRent = [...twin.rentHistory].sort(
    (a, b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom)
  )[0];
  const annualRent = latestRent ? latestRent.rentMonthlyCzk * 12 : null;
  if (annualRent == null || annualRent <= 0) {
    return metric(
      null,
      "maintenanceBurden = (repairs + maint expenses) / annualRent",
      [],
      ["Chybí nájem pro normalizaci maintenance burden."],
      "NEOVERENO"
    );
  }
  const burden = (repairSum + expenseSum) / annualRent;
  return metric(
    Math.round(burden * 1000) / 1000,
    "maintenanceBurden = YTD repairs+expenses / annualRent",
    [`repairs:${repairSum}`, `expenses:${expenseSum}`, `annualRent:${annualRent}`],
    [],
    repairSum + expenseSum > 0 ? "DATA" : "ODHAD"
  );
}

export function computeRefinanceOpportunity(
  twin: PropertyDigitalTwin,
  ctx: TwinComputeContext
): RefinanceOpportunitySignal {
  const fixation = twin.financing.fixationEnd ?? twin.keyDates.find((k) => k.kind === "fixation_end")?.date ?? null;
  const currentRate = twin.financing.ratePercent;
  const market = ctx.currentMarketRatePercent;
  const block: string[] = [];

  if (currentRate == null) block.push("Chybí sazba ve financing snapshot.");
  if (market == null) block.push("Chybí modelová tržní sazba platformy.");
  if (twin.relationship !== "owned") {
    block.push("Refinance signal jen pro owned twins.");
  }

  if (block.length > 0) {
    return {
      eligible: false,
      claimKind: "NEOVERENO",
      summary: "Refinance opportunity nelze vyhodnotit — chybí vstupy.",
      fixationEnd: fixation,
      rateDeltaPp: null,
      estimatedMonthlySavingCzk: null,
      blockers: block,
    };
  }

  const delta = currentRate! - market!;
  const monthsToFixation = fixation
    ? (Date.parse(fixation) - (ctx.now ?? new Date()).getTime()) / (30 * 86_400_000)
    : null;

  const eligible =
    delta >= 0.5 || (monthsToFixation != null && monthsToFixation <= 6 && delta >= 0.25);

  const payment = twin.financing.monthlyPaymentCzk;
  const saving =
    payment != null && delta > 0
      ? Math.round(payment * (delta / currentRate!) * 0.35)
      : null;

  return {
    eligible,
    claimKind: "MODEL",
    summary: eligible
      ? `Model naznačuje okno refinancování (Δ sazby ~${delta.toFixed(2)} p.b.).`
      : "Refinance zatím není modelově prioritní.",
    fixationEnd: fixation,
    rateDeltaPp: Math.round(delta * 100) / 100,
    estimatedMonthlySavingCzk: saving,
    blockers: [],
  };
}

/**
 * Full snapshot for dashboard / Copilot consumption.
 */
export function computeTwinSnapshot(
  twin: PropertyDigitalTwin,
  ctx: TwinComputeContext = { currentMarketRatePercent: null }
): TwinComputedSnapshot {
  const latestValue = selectLatestValueObservation(twin.valueHistory);
  const equity = computeCurrentEquity(twin);
  const ltv = computeEstimatedLtv(twin);

  const latestRent = [...twin.rentHistory].sort(
    (a, b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom)
  )[0];
  const annualRent = latestRent ? latestRent.rentMonthlyCzk * 12 : null;
  const annualExpenses = twin.expenses
    .filter((e) => {
      const d = Date.parse(e.date);
      const yearAgo = Date.now() - 365 * 86_400_000;
      return d >= yearAgo;
    })
    .reduce((s, e) => s + e.amountCzk, 0);
  const annualDebt =
    twin.financing.monthlyPaymentCzk != null
      ? twin.financing.monthlyPaymentCzk * 12
      : null;
  const roughCf =
    annualRent != null && annualDebt != null
      ? annualRent - annualExpenses - annualDebt
      : null;

  return {
    twinId: twin.id,
    computedAt: new Date().toISOString(),
    currentEquity: equity,
    estimatedLtv: ltv,
    cashOnCashReturn: computeCashOnCashReturn(twin, roughCf),
    annualizedReturn: metric(
      null,
      "annualizedReturn — vyžaduje TWR/IRR z historie CF (COMING_SOON)",
      [],
      ["Implementace až s kompletní CF historií — neinventovat."],
      "NEOVERENO"
    ),
    rentGrowthYoy: computeRentGrowthYoy(twin),
    maintenanceBurden: computeMaintenanceBurden(twin),
    refinanceOpportunity: computeRefinanceOpportunity(twin, ctx),
    latestValueObservation: latestValue,
  };
}
