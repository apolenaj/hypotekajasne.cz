import type { ComparePropertyInput } from "@/lib/property-compare/types";

/** Demo A/B pro onboarding — MODEL data, ne live listingy */
export const DEMO_COMPARE_PROPERTIES: ComparePropertyInput[] = [
  {
    id: "demo_a",
    label: "Property A — Ostrava byt",
    country: "Česká republika",
    city: "Ostrava",
    propertyType: "Byt",
    areaM2: 52,
    priceCzk: 3_200_000,
    rentMonthlyCzk: 17_500,
    equityCzk: 800_000,
    ratePercent: null,
    termYears: 30,
    purpose: "investment",
    renovationNeed: "light",
    dataCompletenessPct: 85,
  },
  {
    id: "demo_b",
    label: "Property B — Praha byt",
    country: "Česká republika",
    city: "Praha",
    propertyType: "Byt",
    areaM2: 48,
    priceCzk: 6_100_000,
    rentMonthlyCzk: 22_000,
    equityCzk: 1_500_000,
    ratePercent: null,
    termYears: 30,
    purpose: "investment",
    renovationNeed: "none",
    dataCompletenessPct: 90,
  },
];

export function newCompareProperty(partial?: Partial<ComparePropertyInput>): ComparePropertyInput {
  return {
    id: `cmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    label: partial?.label ?? "Nová nemovitost",
    country: partial?.country ?? "Česká republika",
    city: partial?.city ?? "Praha",
    propertyType: partial?.propertyType ?? "Byt",
    areaM2: partial?.areaM2 ?? 55,
    priceCzk: partial?.priceCzk ?? 5_000_000,
    rentMonthlyCzk: partial?.rentMonthlyCzk ?? null,
    equityCzk: partial?.equityCzk ?? null,
    ratePercent: partial?.ratePercent ?? null,
    termYears: partial?.termYears ?? 30,
    purpose: partial?.purpose ?? "investment",
    renovationNeed: partial?.renovationNeed ?? "unknown",
    listingUrl: partial?.listingUrl,
    dataCompletenessPct: partial?.dataCompletenessPct ?? null,
  };
}
