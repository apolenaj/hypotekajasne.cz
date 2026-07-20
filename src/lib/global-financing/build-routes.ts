import { countryConfigs } from "@/lib/calculators";
import { getFinancingProducts } from "@/lib/financing/products";
import {
  LOCAL_FINANCING_UNVERIFIED_MESSAGE,
  type FinancingOptionId,
} from "@/lib/financing/types";
import {
  buildPartnerInquiryPayload,
  findPartnerSlot,
  PARTNER_NOT_INTEGRATED_MESSAGE,
} from "@/lib/global-financing/partners";
import {
  dossierFreshness,
  isLocalResidentForProperty,
  mainRisks,
  pathTypeFromOption,
  requiredDocuments,
  typicalStructure,
} from "@/lib/global-financing/route-metadata";
import type {
  FinancingRouteCard,
  FinancingRoutePathId,
  GlobalFinancingRouterInput,
  PartnerAvailabilityInfo,
  RouteAvailabilityStatus,
} from "@/lib/global-financing/types";
import { ROUTE_AVAILABILITY_LABELS as AVAIL_LABELS } from "@/lib/global-financing/types";

const ROUTE_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

function equityForPath(
  pathType: FinancingRoutePathId,
  input: GlobalFinancingRouterInput
): { percent: number | null; amount: number | null } {
  const price = input.purchasePrice;
  if (pathType === "CASH") {
    return { percent: 100, amount: price };
  }
  const product = getFinancingProducts(input.propertyCountry).find(
    (p) => p.option === (pathType as FinancingOptionId)
  );
  if (product?.maxLtvPercent != null && product.maxLtvPercent > 0) {
    const pct = 100 - product.maxLtvPercent;
    return { percent: pct, amount: Math.round((price * pct) / 100) };
  }
  if (pathType === "DEVELOPER_PAYMENT_PLAN") {
    return { percent: 30, amount: Math.round(price * 0.3) };
  }
  if (pathType === "CZECH_EQUITY_LOAN") {
    return { percent: null, amount: null };
  }
  return { percent: null, amount: null };
}

function resolveAvailability(input: {
  pathType: FinancingRoutePathId;
  input: GlobalFinancingRouterInput;
  partner: PartnerAvailabilityInfo;
}): RouteAvailabilityStatus {
  const { pathType, input: routerInput, partner } = input;
  const price = routerInput.purchasePrice;
  const funds = routerInput.ownFunds;
  const equity = equityForPath(pathType, routerInput);

  if (pathType === "UNAVAILABLE") return "NOT_SUPPORTED";

  if (pathType === "CZECH_EQUITY_LOAN") {
    if (routerInput.collateral !== "cz_property") {
      return "NOT_SUPPORTED";
    }
  }

  if (pathType === "CASH") {
    return funds >= price ? "AVAILABLE" : "INSUFFICIENT_EQUITY";
  }

  if (equity.amount != null && funds < equity.amount) {
    if (pathType === "COMBINATION" && routerInput.collateral === "cz_property") {
      return "CONDITIONALLY_AVAILABLE";
    }
    return "INSUFFICIENT_EQUITY";
  }

  if (partner.status === "NOT_INTEGRATED") {
    return "AVAILABLE_INDIVIDUALLY";
  }
  if (partner.status === "MANUAL_REFERRAL") {
    return "AVAILABLE_INDIVIDUALLY";
  }
  if (partner.status === "INTEGRATED") {
    return "AVAILABLE";
  }

  return "CONDITIONALLY_AVAILABLE";
}

function buildPartnerInfo(
  pathType: FinancingRoutePathId,
  propertyCountry: GlobalFinancingRouterInput["propertyCountry"]
): PartnerAvailabilityInfo {
  const slot = findPartnerSlot({ propertyCountry, pathType });
  if (!slot) {
    return {
      status: "NOT_INTEGRATED",
      label: PARTNER_NOT_INTEGRATED_MESSAGE,
      partnerId: null,
      marketplaceReady: true,
    };
  }
  const labels: Record<string, string> = {
    INTEGRATED: "Partner integrován — lze iniciovat poptávku",
    MANUAL_REFERRAL: PARTNER_NOT_INTEGRATED_MESSAGE,
    NOT_INTEGRATED: PARTNER_NOT_INTEGRATED_MESSAGE,
  };
  return {
    status: slot.integrationStatus,
    label: labels[slot.integrationStatus] ?? PARTNER_NOT_INTEGRATED_MESSAGE,
    partnerId: slot.partnerId,
    marketplaceReady: slot.marketplaceReady,
  };
}

