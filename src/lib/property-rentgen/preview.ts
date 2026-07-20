import { getMarketMetrics } from "@/lib/market-metrics";
import type {
  ClaimKind,
  FreePreviewResult,
  ManualPropertyInput,
  RentgenInputMode,
} from "@/lib/property-rentgen/types";

export const EMPTY_MANUAL_INPUT: ManualPropertyInput = {
  country: "Česká republika",
  city: "Praha",
  propertyType: "Byt",
  areaM2: null,
  priceCzk: null,
  rentMonthlyCzk: null,
  equityCzk: null,
  purpose: "investment",
  listingUrl: "",
};

/**
 * Free preview — jen z uživatelských vstupů + modelových metrik lokality.
 * Ne scrapujeme URL obsah; neprodáváme právní fakta.
 */
export function buildFreePreview(
  input: ManualPropertyInput,
  mode: RentgenInputMode
): FreePreviewResult {
  const limitations: string[] = [
    "Bezplatný náhled není kompletní due diligence ani nabídka banky.",
    "Právní a technická fakta bez zdroje označujeme jako Neověřeno a nevyplňujeme je.",
  ];

  if (mode === "url" && input.listingUrl.trim()) {
    limitations.push(
      "URL evidujeme jen jako referenci — obsah inzerátu automaticky neověřujeme."
    );
  }
  if (mode === "upload") {
    limitations.push(
      "Nahrání dokumentů a fotek připravujeme — zatím použijte manuální údaje nebo Prémiovou analýzu."
    );
  }

  const price = input.priceCzk;
  const area = input.areaM2;
  const market = getMarketMetrics(input.city || "Praha");

  let pricePerM2: FreePreviewResult["pricePerM2"];
  if (price != null && price > 0 && area != null && area > 0) {
    pricePerM2 = {
      value: Math.round(price / area),
      kind: "DATA",
      note: "Spočteno z vámi zadané ceny a plochy.",
    };
  } else if (input.city) {
    pricePerM2 = {
      value: Math.round(market.pricePerM2),
      kind: "MODEL",
      note: `Modelová referenční cena/m² pro lokalitu „${input.city}“ — ne aktuální nabídka.`,
    };
  } else {
    pricePerM2 = {
      value: null,
      kind: "NEOVERENO",
      note: "Chybí cena, plocha i lokalita.",
    };
  }

  let orientationalYieldPa: FreePreviewResult["orientationalYieldPa"];
  if (
    price != null &&
    price > 0 &&
    input.rentMonthlyCzk != null &&
    input.rentMonthlyCzk > 0
  ) {
    const y = ((input.rentMonthlyCzk * 12) / price) * 100;
    orientationalYieldPa = {
      value: Math.round(y * 10) / 10,
      kind: "DATA",
      note: "Hrubý výnos z vámi zadaného nájmu a ceny (bez nákladů a daní).",
    };
  } else if (input.purpose === "investment" && input.city) {
    orientationalYieldPa = {
      value: market.yield,
      kind: "MODEL",
      note: `Modelový hrubý výnos lokality „${input.city}“ — ne garantovaný výnos.`,
    };
  } else if (input.purpose === "own_use") {
    orientationalYieldPa = {
      value: null,
      kind: "NEOVERENO",
      note: "U vlastního bydlení výnos z nájmu nepočítáme bez zadaného nájmu.",
    };
  } else {
    orientationalYieldPa = {
      value: null,
      kind: "NEOVERENO",
      note: "Doplňte cenu a nájem, nebo lokalitu pro modelový výnos.",
    };
  }

  const equity = input.equityCzk ?? 0;
  let financingFit: FreePreviewResult["financingFit"];
  if (price != null && price > 0) {
    const ltv = Math.max(0, Math.min(100, ((price - equity) / price) * 100));
    const ltvRounded = Math.round(ltv);
    if (equity <= 0) {
      financingFit = {
        value: `Bez zadaného vlastního kapitálu — modelové LTV by bylo ~${ltvRounded} % (celá cena úvěrem). Odhad, ne posouzení banky.`,
        kind: "ODHAD",
      };
    } else if (ltvRounded > 90) {
      financingFit = {
        value: `Orientační LTV ~${ltvRounded} % — vysoká páka; banky často vyžadují vyšší vlastní zdroje. ODHAD.`,
        kind: "ODHAD",
      };
    } else if (ltvRounded > 80) {
      financingFit = {
        value: `Orientační LTV ~${ltvRounded} % — na hranici běžných rámců. ODHAD, ne schválení.`,
        kind: "ODHAD",
      };
    } else {
      financingFit = {
        value: `Orientační LTV ~${ltvRounded} % při zadaném vlastním kapitálu. Odhad financovatelnosti — finální posouzení banka/partner.`,
        kind: "ODHAD",
      };
    }
  } else {
    financingFit = {
      value: "Doplňte kupní cenu (a ideálně vlastní kapitál) pro základní odhad financovatelnosti.",
      kind: "NEOVERENO",
    };
  }

  const redFlags: { text: string; kind: ClaimKind }[] = [];

  if (mode === "url" && !input.listingUrl.trim()) {
    redFlags.push({
      text: "URL režim bez odkazu — není co referencovat.",
      kind: "NEOVERENO",
    });
  }
  if (price != null && area != null && area > 0 && input.city) {
    const computed = price / area;
    const ref = market.pricePerM2;
    if (computed > ref * 1.35) {
      redFlags.push({
        text: `Cena/m² (${Math.round(computed).toLocaleString("cs-CZ")}) je výrazně nad modelovou referencí lokality (${Math.round(ref).toLocaleString("cs-CZ")}). Ověřte lokalitu a stav — nejde o právní závěr.`,
        kind: "ODHAD",
      });
    } else if (computed < ref * 0.65) {
      redFlags.push({
        text: `Cena/m² výrazně pod modelovou referencí lokality — může jít o příležitost nebo skryté riziko (stav, právní vady). Neověřeno.`,
        kind: "ODHAD",
      });
    }
  }
  if (
    input.purpose === "investment" &&
    (input.rentMonthlyCzk == null || input.rentMonthlyCzk <= 0)
  ) {
    redFlags.push({
      text: "Investiční účel bez zadaného nájmu — výnos jen z modelové lokality, ne z konkrétní jednotky.",
      kind: "ODHAD",
    });
  }
  if (price != null && equity > 0 && equity < price * 0.1) {
    redFlags.push({
      text: "Equity pod 10 % ceny — financování může být obtížnější (ODHAD).",
      kind: "ODHAD",
    });
  }
  if (redFlags.length === 0) {
    redFlags.push({
      text: "Z dostupných vstupů nevyplynul silný rizikový signál. Absence varování ≠ absence rizika.",
      kind: "ODHAD",
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    inputMode: mode,
    orientationalYieldPa,
    pricePerM2,
    financingFit,
    redFlags,
    limitations,
  };
}
