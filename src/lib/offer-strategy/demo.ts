import { defaultOfferStrategyInput } from "@/lib/offer-strategy/types";

export const DEMO_OFFER_INPUT = defaultOfferStrategyInput({
  askingPriceCzk: 6_500_000,
  fairValueLowCzk: 5_950_000,
  fairValueHighCzk: 6_250_000,
  daysOnMarket: 52,
  rentMonthlyCzk: 22_000,
  comparables: [
    {
      id: "c1",
      label: "Srovnatelný byt 3+kk — 800 m",
      priceCzk: 6_100_000,
      distanceHint: "800 m",
      claimKind: "ODHAD",
    },
    {
      id: "c2",
      label: "Srovnatelný byt 3+kk — stejná ulice",
      priceCzk: 6_350_000,
      distanceHint: null,
      claimKind: "ODHAD",
    },
  ],
  priceHistory: [
    { date: "2025-04-01", priceCzk: 6_800_000, claimKind: "DATA" },
    { date: "2025-06-01", priceCzk: 6_500_000, claimKind: "DATA" },
  ],
});

export const DEMO_PROPERTY_LABEL = "Byt 3+kk — Vinohrady";
