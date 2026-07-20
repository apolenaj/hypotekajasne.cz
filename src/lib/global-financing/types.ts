import type { CountryId, CurrencyCode } from "@/lib/calculators";
import type { FinancingOptionId } from "@/lib/financing/types";
import type { ClaimKind } from "@/lib/property-rentgen/types";

export const GLOBAL_FINANCING_STORAGE_KEY = "hj-global-financing-v1";
export const GLOBAL_FINANCING_FEATURE_STATUS = "BETA" as const;

/** Router path types — maps to FinancingOptionId + COMBINATION */
export const FINANCING_ROUTE_PATH_IDS = [
  "LOCAL_MORTGAGE",
  "CZECH_EQUITY_LOAN",
  "DEVELOPER_PAYMENT_PLAN",
  "CASH",
  "COMBINATION",
  "UNAVAILABLE",
] as const;

export type FinancingRoutePathId = (typeof FINANCING_ROUTE_PATH_IDS)[number];

export const FINANCING_ROUTE_PATH_LABELS: Record<FinancingRoutePathId, string> = {
  LOCAL_MORTGAGE: "Lokální hypotéka",
  CZECH_EQUITY_LOAN: "České zajištěné financování",
  DEVELOPER_PAYMENT_PLAN: "Developer payment plan",
  CASH: "Hotovost",
  COMBINATION: "Kombinace cest",
  UNAVAILABLE: "V datech nepodporováno",
};

export type ResidencyStatus =
  | "cz_resident"
  | "eu_resident"
  | "non_eu_resident";

export type NationalityRelevance = "cz" | "eu" | "other" | "not_applicable";

export type PropertyPurpose = "investment" | "own_use";

export type CollateralType =
  | "none"
  | "cz_property"
  | "foreign_property"
  | "other";

export type RouteAvailabilityStatus =
  | "AVAILABLE"
  | "AVAILABLE_INDIVIDUALLY"
  | "CONDITIONALLY_AVAILABLE"
  | "INSUFFICIENT_EQUITY"
  | "NOT_SUPPORTED";

export const ROUTE_AVAILABILITY_LABELS: Record<RouteAvailabilityStatus, string> = {
  AVAILABLE: "Dostupné s integrovaným partnerem",
  AVAILABLE_INDIVIDUALLY:
    "Financování dostupné individuálně – partner zatím není integrován.",
  CONDITIONALLY_AVAILABLE: "Podmíněně dostupné — vyžaduje ověření u specialisty",
  INSUFFICIENT_EQUITY: "Nedostatečný vlastní kapitál pro tuto cestu",
  NOT_SUPPORTED: "V datech aktuálně nepodporováno",
};

export type PartnerIntegrationStatus =
  | "INTEGRATED"
  | "MANUAL_REFERRAL"
  | "NOT_INTEGRATED";

export type PartnerAvailabilityInfo = {
  status: PartnerIntegrationStatus;
  label: string;
  partnerId: string | null;
  marketplaceReady: boolean;
};

export type DataFreshnessInfo = {
  asOf: string | null;
  source: string | null;
  claimKind: ClaimKind;
  note: string;
};

export type FinancingRouteCard = {
  routeId: string;
  routeLetter: string;
  pathType: FinancingRoutePathId;
  label: string;
  availabilityStatus: RouteAvailabilityStatus;
  availabilityLabel: string;
  requiredEquityPercent: number | null;
  requiredEquityAmount: number | null;
  currency: CurrencyCode;
  typicalStructure: string;
  mainRisks: string[];
  requiredDocuments: string[];
  partnerAvailability: PartnerAvailabilityInfo;
  dataFreshness: DataFreshnessInfo;
  calculable: boolean;
  calculationNote: string | null;
  claimKind: ClaimKind;
  linkedFinancingOption: FinancingOptionId | null;
};

export type GlobalFinancingRouterInput = {
  residency: ResidencyStatus;
  nationality: NationalityRelevance;
  propertyCountry: CountryId;
  purchasePrice: number;
  ownFunds: number;
  incomeCountry: CountryId | "other";
  collateral: CollateralType;
  purpose: PropertyPurpose;
  termYears: number;
};

export type FinancingMapNode = {
  id: string;
  type: "origin" | "destination" | "route";
  label: string;
  sublabel: string | null;
  routeCard?: FinancingRouteCard;
};

export type FinancingMapEdge = {
  from: string;
  to: string;
  label: string | null;
};

export type GlobalFinancingMap = {
  generatedAt: string;
  input: GlobalFinancingRouterInput;
  originLabel: string;
  destinationLabel: string;
  routes: FinancingRouteCard[];
  nodes: FinancingMapNode[];
  edges: FinancingMapEdge[];
  methodology: string[];
  noSingleRecommendation: true;
};

export type GlobalFinancingStore = {
  version: 1;
  input: GlobalFinancingRouterInput | null;
  lastViewedAt: string | null;
};

export function defaultRouterInput(
  partial?: Partial<GlobalFinancingRouterInput>
): GlobalFinancingRouterInput {
  return {
    residency: partial?.residency ?? "cz_resident",
    nationality: partial?.nationality ?? "cz",
    propertyCountry: partial?.propertyCountry ?? "spain",
    purchasePrice: partial?.purchasePrice ?? 350_000,
    ownFunds: partial?.ownFunds ?? 120_000,
    incomeCountry: partial?.incomeCountry ?? "cz",
    collateral: partial?.collateral ?? "cz_property",
    purpose: partial?.purpose ?? "investment",
    termYears: partial?.termYears ?? 25,
  };
}
