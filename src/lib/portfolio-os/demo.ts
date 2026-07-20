/**
 * Demo owned twins for Portfolio OS — MODEL data, not live listings.
 */

import { emptyTwin, type PropertyDigitalTwin } from "@/lib/digital-twin/types";

function obs(
  valueCzk: number,
  source: "user_entered" | "bank_appraisal" = "user_entered"
) {
  return {
    id: `v_${Math.random().toString(36).slice(2, 8)}`,
    observedAt: "2026-06-01T00:00:00.000Z",
    valueCzk,
    source,
    method: source === "bank_appraisal" ? ("bank_valuation" as const) : ("manual" as const),
    confidence: "medium" as const,
    claimKind: "DATA" as const,
  };
}

function balance(balanceCzk: number) {
  return {
    id: `b_${Math.random().toString(36).slice(2, 8)}`,
    asOf: "2026-06-01T00:00:00.000Z",
    balanceCzk,
    source: "bank_statement" as const,
    claimKind: "DATA" as const,
  };
}

export const DEMO_PORTFOLIO_TWINS: PropertyDigitalTwin[] = [
  emptyTwin({
    id: "twin_praha_1",
    label: "Byt Praha 7",
    relationship: "owned",
    location: {
      country: "Česká republika",
      city: "Praha",
      areaM2: 52,
      propertyType: "Byt",
      currencyCode: "CZK",
    },
    purchase: {
      purchasePriceCzk: 5_800_000,
      purchaseDate: "2022-03-15",
      acquisitionCostsCzk: 174_000,
      currency: "CZK",
      claimKind: "DATA",
    },
    financing: {
      loanAmountCzk: 4_200_000,
      ratePercent: 4.89,
      termYears: 30,
      fixationEnd: "2027-06-01",
      lenderLabel: "Model banka",
      monthlyPaymentCzk: 22_300,
      claimKind: "DATA",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
    valueHistory: [obs(6_200_000, "bank_appraisal")],
    mortgageBalanceHistory: [balance(3_950_000)],
    rentHistory: [
      {
        id: "r1",
        effectiveFrom: "2025-01-01",
        rentMonthlyCzk: 24_500,
        currencyCode: "CZK",
        claimKind: "DATA",
      },
    ],
    keyDates: [
      {
        id: "kd1",
        kind: "fixation_end",
        date: "2027-06-01",
        label: "Konec fixace",
        claimKind: "DATA",
      },
    ],
  }),
  emptyTwin({
    id: "twin_praha_2",
    label: "Byt Praha 10",
    relationship: "owned",
    location: {
      country: "Česká republika",
      city: "Praha",
      areaM2: 45,
      propertyType: "Byt",
      currencyCode: "CZK",
    },
    purchase: {
      purchasePriceCzk: 4_900_000,
      purchaseDate: "2021-09-01",
      acquisitionCostsCzk: 147_000,
      currency: "CZK",
      claimKind: "DATA",
    },
    financing: {
      loanAmountCzk: 3_600_000,
      ratePercent: 5.19,
      termYears: 25,
      fixationEnd: "2027-03-01",
      lenderLabel: "Model banka B",
      monthlyPaymentCzk: 21_400,
      claimKind: "DATA",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
    valueHistory: [obs(5_400_000)],
    mortgageBalanceHistory: [balance(3_200_000)],
    rentHistory: [
      {
        id: "r2",
        effectiveFrom: "2025-06-01",
        rentMonthlyCzk: 21_000,
        currencyCode: "CZK",
        claimKind: "DATA",
      },
    ],
    keyDates: [
      {
        id: "kd2",
        kind: "fixation_end",
        date: "2027-03-01",
        label: "Konec fixace",
        claimKind: "DATA",
      },
    ],
  }),
  emptyTwin({
    id: "twin_ostrava",
    label: "Byt Ostrava",
    relationship: "owned",
    location: {
      country: "Česká republika",
      city: "Ostrava",
      areaM2: 58,
      propertyType: "Byt",
      currencyCode: "CZK",
    },
    purchase: {
      purchasePriceCzk: 2_800_000,
      purchaseDate: "2023-05-20",
      acquisitionCostsCzk: 84_000,
      currency: "CZK",
      claimKind: "DATA",
    },
    financing: {
      loanAmountCzk: 2_100_000,
      ratePercent: 5.49,
      termYears: 30,
      fixationEnd: "2028-01-01",
      lenderLabel: "Model banka C",
      monthlyPaymentCzk: 11_900,
      claimKind: "DATA",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
    valueHistory: [obs(3_100_000)],
    mortgageBalanceHistory: [balance(2_050_000)],
    rentHistory: [
      {
        id: "r3",
        effectiveFrom: "2025-01-01",
        rentMonthlyCzk: 18_500,
        currencyCode: "CZK",
        claimKind: "DATA",
      },
    ],
  }),
  emptyTwin({
    id: "twin_malaga",
    label: "Apartmán Málaga",
    relationship: "owned",
    location: {
      country: "Španělsko",
      city: "Málaga",
      areaM2: 48,
      propertyType: "Byt",
      currencyCode: "EUR",
    },
    purchase: {
      purchasePriceCzk: 4_200_000,
      purchaseDate: "2020-11-10",
      acquisitionCostsCzk: 210_000,
      currency: "CZK",
      claimKind: "DATA",
    },
    financing: {
      loanAmountCzk: 2_800_000,
      ratePercent: 3.95,
      termYears: 20,
      fixationEnd: "2026-12-01",
      lenderLabel: "ES banka",
      monthlyPaymentCzk: 16_800,
      claimKind: "DATA",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
    valueHistory: [obs(4_500_000)],
    mortgageBalanceHistory: [balance(2_400_000)],
    rentHistory: [
      {
        id: "r4",
        effectiveFrom: "2025-01-01",
        rentMonthlyCzk: 32_000,
        currencyCode: "EUR",
        claimKind: "DATA",
      },
    ],
    keyDates: [
      {
        id: "kd4",
        kind: "fixation_end",
        date: "2026-12-01",
        label: "Konec fixace EUR",
        claimKind: "DATA",
      },
    ],
  }),
];
