/**
 * Presentation-ready chart series shared by the web and PDF reports.
 *
 * This module intentionally knows nothing about the control model or case study.
 * Callers adapt their model output into these small numeric inputs.
 */

export type ChartMeta = {
  id: string;
  questionCs: string;
  unitCs: string;
  periodCs: string;
  interpretationCs: string;
  assumptionsCs: string[];
};

export type ChartSeries<T> = { meta: ChartMeta; data: T };

export type CashNeededStacked = {
  equityCzk: number;
  fitoutCzk: number;
  optionalFitoutCzk: number;
  closingCzk: number;
  reserveCzk: number;
  totalRequiredCzk: number;
  totalWithOptionalFitoutCzk: number;
};

export type BeforeAfterPanel = {
  label: string;
  beforeCzk: number;
  afterCzk: number;
  scaleMaxAbsCzk: number;
};

export type BeforeAfterPanels = {
  monthlyCashFlow: BeforeAfterPanel;
  ownCash: BeforeAfterPanel;
  ownerCosts: BeforeAfterPanel;
};

export type TornadoDelta = {
  label: string;
  deltaCzk: number;
  changeNote: string;
};

export type TornadoDeltas = TornadoDelta[];

export type ReservePathMonth = {
  month: number;
  openingCzk: number;
  closingCzk: number;
  hypotheticalClosingCzk: number;
  empty: boolean;
  repair: boolean;
  relet: boolean;
  topup: boolean;
};

export type ReservePathSeries = {
  months: ReservePathMonth[];
  minCzk: number;
  hypotheticalMinCzk: number;
  zeroLineCzk: 0;
};

export type RefixTimePoint = {
  month: number;
  cfNoRefixCzk: number;
  cfWithRefixCzk: number;
};

export type RefixTimeSeries = {
  months: RefixTimePoint[];
  refixMonth: number;
};

export type EquityDebtPoint = {
  year: number;
  propertyValueCzk: number;
  debtCzk: number;
  equityCzk: number;
};

export type EquityDebtSeries = EquityDebtPoint[];

export type SaleWaterfall = {
  salePriceCzk: number;
  costsCzk: number;
  debtCzk: number;
  netProceedsCzk: number;
};

export type SettlementWaterfall = {
  initialOutlayCzk: number;
  topupsCzk: number;
  saleAndReserveCzk: number;
  totalCzk: number;
};

export type MarketScatterPoint = {
  x: number;
  y: number;
  isModel: boolean;
  label: string;
};

type MetaOverride = Partial<Omit<ChartMeta, "id">>;

function meta(
  id: string,
  defaults: Omit<ChartMeta, "id">,
  override?: MetaOverride
): ChartMeta {
  return { id, ...defaults, ...override };
}

