/**
 * Modelové skóre lokality — ne live data z inzerátů.
 * Vyšší = lepší (kromě riskScore kde vyšší = rizikovější).
 */

const CITY_LOCATION: Record<string, number> = {
  Praha: 92,
  Brno: 85,
  Bratislava: 78,
  Ostrava: 68,
  Plzeň: 72,
  Olomouc: 70,
  Liberec: 69,
  Madrid: 80,
  Málaga: 74,
  Dubaj: 82,
  "Abú Dhabí": 78,
  Denpasar: 65,
  Ubud: 62,
  Canggu: 64,
  Záhřeb: 70,
  Dubrovník: 72,
  Košice: 66,
  Řím: 79,
  Milán: 81,
};

const CITY_LIQUIDITY: Record<string, number> = {
  Praha: 90,
  Brno: 82,
  Bratislava: 75,
  Ostrava: 62,
  Plzeň: 68,
  Dubaj: 78,
  Madrid: 76,
  Málaga: 70,
};

/** Odvozeno z modelové yield + velikosti trhu — ne počet nájemníků */
const CITY_RENTAL_DEMAND: Record<string, number> = {
  Praha: 88,
  Brno: 80,
  Ostrava: 72,
  Plzeň: 70,
  Dubaj: 75,
  Madrid: 78,
  Málaga: 74,
  Denpasar: 68,
  Bratislava: 76,
};

const DEFAULT_SCORE = 65;

export function locationScore(city: string): number {
  return CITY_LOCATION[city] ?? DEFAULT_SCORE;
}

export function liquidityScore(city: string, propertyType: string): number {
  const base = CITY_LIQUIDITY[city] ?? DEFAULT_SCORE;
  const typeAdj =
    propertyType === "Byt" ? 4 : propertyType === "Komerce" ? -8 : -2;
  return Math.max(40, Math.min(98, base + typeAdj));
}

export function rentalDemandScore(city: string, purpose: string): number {
  if (purpose === "own_use") {
    return Math.round((CITY_LOCATION[city] ?? DEFAULT_SCORE) * 0.85);
  }
  return CITY_RENTAL_DEMAND[city] ?? DEFAULT_SCORE;
}

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
  if (input.discountPremiumPct != null && input.discountPremiumPct > 15) {
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

export function renovationLabel(need: string): string {
  switch (need) {
    case "none":
      return "Bez renovace (vstup)";
    case "light":
      return "Lehká úprava (MODEL)";
    case "major":
      return "Větší rekonstrukce (vstup)";
    default:
      return "Neuvedeno — NEOVĚŘENO";
  }
}
