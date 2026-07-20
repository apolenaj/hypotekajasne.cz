import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";
import { getCountryDossier } from "@/lib/country-dossier";
import { getFinancingProduct } from "@/lib/financing/products";
import type { FinancingOptionId } from "@/lib/financing/types";
import type {
  CollateralType,
  FinancingRoutePathId,
  GlobalFinancingRouterInput,
  PropertyPurpose,
  ResidencyStatus,
} from "@/lib/global-financing/types";

const LEGAL_REVIEW_FALLBACK = "2025-06-01";

export function residencyLabel(r: ResidencyStatus): string {
  const map: Record<ResidencyStatus, string> = {
    cz_resident: "Rezident ČR",
    eu_resident: "Rezident EU (mimo ČR)",
    non_eu_resident: "Nerezident mimo EU",
  };
  return map[r];
}

export function isLocalResidentForProperty(
  input: GlobalFinancingRouterInput
): boolean {
  if (input.propertyCountry === "cz" && input.residency === "cz_resident") {
    return true;
  }
  if (
    input.propertyCountry !== "cz" &&
    input.residency === "eu_resident" &&
    ["spain", "italy", "croatia", "slovakia"].includes(input.propertyCountry)
  ) {
    return false; // EU resident abroad still typically non-resident for local mortgage
  }
  return false;
}

export function pathTypeFromOption(
  option: FinancingOptionId
): FinancingRoutePathId {
  if (option === "PRIVATE_FINANCE") return "UNAVAILABLE";
  return option as FinancingRoutePathId;
}

export function typicalStructure(
  pathType: FinancingRoutePathId,
  country: CountryId,
  purpose: PropertyPurpose
): string {
  const product = getFinancingProduct(country, pathType as FinancingOptionId);
  const purposeNote =
    purpose === "investment" ? "investiční účel" : "vlastní bydlení";

  switch (pathType) {
    case "LOCAL_MORTGAGE":
      if (country === "cz") {
        return `Česká anuitní hypotéka v CZK — ${purposeNote}. Sazba ze živých dat bank.`;
      }
      if (product?.maxLtvPercent != null) {
        return `Lokální bankovní hypotéka v ${product.currency} — typicky max. LTV ${product.maxLtvPercent} % u nerezidenta. Sazbu individuálně ověřujeme.`;
      }
      return `Lokální bankovní hypotéka — ${purposeNote}. Bez ověřené sazby v datech nepočítáme splátku.`;
    case "CZECH_EQUITY_LOAN":
      return "Úvěr v CZK od české banky se zástavou nemovitosti v ČR (americká hypotéka). Prostředky lze použít na nákup v zahraničí — individuální posouzení banky.";
    case "DEVELOPER_PAYMENT_PLAN":
      return "Fázované platby developerovi (booking → výstavba → handover). Nejde o bankovní hypotéku — schedule fází, ne anuitní úrok.";
    case "CASH":
      return `100 % vlastních zdrojů v ${countryConfigs[country].currency} (nebo ekvivalent po směně).`;
    case "COMBINATION":
      return "Kombinace více cest — typicky část hotovost + české zajištěné financování, nebo developer plán + doplatek hotovostí.";
    default:
      return "Cesta není v datech podporována — individuální ověření u specialisty.";
  }
}

export function mainRisks(
  pathType: FinancingRoutePathId,
  country: CountryId
): string[] {
  const common: string[] = [];
  switch (pathType) {
    case "LOCAL_MORTGAGE":
      if (country !== "cz") {
        common.push(
          "Nižší LTV u nerezidentů než v ČR — bez univerzálního 80 %.",
          "Měnové riziko (úvěr v cizí měně vs. příjem v CZK).",
          "Delší schvalovací proces a jiná dokumentace než u české hypotéky."
        );
      } else {
        common.push(
          "Bonita a LTV dle pravidel české banky.",
          "Fixace a refinancování — sledujte Refinance Radar."
        );
      }
      if (country === "spain") {
        common.push("NIE a daňová rezidence — individuální posouzení.");
      }
      break;
    case "CZECH_EQUITY_LOAN":
      common.push(
        "Vyžaduje zástavu v ČR — bez nemovitosti v ČR cesta nedostupná.",
        "Úvěr v CZK, nemovitost v cizí měně — FX expozice.",
        "Sazba ze živých dat — ne garantovaná nabídka."
      );
      break;
    case "DEVELOPER_PAYMENT_PLAN":
      common.push(
        "Riziko developera a dokončení projektu.",
        "Není bankovní hypotéka — jiná ochrana než u úvěru od banky.",
        "Peak cash flow ve fázi výstavby."
      );
      break;
    case "CASH":
      common.push(
        "Vysoká vázanost kapitálu.",
        "Měnové riziko při konverzi z CZK."
      );
      break;
    case "COMBINATION":
      common.push(
        "Složitější koordinace více smluv a časování.",
        "Celkové náklady = součet rizik jednotlivých cest."
      );
      break;
    default:
      common.push("Bez ověřených pravidel v datech — neposkytujeme simulaci.");
  }
  return common;
}

export function requiredDocuments(
  pathType: FinancingRoutePathId,
  country: CountryId,
  collateral: CollateralType
): string[] {
  const base = ["Občanský průkaz / pas", "Doklad o příjmu"];
  switch (pathType) {
    case "LOCAL_MORTGAGE":
      if (country === "cz") {
        return [...base, "Daňové přiznání", "Výpis z katastru (zástava)", "Smlouva o koupi"];
      }
      if (country === "spain") {
        return [
          ...base,
          "NIE (španělské daňové ID)",
          "Výpis z účtu (typicky 3–6 měsíců)",
          "Kupní smlouva / rezervace",
          "Ocenění nemovitosti (NEOVERENO — dle banky)",
        ];
      }
      if (country === "dubai") {
        return [
          ...base,
          "Pas a víza SAE",
          "Salary certificate / employment letter",
          "Developer SPA (u off-plan)",
        ];
      }
      return [...base, "Lokální daňové ID (dle země)", "Kupní dokumentace"];
    case "CZECH_EQUITY_LOAN":
      if (collateral === "cz_property") {
        return [
          ...base,
          "List vlastnictví zástavy v ČR",
          "Fotodokumentace / odhad zástavy",
          "Účel použití prostředků (koupě v zahraničí)",
        ];
      }
      return [...base, "Zástava v ČR — bez ní cesta neprojde"];
    case "DEVELOPER_PAYMENT_PLAN":
      return ["Pas", "Developer reservation / SPA", "Důkaz rezervního vkladu"];
    case "CASH":
      return ["Důkaz původu prostředků (dle požadavků notáře / banky)"];
    case "COMBINATION":
      return [
        "Dokumentace ke všem zvoleným dílčím cestám",
        "Harmonogram čerpání a doplatků",
      ];
    default:
      return base;
  }
}

export function dossierFreshness(country: CountryId): {
  asOf: string | null;
  source: string;
} {
  try {
    const dossier = getCountryDossier(country);
    const financing = dossier.sections.find((s) => s.id === "financing");
    const claim = financing?.kind === "financing" ? financing.lanes[0]?.claim : null;
    return {
      asOf: claim?.asOf ?? LEGAL_REVIEW_FALLBACK,
      source: claim?.source ?? `country-dossier:${country}`,
    };
  } catch {
    return { asOf: LEGAL_REVIEW_FALLBACK, source: `country-dossier:${country}` };
  }
}
