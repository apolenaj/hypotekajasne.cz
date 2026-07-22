import { calculateAnnuityPayment } from "@/lib/calculators";
import {
  getAdjustedMetrics,
  getMarketMetrics,
  MARKET_METRICS,
} from "@/lib/market-metrics";
import type {
  ClaimKind,
  DataQualityIndicator,
  FreePreviewResult,
  ManualPropertyInput,
  MarketComparisonSnapshot,
  ModelCashFlowSnapshot,
  RentgenInputMode,
  WarningSignal,
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

const DEFAULT_MODEL_RATE = 5;

function purposeForMarket(input: ManualPropertyInput): string {
  return input.purpose === "own_use" ? "Vlastní bydlení" : "Dlouhodobý nájem";
}

function buildDataQuality(input: ManualPropertyInput): DataQualityIndicator {
  const checks: { key: string; ok: boolean }[] = [
    { key: "Kupní cena", ok: input.priceCzk != null && input.priceCzk > 0 },
    { key: "Plocha m²", ok: input.areaM2 != null && input.areaM2 > 0 },
    { key: "Město / lokalita", ok: Boolean(input.city?.trim()) },
    { key: "Měsíční nájem", ok: input.rentMonthlyCzk != null && input.rentMonthlyCzk > 0 },
    { key: "Vlastní kapitál", ok: input.equityCzk != null && input.equityCzk > 0 },
    { key: "Typ nemovitosti", ok: Boolean(input.propertyType) },
    { key: "Účel", ok: Boolean(input.purpose) },
  ];

  const filledFields = checks.filter((c) => c.ok).map((c) => c.key);
  const missingFields = checks.filter((c) => !c.ok).map((c) => c.key);
  const ratio = filledFields.length / checks.length;
  const score = Math.round(ratio * 100);

  let band: DataQualityIndicator["band"] = "insufficient";
  if (score >= 85) band = "high";
  else if (score >= 60) band = "medium";
  else if (score >= 35) band = "low";

  const hasMarket =
    Boolean(input.city?.trim()) && input.city! in MARKET_METRICS;

  return {
    score,
    band,
    label:
      band === "high"
        ? "Vysoká completeness vstupů"
        : band === "medium"
          ? "Střední completeness — doplněním zlepšíte model"
          : band === "low"
            ? "Nízká completeness — výsledky orientační"
            : "Nedostatek vstupů",
    filledFields,
    missingFields,
    note: hasMarket
      ? "Pro lokalitu máme modelovou referenci trhu — srovnání je k dispozici."
      : "Bez katalogové lokality neporovnáváme s trhem — ne vymýšlíme data.",
  };
}

function buildMarketComparison(
  input: ManualPropertyInput,
  pricePerM2: number | null
): MarketComparisonSnapshot | null {
  const city = input.city?.trim();
  if (!city) return null;

  const hasMarketData = city in MARKET_METRICS;
  if (!hasMarketData) return null;
  const market = getAdjustedMetrics(
    city,
    input.propertyType || "Byt",
    purposeForMarket(input)
  );

  const propertyPpm: MarketComparisonSnapshot["propertyPricePerM2"] = {
    value: pricePerM2,
    kind: pricePerM2 != null ? "DATA" : "NEOVERENO",
    note:
      pricePerM2 != null
        ? "Z vaší ceny a plochy."
        : "Chybí cena nebo plocha.",
  };

  const marketRef: MarketComparisonSnapshot["marketReferencePerM2"] = {
    value: Math.round(market.pricePerM2),
    kind: "MODEL",
    note: `Modelová reference pro „${city}“ (${input.propertyType || "Byt"}).`,
  };

  let delta: MarketComparisonSnapshot["deltaPercent"] = {
    value: null,
    kind: "NEOVERENO",
    note: "Nelze spočítat bez ceny/m² a reference.",
  };

  if (
    pricePerM2 != null &&
    marketRef.value != null &&
    marketRef.value > 0
  ) {
    const d = ((pricePerM2 - marketRef.value) / marketRef.value) * 100;
    delta = {
      value: Math.round(d * 10) / 10,
      kind: "MODEL",
      note: "Rozdíl vůči modelové referenci — ne live tržní cena.",
    };
  }

  const marketYield: MarketComparisonSnapshot["marketYieldPa"] = {
    value: market.yield,
    kind: "MODEL",
    note: "Modelový hrubý výnos lokality.",
  };

  const summary =
    delta.value != null
      ? `Jednotka je ${delta.value > 0 ? "nad" : delta.value < 0 ? "pod" : "na"} modelovou referencí lokality (${delta.value > 0 ? "+" : ""}${delta.value ?? 0} %).`
      : `Lokalita „${city}“ má modelovou referenci ${marketRef.value?.toLocaleString("cs-CZ") ?? "—"} Kč/m².`;

  return {
    city,
    hasMarketData: true,
    propertyPricePerM2: propertyPpm,
    marketReferencePerM2: marketRef,
    deltaPercent: delta,
    marketYieldPa: marketYield,
    summary,
    kind: "MODEL",
  };
}

function buildModelCashFlow(
  input: ManualPropertyInput,
  modelRatePercent = DEFAULT_MODEL_RATE
): ModelCashFlowSnapshot | null {
  const price = input.priceCzk;
  if (price == null || price <= 0) return null;

  const equity = Math.max(0, input.equityCzk ?? 0);
  const loan = Math.max(0, price - equity);
  const termYears = 25;

  let rentMonthly: number | null = input.rentMonthlyCzk;
  let rentKind: ClaimKind = "DATA";
  if (rentMonthly == null || rentMonthly <= 0) {
    if (input.city && input.purpose === "investment") {
      const m = getAdjustedMetrics(
        input.city,
        input.propertyType || "Byt",
        purposeForMarket(input)
      );
      rentMonthly = Math.round((price * (m.yield / 100)) / 12);
      rentKind = "MODEL";
    } else {
      rentMonthly = null;
      rentKind = "NEOVERENO";
    }
  }

  const mortgage =
    loan > 0
      ? Math.round(calculateAnnuityPayment(loan, modelRatePercent, termYears))
      : 0;

  const ops =
    rentMonthly != null && rentMonthly > 0
      ? Math.round(rentMonthly * 0.15)
      : 0;

  const net =
    rentMonthly != null ? rentMonthly - mortgage - ops : null;

  return {
    monthlyRent: {
      value: rentMonthly,
      kind: rentKind,
      note:
        rentKind === "DATA"
          ? "Vámi zadaný nájem."
          : "Modelový nájem z výnosové reference lokality.",
    },
    monthlyMortgageModel: {
      value: mortgage,
      kind: "MODEL",
      note: `Modelová anuita při sazbě ${modelRatePercent} %, úvěr ${loan.toLocaleString("cs-CZ")} Kč, ${termYears} let.`,
    },
    monthlyOpsModel: {
      value: ops,
      kind: "MODEL",
      note: "Orientační 15 % nájmu na provoz/vacancy (MODEL).",
    },
    netMonthlyModel: {
      value: net,
      kind: net != null ? "MODEL" : "NEOVERENO",
      note: "Hrubý měsíční tok před daněmi a rezervou — ne garantovaný cash flow.",
    },
    modelRatePercent,
    note: "Modelové cash flow — ne schválení úvěru ani garantovaný výnos.",
  };
}

/**
 * Free preview — jen z uživatelských vstupů + modelových metrik lokality.
 * Ne scrapujeme URL obsah; neprodáváme právní fakta.
 */
export function buildFreePreview(
  input: ManualPropertyInput,
  mode: RentgenInputMode,
  modelRatePercent = DEFAULT_MODEL_RATE
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
    const adj = getAdjustedMetrics(
      input.city,
      input.propertyType || "Byt",
      purposeForMarket(input)
    );
    orientationalYieldPa = {
      value: adj.yield,
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

  const warningSignals: WarningSignal[] = [];

  if (mode === "url" && !input.listingUrl.trim()) {
    warningSignals.push({
      id: "url_missing",
      text: "URL režim bez odkazu — není co referencovat.",
      kind: "NEOVERENO",
      severity: "watch",
    });
  }
  if (price != null && area != null && area > 0 && input.city && input.city in MARKET_METRICS) {
    const computed = price / area;
    const ref = getAdjustedMetrics(
      input.city,
      input.propertyType || "Byt",
      purposeForMarket(input)
    ).pricePerM2;
    if (computed > ref * 1.35) {
      warningSignals.push({
        id: "price_above_market",
        text: `Cena/m² (${Math.round(computed).toLocaleString("cs-CZ")}) je výrazně nad modelovou referencí lokality (${Math.round(ref).toLocaleString("cs-CZ")}). Ověřte lokalitu a stav — nejde o právní závěr.`,
        kind: "ODHAD",
        severity: "alert",
      });
    } else if (computed < ref * 0.65) {
      warningSignals.push({
        id: "price_below_market",
        text: "Cena/m² výrazně pod modelovou referencí lokality — může jít o příležitost nebo skryté riziko (stav, právní vady). Neověřeno.",
        kind: "ODHAD",
        severity: "watch",
      });
    }
  }
  if (
    input.purpose === "investment" &&
    (input.rentMonthlyCzk == null || input.rentMonthlyCzk <= 0)
  ) {
    warningSignals.push({
      id: "rent_missing",
      text: "Investiční účel bez zadaného nájmu — výnos jen z modelové lokality, ne z konkrétní jednotky.",
      kind: "ODHAD",
      severity: "watch",
    });
  }
  if (price != null && equity > 0 && equity < price * 0.1) {
    warningSignals.push({
      id: "low_equity",
      text: "Vlastní kapitál pod 10 % ceny — financování může být obtížnější (ODHAD).",
      kind: "ODHAD",
      severity: "alert",
    });
  }

  const dataQuality = buildDataQuality(input);
  if (dataQuality.band === "low" || dataQuality.band === "insufficient") {
    warningSignals.push({
      id: "data_quality",
      text: `Nízká kvalita vstupů (${dataQuality.score}/100) — doplněte: ${dataQuality.missingFields.slice(0, 3).join(", ")}.`,
      kind: "MODEL",
      severity: "watch",
    });
  }

  if (warningSignals.length === 0) {
    warningSignals.push({
      id: "no_strong",
      text: "Z dostupných vstupů nevyplynul silný rizikový signál. Absence varování ≠ absence rizika.",
      kind: "ODHAD",
      severity: "info",
    });
  }

  const marketComparison = buildMarketComparison(
    input,
    pricePerM2.value
  );
  const modelCashFlow = buildModelCashFlow(input, modelRatePercent);

  return {
    generatedAt: new Date().toISOString(),
    inputMode: mode,
    orientationalYieldPa,
    pricePerM2,
    marketComparison,
    modelCashFlow,
    financingFit,
    warningSignals,
    redFlags: warningSignals,
    dataQuality,
    limitations,
  };
}
