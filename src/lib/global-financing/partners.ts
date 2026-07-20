/**
 * Partner-ready architecture pro budoucí marketplace financování.
 * Sloty jsou deklarativní — integrace probíhá přes bridge API, ne hardcoded simulací.
 */

import type { CountryId } from "@/lib/calculators";
import type {
  FinancingRoutePathId,
  PartnerIntegrationStatus,
} from "@/lib/global-financing/types";

export type FinancingPartnerSlot = {
  id: string;
  name: string;
  countryScope: CountryId | "global" | "cz";
  routeTypes: FinancingRoutePathId[];
  integrationStatus: PartnerIntegrationStatus;
  partnerId: string | null;
  /** Připraveno pro marketplace listing — partner může být přidán bez změny routeru */
  marketplaceReady: boolean;
  inquiryEndpoint: string | null;
};

export const PARTNER_NOT_INTEGRATED_MESSAGE =
  "Financování dostupné individuálně – partner zatím není integrován.";

/**
 * Registr partner slotů — marketplace-ready.
 * Nový partner = nový záznam + volitelně bridge route; router jen čte status.
 */
export const FINANCING_PARTNER_REGISTRY: FinancingPartnerSlot[] = [
  {
    id: "cz-local-mortgage",
    name: "Česká hypoteční banka (slot)",
    countryScope: "cz",
    routeTypes: ["LOCAL_MORTGAGE"],
    integrationStatus: "MANUAL_REFERRAL",
    partnerId: "primary-mortgage-partner",
    marketplaceReady: true,
    inquiryEndpoint: "/api/bridge/financing/partner-inquiry",
  },
  {
    id: "cz-equity-american",
    name: "České zajištěné financování (americká hypotéka)",
    countryScope: "cz",
    routeTypes: ["CZECH_EQUITY_LOAN", "COMBINATION"],
    integrationStatus: "MANUAL_REFERRAL",
    partnerId: "primary-mortgage-partner",
    marketplaceReady: true,
    inquiryEndpoint: "/api/bridge/financing/partner-inquiry",
  },
  {
    id: "es-non-resident",
    name: "Španělská lokální hypotéka (nerezident)",
    countryScope: "spain",
    routeTypes: ["LOCAL_MORTGAGE"],
    integrationStatus: "NOT_INTEGRATED",
    partnerId: null,
    marketplaceReady: true,
    inquiryEndpoint: null,
  },
  {
    id: "ae-non-resident",
    name: "SAE non-resident hypotéka",
    countryScope: "dubai",
    routeTypes: ["LOCAL_MORTGAGE"],
    integrationStatus: "NOT_INTEGRATED",
    partnerId: null,
    marketplaceReady: true,
    inquiryEndpoint: null,
  },
  {
    id: "ae-developer",
    name: "Developer payment plan (SAE)",
    countryScope: "dubai",
    routeTypes: ["DEVELOPER_PAYMENT_PLAN"],
    integrationStatus: "NOT_INTEGRATED",
    partnerId: null,
    marketplaceReady: false,
    inquiryEndpoint: null,
  },
  {
    id: "bali-developer",
    name: "Developer fázované platby (Bali)",
    countryScope: "bali",
    routeTypes: ["DEVELOPER_PAYMENT_PLAN"],
    integrationStatus: "NOT_INTEGRATED",
    partnerId: null,
    marketplaceReady: false,
    inquiryEndpoint: null,
  },
  {
    id: "global-cash",
    name: "Hotovostní transakce",
    countryScope: "global",
    routeTypes: ["CASH"],
    integrationStatus: "INTEGRATED",
    partnerId: null,
    marketplaceReady: false,
    inquiryEndpoint: null,
  },
];

export function findPartnerSlot(input: {
  propertyCountry: CountryId;
  pathType: FinancingRoutePathId;
}): FinancingPartnerSlot | null {
  return (
    FINANCING_PARTNER_REGISTRY.find(
      (s) =>
        s.routeTypes.includes(input.pathType) &&
        (s.countryScope === input.propertyCountry ||
          s.countryScope === "global" ||
          (input.pathType === "CZECH_EQUITY_LOAN" && s.countryScope === "cz"))
    ) ?? null
  );
}

export type PartnerInquiryPayload = {
  slotId: string;
  routeId: string;
  propertyCountry: CountryId;
  pathType: FinancingRoutePathId;
  residency: string;
  purpose: string;
  /** Bez PII — jen rozsah */
  purchasePriceBand: string;
  attribution?: { source: string; sessionId?: string };
};

export function buildPartnerInquiryPayload(input: {
  slot: FinancingPartnerSlot;
  routeId: string;
  propertyCountry: CountryId;
  pathType: FinancingRoutePathId;
  residency: string;
  purpose: string;
  purchasePrice: number;
}): PartnerInquiryPayload {
  const band =
    input.purchasePrice < 100_000
      ? "<100k"
      : input.purchasePrice < 500_000
        ? "100k-500k"
        : input.purchasePrice < 2_000_000
          ? "500k-2M"
          : ">2M";
  return {
    slotId: input.slot.id,
    routeId: input.routeId,
    propertyCountry: input.propertyCountry,
    pathType: input.pathType,
    residency: input.residency,
    purpose: input.purpose,
    purchasePriceBand: band,
    attribution: { source: "global-financing-router" },
  };
}