function buildRouteCard(
  letter: string,
  pathType: FinancingRoutePathId,
  input: GlobalFinancingRouterInput,
  labelOverride?: string
): FinancingRouteCard {
  const product = getFinancingProducts(input.propertyCountry).find(
    (p) => p.option === (pathType as FinancingOptionId)
  );
  const currency =
    product?.currency ?? countryConfigs[input.propertyCountry].currency;
  const partner = buildPartnerInfo(pathType, input.propertyCountry);
  const availabilityStatus = resolveAvailability({ pathType, input, partner });
  const equity = equityForPath(pathType, input);
  const freshness = dossierFreshness(input.propertyCountry);
  const calculable = product?.calculable ?? false;
  const isResident = isLocalResidentForProperty(input);

  let label = labelOverride ?? product?.label ?? pathType;
  if (pathType === "LOCAL_MORTGAGE" && !isResident && input.propertyCountry === "spain") {
    label = "Španělská hypotéka pro nerezidenta";
  }
  if (pathType === "LOCAL_MORTGAGE" && input.propertyCountry === "dubai") {
    label = "Non-resident hypotéka (SAE)";
  }
  if (pathType === "CZECH_EQUITY_LOAN") {
    label = "Český úvěr se zástavou v ČR";
  }

  let calculationNote: string | null = null;
  if (!calculable && pathType === "LOCAL_MORTGAGE") {
    calculationNote = LOCAL_FINANCING_UNVERIFIED_MESSAGE;
  } else if (pathType === "CZECH_EQUITY_LOAN") {
    calculationNote =
      "Sazba ze živých dat bank (americká hypotéka) — v kalkulačce po ověření.";
  } else if (pathType === "COMBINATION") {
    calculationNote =
      "Kombinace nepočítáme jako jeden produkt — jen orientační struktura.";
  }

  return {
    routeId: `route_${letter.toLowerCase()}_${pathType.toLowerCase()}`,
    routeLetter: letter,
    pathType,
    label,
    availabilityStatus,
    availabilityLabel: AVAIL_LABELS[availabilityStatus],
    requiredEquityPercent: equity.percent,
    requiredEquityAmount: equity.amount,
    currency,
    typicalStructure: typicalStructure(pathType, input.propertyCountry, input.purpose),
    mainRisks: mainRisks(pathType, input.propertyCountry),
    requiredDocuments: requiredDocuments(
      pathType,
      input.propertyCountry,
      input.collateral
    ),
    partnerAvailability: partner,
    dataFreshness: {
      asOf: freshness.asOf,
      source: freshness.source,
      claimKind: calculable ? "DATA" : "NEOVERENO",
      note: product?.source ?? "Bez ověřeného produktového zdroje",
    },
    calculable,
    calculationNote,
    claimKind: calculable ? "DATA" : pathType === "UNAVAILABLE" ? "NEOVERENO" : "ODHAD",
    linkedFinancingOption:
      pathType === "COMBINATION" ? null : (pathType as FinancingOptionId),
  };
}

function finalizeCard(card: FinancingRouteCard): FinancingRouteCard {
  return {
    ...card,
    availabilityLabel: AVAIL_LABELS[card.availabilityStatus],
  };
}

function shouldIncludeCombination(input: GlobalFinancingRouterInput): boolean {
  const hasEquity =
    input.collateral === "cz_property" &&
    getFinancingProducts(input.propertyCountry).some(
      (p) => p.option === "CZECH_EQUITY_LOAN"
    );
  const partialCash =
    input.ownFunds > 0 && input.ownFunds < input.purchasePrice;
  const hasLocal = getFinancingProducts(input.propertyCountry).some(
    (p) => p.option === "LOCAL_MORTGAGE"
  );
  return hasEquity && partialCash && (hasLocal || input.propertyCountry !== "cz");
}

/**
 * Router — vrací všechny možné cesty, nikdy jednu „doporučenou“.
 */
export function buildFinancingRoutes(
  input: GlobalFinancingRouterInput
): FinancingRouteCard[] {
  const products = getFinancingProducts(input.propertyCountry);
  const routes: FinancingRouteCard[] = [];
  let letterIdx = 0;

  const addPath = (pathType: FinancingRoutePathId, label?: string) => {
    if (letterIdx >= ROUTE_LETTERS.length) return;
    routes.push(
      finalizeCard(
        buildRouteCard(ROUTE_LETTERS[letterIdx]!, pathType, input, label)
      )
    );
    letterIdx++;
  };

  for (const product of products) {
    const pathType = pathTypeFromOption(product.option);
    if (pathType === "UNAVAILABLE") continue;
    if (
      pathType === "CZECH_EQUITY_LOAN" &&
      input.collateral !== "cz_property"
    ) {
      continue;
    }
    addPath(pathType);
  }

  if (shouldIncludeCombination(input)) {
    addPath(
      "COMBINATION",
      "Kombinace: hotovost + české zajištěné financování"
    );
  }

  const hasAnyRoute = routes.some((r) => r.availabilityStatus !== "NOT_SUPPORTED");
  if (!hasAnyRoute && products.length === 0) {
    addPath("UNAVAILABLE", "V datech nepodporováno");
  }

  for (const country of ["italy", "croatia", "slovakia", "saudi"] as const) {
    if (input.propertyCountry === country && !routes.some((r) => r.pathType === "LOCAL_MORTGAGE")) {
      // Explicit NOT_SUPPORTED lane for local mortgage where no product exists
    }
  }

  if (
    !products.some((p) => p.option === "LOCAL_MORTGAGE") &&
    !routes.some((r) => r.pathType === "UNAVAILABLE") &&
    ["italy", "croatia", "slovakia", "saudi"].includes(input.propertyCountry)
  ) {
    addPath(
      "UNAVAILABLE",
      `Lokální hypotéka v ${countryConfigs[input.propertyCountry].label} — v datech nepodporováno`
    );
  }

  return routes;
}

export { buildPartnerInquiryPayload };
