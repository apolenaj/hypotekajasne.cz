/**
 * Coarse financial bands for analytics — never send exact CZK amounts.
 */

export type MortgageAmountBand =
  | "under_2m"
  | "2m_4m"
  | "4m_6m"
  | "6m_10m"
  | "10m_plus";

export type PropertyValueBand = MortgageAmountBand;

export type LtvBand = "0_60" | "60_70" | "70_80" | "80_90" | "90_plus";

export type PricingScenarioCategory =
  | "with_insurance"
  | "without_insurance"
  | "account_conditions"
  | "green"
  | "other";

export function mortgageAmountBand(czk: number): MortgageAmountBand {
  const n = Number.isFinite(czk) ? Math.max(0, czk) : 0;
  if (n < 2_000_000) return "under_2m";
  if (n < 4_000_000) return "2m_4m";
  if (n < 6_000_000) return "4m_6m";
  if (n < 10_000_000) return "6m_10m";
  return "10m_plus";
}

export function propertyValueBand(czk: number): PropertyValueBand {
  return mortgageAmountBand(czk);
}

export function ltvBand(ltvPct: number): LtvBand {
  const n = Number.isFinite(ltvPct) ? ltvPct : 0;
  if (n < 60) return "0_60";
  if (n < 70) return "60_70";
  if (n < 80) return "70_80";
  if (n < 90) return "80_90";
  return "90_plus";
}

/** Map technical pricing_scenario_key → safe public category. */
export function pricingScenarioCategory(
  key: string | null | undefined
): PricingScenarioCategory {
  const k = (key ?? "").toLowerCase();
  if (
    k.includes("without_repayment") ||
    k.includes("without_ppi") ||
    k.includes("no_insurance")
  ) {
    return "without_insurance";
  }
  if (
    k.includes("with_repayment") ||
    k.includes("with_ppi") ||
    k.includes("insurance")
  ) {
    return "with_insurance";
  }
  if (k.includes("account") || k.includes("active_account")) {
    return "account_conditions";
  }
  if (k.includes("green")) return "green";
  return "other";
}
