import type { ChartMeta, FutureScenarioId } from "@/lib/decision-lab/types";

export type FutureLabAssumptions = {
  propGrowth: number;
  rentGrowth: number;
  inflation: number;
  /** Gross yield at t0 (annual rent / price) */
  startingYield: number;
  /**
   * Pokud > 0, kumulativní nájem se reinvestuje tímto výnosem.
   * Pokud 0, nájem se jen sčítá — netvrdíme, že se „úročí“.
   */
  reinvestmentReturn: number;
  years: number;
};

export type FutureLabInput = {
  purchasePrice: number;
  scenario: FutureScenarioId;
  /** Base assumptions before scenario deltas / custom overrides */
  base: FutureLabAssumptions;
  custom?: Partial<FutureLabAssumptions>;
};

export type FutureLabPoint = {
  year: number;
  label: string;
  propertyNominal: number;
  propertyReal: number;
  /** Součet nájmů nebo portfolio z reinvestice */
  rentAccountNominal: number;
  rentAccountReal: number;
  totalNominal: number;
  totalReal: number;
};

export type FutureLabResult = {
  scenario: FutureScenarioId;
  applied: FutureLabAssumptions;
  series: FutureLabPoint[];
  reinvestmentEnabled: boolean;
  chartMeta: ChartMeta;
  assumptionsList: string[];
};

const SCENARIO_DELTAS: Record<
  Exclude<FutureScenarioId, "custom">,
  Partial<FutureLabAssumptions>
> = {
  bear: { propGrowth: -0.02, rentGrowth: -0.01, inflation: 0.01 },
  base: {},
  bull: { propGrowth: 0.02, rentGrowth: 0.01, inflation: -0.005 },
};

export function resolveFutureAssumptions(
  input: FutureLabInput
): FutureLabAssumptions {
  if (input.scenario === "custom") {
    return { ...input.base, ...input.custom };
  }
  const d = SCENARIO_DELTAS[input.scenario];
  return {
    ...input.base,
    propGrowth: input.base.propGrowth + (d.propGrowth ?? 0),
    rentGrowth: input.base.rentGrowth + (d.rentGrowth ?? 0),
    inflation: Math.max(0, input.base.inflation + (d.inflation ?? 0)),
  };
}

export function simulateFutureLab(input: FutureLabInput): FutureLabResult {
  const applied = resolveFutureAssumptions(input);
  const reinvestmentEnabled = applied.reinvestmentReturn > 0;
  const series: FutureLabPoint[] = [];

  let prop = input.purchasePrice;
  let yearlyRent = input.purchasePrice * applied.startingYield;
  let rentAccount = 0;
  let infl = 1;

  for (let y = 1; y <= applied.years; y++) {
    prop *= 1 + applied.propGrowth;
    yearlyRent *= 1 + applied.rentGrowth;
    infl *= 1 + applied.inflation;

    if (reinvestmentEnabled) {
      rentAccount =
        rentAccount * (1 + applied.reinvestmentReturn) + yearlyRent;
    } else {
      rentAccount += yearlyRent;
    }

    const totalNom = prop + rentAccount;
    series.push({
      year: y,
      label: `Rok ${y}`,
      propertyNominal: Math.round(prop),
      propertyReal: Math.round(prop / infl),
      rentAccountNominal: Math.round(rentAccount),
      rentAccountReal: Math.round(rentAccount / infl),
      totalNominal: Math.round(totalNom),
      totalReal: Math.round(totalNom / infl),
    });
  }

  return {
    scenario: input.scenario,
    applied,
    series,
    reinvestmentEnabled,
    chartMeta: {
      title: "Simulátor budoucnosti — Laboratoř rozhodnutí",
      methodology: reinvestmentEnabled
        ? "Hodnota nemovitosti roste propGrowth. Nájem roste rentGrowth a je reinvestován sazbou reinvestmentReturn. Reálné hodnoty = nominální / kumulativní inflace."
        : "Hodnota nemovitosti roste propGrowth. Nájem roste rentGrowth a pouze se sčítá (bez úročení). Reálné hodnoty = nominální / kumulativní inflace.",
      source: "Model Laboratoře rozhodnutí + výchozí výnosy zemí",
      sourceUrl: null,
      statusNote:
        "MODELOVÝ VÝPOČET — scénáře pesimistický/základní/optimistický jsou ilustrativní změny, ne forecast.",
    },
    assumptionsList: [
      `Scénář: ${input.scenario.toUpperCase()}`,
      `Růst ceny ${(applied.propGrowth * 100).toFixed(1)} % p.a.`,
      `Růst nájmu ${(applied.rentGrowth * 100).toFixed(1)} % p.a.`,
      `Inflace ${(applied.inflation * 100).toFixed(1)} % p.a.`,
      `Počáteční hrubý výnos ${(applied.startingYield * 100).toFixed(1)} %.`,
      reinvestmentEnabled
        ? `Reinvestice nájmu ${((applied.reinvestmentReturn) * 100).toFixed(1)} % p.a.`
        : "Nájem se nesúročuje — pouze kumulativní součet.",
      `Horizont ${applied.years} let.`,
    ],
  };
}
