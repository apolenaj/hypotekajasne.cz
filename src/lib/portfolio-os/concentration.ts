import type { PortfolioPropertyRow } from "@/lib/portfolio-os/types";
import type { ConcentrationAlert } from "@/lib/portfolio-os/types";

const MONTHS_REFIX_WINDOW = 18;

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function analyzeConcentration(input: {
  rows: PortfolioPropertyRow[];
  rentCurrencyByTwinId: Record<string, string>;
  now?: Date;
}): ConcentrationAlert[] {
  const { rows } = input;
  const now = input.now ?? new Date();
  const alerts: ConcentrationAlert[] = [];

  const totalValue = rows.reduce((s, r) => s + (r.valueCzk ?? 0), 0);
  const totalDebt = rows.reduce((s, r) => s + (r.debtCzk ?? 0), 0);
  const totalCf = rows.reduce(
    (s, r) => s + Math.max(0, r.monthlyNetCashFlowCzk ?? 0),
    0
  );
  const totalRent = rows.reduce(
    (s, r) => s + (r.monthlyGrossRentCzk ?? 0),
    0
  );

  if (totalValue > 0) {
    const byCity = new Map<string, number>();
    for (const r of rows) {
      const city = r.city ?? "Neuvedeno";
      byCity.set(city, (byCity.get(city) ?? 0) + (r.valueCzk ?? 0));
    }
    for (const [city, val] of byCity) {
      const share = pct(val, totalValue);
      if (share >= 50) {
        alerts.push({
          id: `conc_city_${city}`,
          dimension: "city",
          severity: share >= 60 ? "high" : "notable",
          headline: `${share} % portfolia je v jednom městě (${city}).`,
          explanation:
            "Koncentrace hodnoty v jedné lokalitě zvyšuje citlivost na místní trh a likviditu. Orientační model podle posledních pozorování hodnoty.",
          metricPct: share,
          claimKind: "MODEL",
        });
      }
    }

    const byCountry = new Map<string, number>();
    for (const r of rows) {
      const c = r.country ?? "Neuvedeno";
      byCountry.set(c, (byCountry.get(c) ?? 0) + (r.valueCzk ?? 0));
    }
    for (const [country, val] of byCountry) {
      const share = pct(val, totalValue);
      if (share >= 55 && byCountry.size > 1) {
        alerts.push({
          id: `conc_country_${country}`,
          dimension: "country",
          severity: "notable",
          headline: `${share} % hodnoty portfolia je v zemi ${country}.`,
          explanation: "Geografická koncentrace — zvažte diverzifikaci v modelových scénářích.",
          metricPct: share,
          claimKind: "MODEL",
        });
      }
    }

    const byType = new Map<string, number>();
    for (const r of rows) {
      const t = r.propertyType ?? "Neuvedeno";
      byType.set(t, (byType.get(t) ?? 0) + (r.valueCzk ?? 0));
    }
    for (const [type, val] of byType) {
      const share = pct(val, totalValue);
      if (share >= 70) {
        alerts.push({
          id: `conc_type_${type}`,
          dimension: "property_type",
          severity: "notable",
          headline: `${share} % portfolia tvoří typ „${type}".`,
          explanation: "Typová koncentrace — jeden segment trhu ovlivňuje celkový profil.",
          metricPct: share,
          claimKind: "MODEL",
        });
      }
    }
  }

  if (totalDebt > 0) {
    const windowEnd = new Date(now);
    windowEnd.setMonth(windowEnd.getMonth() + MONTHS_REFIX_WINDOW);
    let debtRefixing = 0;
    for (const r of rows) {
      if (!r.fixationEnd || !r.debtCzk) continue;
      const fix = Date.parse(r.fixationEnd);
      if (Number.isFinite(fix) && fix <= windowEnd.getTime()) {
        debtRefixing += r.debtCzk;
      }
    }
    const share = pct(debtRefixing, totalDebt);
    if (share >= 40) {
      alerts.push({
        id: "conc_refix",
        dimension: "refixation",
        severity: share >= 55 ? "high" : "notable",
        headline: `${share} % dluhu refixuje během ${MONTHS_REFIX_WINDOW} měsíců.`,
        explanation:
          "Cluster fixací zvyšuje citlivost na vývoj sazeb — připravte scénáře refinancování (ne příkaz k prodeji).",
        metricPct: share,
        claimKind: "DATA",
      });
    }
  }

  if (totalRent > 0) {
    let eurRent = 0;
    for (const r of rows) {
      const cur = input.rentCurrencyByTwinId[r.twinId] ?? "CZK";
      if (cur === "EUR" && r.monthlyGrossRentCzk) {
        eurRent += r.monthlyGrossRentCzk;
      }
    }
    const share = pct(eurRent, totalRent);
    if (share >= 25) {
      alerts.push({
        id: "conc_eur_income",
        dimension: "currency_income",
        severity: share >= 40 ? "high" : "notable",
        headline: `${share} % příjmů z nájmu je v EUR (po přepočtu pro model).`,
        explanation:
          "Měnová expozice příjmů — FX scénáře ovlivní disponibilní cash flow v CZK.",
        metricPct: share,
        claimKind: "MODEL",
      });
    }
  }

  if (totalCf > 0) {
    const sorted = [...rows].sort(
      (a, b) => (b.monthlyNetCashFlowCzk ?? 0) - (a.monthlyNetCashFlowCzk ?? 0)
    );
    const top = sorted[0];
    if (top?.monthlyNetCashFlowCzk != null) {
      const share = pct(Math.max(0, top.monthlyNetCashFlowCzk), totalCf);
      if (share >= 50) {
        alerts.push({
          id: `conc_cf_${top.twinId}`,
          dimension: "cash_flow_single",
          severity: share >= 65 ? "high" : "notable",
          headline: `Jedna nemovitost vytváří ${share} % cash flow („${top.label}“).`,
          explanation:
            "Závislost na jednom assetu — při výpadku nájmu nebo refinancování dopadne na portfolio neúměrně.",
          metricPct: share,
          claimKind: "MODEL",
        });
      }
    }
  }

  return alerts.sort((a, b) => b.metricPct - a.metricPct);
}