export function buildCashNeededStacked(
  input: Omit<CashNeededStacked, "totalRequiredCzk" | "totalWithOptionalFitoutCzk">,
  metaOverride?: MetaOverride
): ChartSeries<CashNeededStacked> {
  const totalRequiredCzk =
    input.equityCzk + input.fitoutCzk + input.closingCzk + input.reserveCzk;
  return {
    meta: meta(
      "cash-needed",
      {
        questionCs: "Kolik vlastní hotovosti je potřeba?",
        unitCs: "Kč",
        periodCs: "Při pořízení",
        interpretationCs:
          "Volitelné vybavení je oddělené od částky nutné pro uskutečnění investice.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: {
      ...input,
      totalRequiredCzk,
      totalWithOptionalFitoutCzk: totalRequiredCzk + input.optionalFitoutCzk,
    },
  };
}

export function buildBeforeAfterPanels(
  input: {
    monthlyCashFlow: Omit<BeforeAfterPanel, "label" | "scaleMaxAbsCzk">;
    ownCash: Omit<BeforeAfterPanel, "label" | "scaleMaxAbsCzk">;
    ownerCosts: Omit<BeforeAfterPanel, "label" | "scaleMaxAbsCzk">;
  },
  metaOverride?: MetaOverride
): ChartSeries<BeforeAfterPanels> {
  const panel = (
    label: string,
    values: Omit<BeforeAfterPanel, "label" | "scaleMaxAbsCzk">
  ): BeforeAfterPanel => ({
    label,
    ...values,
    scaleMaxAbsCzk: Math.max(
      Math.abs(values.beforeCzk),
      Math.abs(values.afterCzk),
      1
    ),
  });
  return {
    meta: meta(
      "before-after",
      {
        questionCs: "Co změnilo zpracování podkladů?",
        unitCs: "Kč",
        periodCs: "Měsíčně a při pořízení",
        interpretationCs:
          "Každý panel používá vlastní stupnici; porovnává se změna uvnitř panelu.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: {
      monthlyCashFlow: panel("Měsíční cash flow", input.monthlyCashFlow),
      ownCash: panel("Vlastní hotovost", input.ownCash),
      ownerCosts: panel("Náklady vlastníka", input.ownerCosts),
    },
  };
}

export function buildTornadoDeltas(
  input: TornadoDeltas,
  metaOverride?: MetaOverride
): ChartSeries<TornadoDeltas> {
  return {
    meta: meta(
      "tornado-deltas",
      {
        questionCs: "Co nejvíc mění měsíční výsledek?",
        unitCs: "Kč/měs.",
        periodCs: "Proti základnímu scénáři",
        interpretationCs:
          "Délka pruhu vyjadřuje absolutní dopad, znaménko směr změny.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: [...input].sort(
      (a, b) => Math.abs(b.deltaCzk) - Math.abs(a.deltaCzk)
    ),
  };
}

export type ReservePathInputMonth = {
  month: number;
  openingCzk: number;
  closingCzk: number;
  topupCzk?: number;
  empty?: boolean;
  repair?: boolean;
  relet?: boolean;
};

export function buildReservePathSeries(
  input: ReservePathInputMonth[],
  metaOverride?: MetaOverride
): ChartSeries<ReservePathSeries> {
  let cumulativeTopups = 0;
  const months = input.map((row) => {
    const topupCzk = Math.max(0, row.topupCzk ?? 0);
    cumulativeTopups += topupCzk;
    return {
      month: row.month,
      openingCzk: row.openingCzk,
      closingCzk: row.closingCzk,
      hypotheticalClosingCzk: row.closingCzk - cumulativeTopups,
      empty: row.empty ?? false,
      repair: row.repair ?? false,
      relet: row.relet ?? false,
      topup: topupCzk > 0,
    };
  });
  return {
    meta: meta(
      "reserve-path",
      {
        questionCs: "Vydrží hotovostní rezerva stres?",
        unitCs: "Kč",
        periodCs: "Po měsících",
        interpretationCs:
          "Plná čára ukazuje skutečný zůstatek po doplnění; přerušovaná hypotetický stav bez doplnění.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: {
      months,
      minCzk:
        months.length > 0
          ? Math.min(...months.map((row) => row.closingCzk))
          : 0,
      hypotheticalMinCzk:
        months.length > 0
          ? Math.min(...months.map((row) => row.hypotheticalClosingCzk))
          : 0,
      zeroLineCzk: 0,
    },
  };
}

export function buildRefixTimeSeries(
  months: RefixTimePoint[],
  refixMonth: number,
  metaOverride?: MetaOverride
): ChartSeries<RefixTimeSeries> {
  return {
    meta: meta(
      "refix-compare",
      {
        questionCs: "Jak refixace změní měsíční cash flow?",
        unitCs: "Kč/měs.",
        periodCs: "Po měsících",
        interpretationCs:
          "Svislá značka odděluje období před refixací od období s novou splátkou.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: { months: [...months], refixMonth },
  };
}

export function buildEquityDebtSeries(
  input: Array<Omit<EquityDebtPoint, "equityCzk"> & { equityCzk?: number }>,
  metaOverride?: MetaOverride
): ChartSeries<EquityDebtSeries> {
  return {
    meta: meta(
      "equity-debt",
      {
        questionCs: "Jak se vyvíjí dluh a vlastní kapitál?",
        unitCs: "Kč",
        periodCs: "Po letech",
        interpretationCs:
          "Vlastní kapitál je hodnota nemovitosti po odečtení zbývajícího dluhu.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: input.map((row) => ({
      ...row,
      equityCzk: row.equityCzk ?? row.propertyValueCzk - row.debtCzk,
    })),
  };
}

export function buildSaleWaterfall(
  input: Omit<SaleWaterfall, "netProceedsCzk"> & { netProceedsCzk?: number },
  metaOverride?: MetaOverride
): ChartSeries<SaleWaterfall> {
  return {
    meta: meta(
      "sale-waterfall",
      {
        questionCs: "Kolik hotovosti zbude z prodeje?",
        unitCs: "Kč",
        periodCs: "Při prodeji",
        interpretationCs:
          "Z prodejní ceny se odečtou náklady prodeje a nesplacený dluh.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: {
      ...input,
      netProceedsCzk:
        input.netProceedsCzk ??
        input.salePriceCzk - input.costsCzk - input.debtCzk,
    },
  };
}

export function buildSettlementWaterfall(
  input: Omit<SettlementWaterfall, "totalCzk"> & { totalCzk?: number },
  metaOverride?: MetaOverride
): ChartSeries<SettlementWaterfall> {
  const initialOutlayCzk = -Math.abs(input.initialOutlayCzk);
  const topupsCzk = -Math.abs(input.topupsCzk);
  return {
    meta: meta(
      "settlement-waterfall",
      {
        questionCs: "Jak dopadne celkové vypořádání investice?",
        unitCs: "Kč",
        periodCs: "Od pořízení do prodeje",
        interpretationCs:
          "Počáteční hotovost a doplnění jsou záporné; prodej a uvolněná rezerva kladné.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: {
      initialOutlayCzk,
      topupsCzk,
      saleAndReserveCzk: input.saleAndReserveCzk,
      totalCzk:
        input.totalCzk ??
        initialOutlayCzk + topupsCzk + input.saleAndReserveCzk,
    },
  };
}

export function buildMarketScatter(
  input: MarketScatterPoint[],
  metaOverride?: MetaOverride
): ChartSeries<MarketScatterPoint[]> {
  return {
    meta: meta(
      "market-scatter",
      {
        questionCs: "Kde leží model vůči srovnatelným nabídkám?",
        unitCs: "Kč nebo Kč/m²",
        periodCs: "K datu sběru nabídek",
        interpretationCs:
          "Zlatý bod je model; ostatní body jsou vstupní srovnávací nabídky.",
        assumptionsCs: [],
      },
      metaOverride
    ),
    data: [...input],
  };
}
