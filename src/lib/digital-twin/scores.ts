/**
 * Modelové skóre pro Digital Twin / Portfolio OS.
 */

export function compositeRiskScore(input: {
  dscr: number | null;
  monthlyCashFlow: number;
  ltv: number;
  renovationNeed: string;
  dataCompleteness: number;
  discountPremiumPct: number | null;
}): number {
  let risk = 35;
  if (input.dscr != null) {
    if (input.dscr < 1) risk += 25;
    else if (input.dscr < 1.15) risk += 12;
    else if (input.dscr >= 1.35) risk -= 8;
  }
  if (input.monthlyCashFlow < 0) risk += 18;
  else if (input.monthlyCashFlow < 3_000) risk += 6;
  if (input.ltv > 0.85) risk += 14;
  else if (input.ltv > 0.75) risk += 6;
  if (input.renovationNeed === "major") risk += 15;
  else if (input.renovationNeed === "light") risk += 5;
  if (input.dataCompleteness < 50) risk += 10;
  if (input.discountPremiumPct != null && input.discountPremiumPct > 0.15) {
    risk += 8;
  }
  return Math.max(15, Math.min(95, Math.round(risk)));
}

export function dataCompletenessFromInput(input: {
  areaM2: number;
  priceCzk: number;
  rentMonthlyCzk: number | null;
  equityCzk: number | null;
  listingUrl?: string;
  dataCompletenessPct?: number | null;
  renovationNeed: string;
}): number {
  if (input.dataCompletenessPct != null) {
    return Math.max(0, Math.min(100, input.dataCompletenessPct));
  }
  let filled = 0;
  const total = 6;
  if (input.priceCzk > 0) filled += 1;
  if (input.areaM2 > 0) filled += 1;
  if (input.rentMonthlyCzk != null && input.rentMonthlyCzk > 0) filled += 1;
  if (input.equityCzk != null && input.equityCzk > 0) filled += 1;
  if (input.listingUrl?.trim()) filled += 1;
  if (input.renovationNeed !== "unknown") filled += 1;
  return Math.round((filled / total) * 100);
}
