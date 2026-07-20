import { defaultRouterInput } from "@/lib/global-financing/types";

/** Demo: český rezident → byt ve Španělsku */
export const DEMO_CZ_RESIDENT_SPAIN = defaultRouterInput({
  residency: "cz_resident",
  nationality: "cz",
  propertyCountry: "spain",
  purchasePrice: 350_000,
  ownFunds: 120_000,
  incomeCountry: "cz",
  collateral: "cz_property",
  purpose: "investment",
  termYears: 25,
});
