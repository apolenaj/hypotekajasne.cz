/**
 * Verified Czech market series for homepage price chart.
 * Values are transcribed from public publications — not estimated from chart images.
 * Update process: see README.md in this folder.
 */

export type MarketUnit =
  | "czk_per_m2"
  | "eur_per_m2_month"
  | "percent"
  | "index_2010";

export type MarketMetricKind =
  | "transaction_price_avg"
  | "prime_rent"
  | "vacancy_rate"
  | "prime_yield"
  | "price_index";

export type MarketPoint = {
  /** Calendar year of the observation (year-end / annual average as noted). */
  year: number;
  value: number;
};

export type MarketSeries = {
  id: string;
  labelCs: string;
  segment: "pozemky" | "komercni";
  subtype: string;
  metric: MarketMetricKind;
  metricLabelCs: string;
  unit: MarketUnit;
  unitLabelCs: string;
  locationCs: string;
  frequency: "annual" | "year_end";
  priceKind: "realized" | "asking" | "prime" | "index" | "not_applicable";
  aggregation: "average" | "median" | "prime" | "index";
  points: MarketPoint[];
  sourceName: string;
  sourceUrl: string;
  publishedAt: string | null;
  verifiedAt: string;
  methodologyCs: string;
  tableOrPage: string | null;
  updateHintCs: string;
};

const VERIFIED = "2026-09-19";

/** Kč/ha ÷ 10_000 → Kč/m², one decimal (matches FARMY.CZ published m² labels). */
function haToM2(kcPerHa: number): number {
  return Math.round((kcPerHa / 10_000) * 10) / 10;
}

/**
 * FARMY.CZ — průměrná tržní cena zemědělské půdy, ČR.
 * Source PDF graph values in Kč/ha (leden 2026 report) + published Kč/m² where stated.
 * Realized market monitoring; excludes land transferred for non-agricultural use.
 */
const FARMY_AGRI_HA: Record<number, number> = {
  2008: 86_673,
  2009: 96_300,
  2010: 102_456,
  2011: 108_100,
  2012: 118_712,
  2013: 124_070,
  2014: 139_590,
  2015: 162_565,
  2016: 204_085,
  2017: 235_111,
  2018: 240_850,
  2019: 243_985,
  2020: 253_510,
  2021: 294_326,
  2022: 334_080,
  2023: 343_725,
  2024: 360_360,
  2025: 372_550,
};

/** Orná vs TTP — Kč/m² from FARMY.CZ leden 2026, graf 3 (2019–2025). */
const FARMY_ORNA_M2: Record<number, number> = {
  2019: 26.2,
  2020: 27.1,
  2021: 31.4,
  2022: 35.2,
  2023: 36.1,
  2024: 37.9,
  2025: 39.6,
};

const FARMY_TTP_M2: Record<number, number> = {
  2019: 19.0,
  2020: 20.1,
  2021: 23.6,
  2022: 28.0,
  2023: 29.3,
  2024: 30.5,
  2025: 30.3,
};

function pointsFromRecord(record: Record<number, number>): MarketPoint[] {
  return Object.entries(record)
    .map(([year, value]) => ({ year: Number(year), value }))
    .sort((a, b) => a.year - b.year);
}

export const CZ_MARKET_SERIES: MarketSeries[] = [
  {
    id: "farmy-agri-avg-cz",
    labelCs: "Zemědělská půda — průměrná tržní cena",
    segment: "pozemky",
    subtype: "zemedelske",
    metric: "transaction_price_avg",
    metricLabelCs: "Průměrná tržní cena",
    unit: "czk_per_m2",
    unitLabelCs: "Kč/m²",
    locationCs: "Česká republika",
    frequency: "annual",
    priceKind: "realized",
    aggregation: "average",
    points: Object.entries(FARMY_AGRI_HA)
      .map(([year, ha]) => ({ year: Number(year), value: haToM2(ha) }))
      .sort((a, b) => a.year - b.year),
    sourceName: "FARMY.CZ — Zpráva o trhu s půdou (leden 2026)",
    sourceUrl:
      "https://www.farmy.cz/download/zpravy_o_trhu/ZPRAVA-o-trhu-s-pudou-FARMYCZ-leden-2026.pdf",
    publishedAt: "2026-01",
    verifiedAt: VERIFIED,
    methodologyCs:
      "Průměrná monitorovaná tržní cena zemědělské půdy (realizované obchody). Nejde o úřední cenu BPEJ. Převody pro stavební nebo rekreační využití nejsou zahrnuty. Hodnoty v Kč/m² jsou přepočteny z publikovaných Kč/ha (÷ 10 000).",
    tableOrPage: "Graf 1 — Vývoj tržních cen půdy 2008–2025",
    updateHintCs:
      "Jednou ročně po vydání lednové zprávy FARMY.CZ přepsat Kč/ha do FARMY_AGRI_HA a spustit testy.",
  },
  {
    id: "farmy-orna-cz",
    labelCs: "Orná půda — průměrná tržní cena",
    segment: "pozemky",
    subtype: "orna",
    metric: "transaction_price_avg",
    metricLabelCs: "Průměrná tržní cena orné půdy",
    unit: "czk_per_m2",
    unitLabelCs: "Kč/m²",
    locationCs: "Česká republika",
    frequency: "annual",
    priceKind: "realized",
    aggregation: "average",
    points: pointsFromRecord(FARMY_ORNA_M2),
    sourceName: "FARMY.CZ — Zpráva o trhu s půdou (leden 2026)",
    sourceUrl:
      "https://www.farmy.cz/download/zpravy_o_trhu/ZPRAVA-o-trhu-s-pudou-FARMYCZ-leden-2026.pdf",
    publishedAt: "2026-01",
    verifiedAt: VERIFIED,
    methodologyCs:
      "Průměrná tržní cena orné půdy. Odděleno od trvalých travních porostů. Publikováno přímo v Kč/m².",
    tableOrPage: "Graf 3 — Orná půda a TTP 2019–2025",
    updateHintCs: "Po nové zprávě FARMY.CZ aktualizovat FARMY_ORNA_M2.",
  },
  {
    id: "farmy-ttp-cz",
    labelCs: "Trvalé travní porosty — průměrná tržní cena",
    segment: "pozemky",
    subtype: "ttp",
    metric: "transaction_price_avg",
    metricLabelCs: "Průměrná tržní cena TTP",
    unit: "czk_per_m2",
    unitLabelCs: "Kč/m²",
    locationCs: "Česká republika",
    frequency: "annual",
    priceKind: "realized",
    aggregation: "average",
    points: pointsFromRecord(FARMY_TTP_M2),
    sourceName: "FARMY.CZ — Zpráva o trhu s půdou (leden 2026)",
    sourceUrl:
      "https://www.farmy.cz/download/zpravy_o_trhu/ZPRAVA-o-trhu-s-pudou-FARMYCZ-leden-2026.pdf",
    publishedAt: "2026-01",
    verifiedAt: VERIFIED,
    methodologyCs:
      "Průměrná tržní cena trvalých travních porostů. Neslučovat s ornou půdou ani se stavebními pozemky.",
    tableOrPage: "Graf 3 — Orná půda a TTP 2019–2025",
    updateHintCs: "Po nové zprávě FARMY.CZ aktualizovat FARMY_TTP_M2.",
  },
  {
    id: "prf-office-vacancy-prague",
    labelCs: "Praha — neobsazenost kanceláří",
    segment: "komercni",
    subtype: "kancelare",
    metric: "vacancy_rate",
    metricLabelCs: "Neobsazenost",
    unit: "percent",
    unitLabelCs: "%",
    locationCs: "Praha (moderní kancelářský fond)",
    frequency: "year_end",
    priceKind: "not_applicable",
    aggregation: "average",
    points: [
      { year: 2022, value: 7.7 },
      { year: 2023, value: 7.2 },
      { year: 2024, value: 7.3 },
      { year: 2025, value: 5.9 },
    ],
    sourceName: "Prague Research Forum — tiskové zprávy Q4",
    sourceUrl:
      "https://www.pragueresearchforum.cz/q4-2025-the-prague-vacancy-rate-dropped-to-the-lowest-level-since-the-beginning-of-2020/",
    publishedAt: "2026-01-25",
    verifiedAt: VERIFIED,
    methodologyCs:
      "Míra neobsazenosti moderních kanceláří A/B v Praze ke konci roku. Není prodejní cena. Členové fóra: CBRE, Colliers, Cushman & Wakefield, iO Partners, Knight Frank, Savills. 2025: 5,9 % (PRF Q4 2025); 2024: 7,3 % (PRF Q4 2024 PDF); 2023: 7,2 % a 2022: 7,7 % (PRF / Savills Q4 2023).",
    tableOrPage: "Office Vacancy — Q4 press releases",
    updateHintCs:
      "Po Q4 tiskové zprávě PRF doplnit year-end vacancy; ověřit odkaz na PDF.",
  },
  {
    id: "prf-office-prime-rent-prague",
    labelCs: "Praha — prime nájemné kanceláří (centrum)",
    segment: "komercni",
    subtype: "kancelare",
    metric: "prime_rent",
    metricLabelCs: "Prime nájemné (centrum)",
    unit: "eur_per_m2_month",
    unitLabelCs: "EUR/m²/měsíc",
    locationCs: "Praha — city centre (prime)",
    frequency: "year_end",
    priceKind: "prime",
    aggregation: "prime",
    points: [
      { year: 2023, value: 27.25 },
      { year: 2024, value: 29.0 },
      { year: 2025, value: 29.5 },
    ],
    sourceName: "Prague Research Forum — Q4 tiskové zprávy",
    sourceUrl:
      "https://www.pragueresearchforum.cz/q4-2025-the-prague-vacancy-rate-dropped-to-the-lowest-level-since-the-beginning-of-2020/",
    publishedAt: "2026-01-25",
    verifiedAt: VERIFIED,
    methodologyCs:
      "Střed pásma prime headline rent v centru Prahy (EUR/m²/měsíc). Není průměr celého trhu ani prodejní cena. Pásma: 2023 €27,00–27,50 (PRF Q4 2023); 2024 €28,50–29,50 (PRF Q4 2024); 2025 €29,00–30,00 (PRF Q4 2025). Měna EUR — nepřepočítáváme kurzem.",
    tableOrPage: "Sekce Rents v Q4 press release",
    updateHintCs: "Po Q4 PRF přepsat střed pásma city-centre prime rent.",
  },
  {
    id: "cw-industrial-vacancy-cz",
    labelCs: "ČR — neobsazenost průmyslu a skladů",
    segment: "komercni",
    subtype: "prumysl",
    metric: "vacancy_rate",
    metricLabelCs: "Neobsazenost",
    unit: "percent",
    unitLabelCs: "%",
    locationCs: "Česká republika (moderní průmyslový fond)",
    frequency: "year_end",
    priceKind: "not_applicable",
    aggregation: "average",
    points: [
      { year: 2024, value: 3.13 },
      { year: 2025, value: 4.8 },
    ],
    sourceName:
      "Industrial Research Forum / Cushman & Wakefield Industrial Marketbeat",
    sourceUrl:
      "https://assets.cushmanwakefield.com/-/media/cw/emea/czech-republic/insights/czech-marketbeats/marketbeats-pdfs/2025/q4/czech-republic_marketbeat_industrial_2025_q4.pdf?rev=b8b23bdf7cb347e8b5c05fa376fa253c",
    publishedAt: "2026-01",
    verifiedAt: VERIFIED,
    methodologyCs:
      "Neobsazenost moderních průmyslových a skladových ploch v ČR ke konci roku. Není prodejní cena. Q4 2024: 3,13 % (IRF); Q4 2025: 4,8 % (C&W Marketbeat, zdroj IRF). Savills/Knight Frank uvádí jiné metodiky — neslučujeme.",
    tableOrPage: "Marketbeat headline / IRF Q4 figures",
    updateHintCs: "Po Q4 Industrial Marketbeat / IRF doplnit year-end vacancy.",
  },
  {
    id: "cw-industrial-prime-rent-prague",
    labelCs: "Praha — prime nájemné skladů",
    segment: "komercni",
    subtype: "prumysl",
    metric: "prime_rent",
    metricLabelCs: "Prime nájemné (Praha)",
    unit: "eur_per_m2_month",
    unitLabelCs: "EUR/m²/měsíc",
    locationCs: "Greater Prague — prime warehouse",
    frequency: "year_end",
    priceKind: "prime",
    aggregation: "prime",
    points: [
      { year: 2024, value: 7.5 },
      { year: 2025, value: 7.5 },
    ],
    sourceName: "Cushman & Wakefield — Czech Republic Industrial Marketbeat",
    sourceUrl:
      "https://assets.cushmanwakefield.com/-/media/cw/emea/czech-republic/insights/czech-marketbeats/marketbeats-pdfs/2025/q4/czech-republic_marketbeat_industrial_2025_q4.pdf?rev=b8b23bdf7cb347e8b5c05fa376fa253c",
    publishedAt: "2026-01",
    verifiedAt: VERIFIED,
    methodologyCs:
      "Prime headline rent pro moderní skladovou jednotku cca 10 000 m² v Greater Prague. Není průměr regionů ani prodejní cena. Q4 2024 i Q4 2025: €7,50/m²/měsíc (stabilní). Měna EUR.",
    tableOrPage: "Pricing / Greater Prague prime rent",
    updateHintCs: "Po Marketbeatu ověřit €/m²/měsíc pro Greater Prague.",
  },
];

export type BlockedSegment = {
  segment: "pozemky" | "komercni";
  subtype: string;
  labelCs: string;
  reasonCs: string;
  researchedSources: string[];
};

export const CZ_MARKET_BLOCKED: BlockedSegment[] = [
  {
    segment: "pozemky",
    subtype: "stavebni",
    labelCs: "Stavební pozemky",
    reasonCs:
      "ČSÚ publikuje průměrné kupní ceny stavebních pozemků v tříletých tabulkách a indexy (průměr 2010 = 100) v produktu Indexy cen nemovitostí / Ceny sledovaných druhů nemovitostí. Veřejný strojově stáhnutelný CSV/API export s kontinuální roční Kč/m² řadou pro celou ČR se při ověření 19. 9. 2026 nepodařilo získat (404 u přímých odkazů na XLSX). Nesestavujeme řadu z odhadu grafů. Doplnění vyžaduje ruční export z DataStat nebo XLSX z katalogu ČSÚ.",
    researchedSources: [
      "https://csu.gov.cz/ceny-nemovitosti",
      "https://csu.gov.cz/produkty/icn_cr",
      "https://csu.gov.cz/produkty/ceny-sledovanych-druhu-nemovitosti-2017-az-2019",
      "https://data.csu.gov.cz/ (DataStat — vyžaduje interaktivní výběr)",
    ],
  },
  {
    segment: "komercni",
    subtype: "obchod",
    labelCs: "Obchodní prostory",
    reasonCs:
      "Veřejné reporty CBRE/Colliers/C&W pro ČR uvádí retail prime yield a vybrané nájemné, ale neposkytují bezplatnou dlouhodobou otevřenou časovou řadu prodejních cen ani jednotný index srovnatelný napříč lety bez licence. Neinventujeme řadu.",
    researchedSources: [
      "https://www.cbre.cz/",
      "https://www.colliers.com/en-cz/research",
      "Cushman & Wakefield Czech Marketbeat (retail) — často jen aktuální čtvrtletí",
    ],
  },
];

export function getSeriesById(id: string): MarketSeries | undefined {
  return CZ_MARKET_SERIES.find((series) => series.id === id);
}

export function listSeries(options: {
  segment: MarketSeries["segment"];
  subtype: string;
}): MarketSeries[] {
  return CZ_MARKET_SERIES.filter(
    (series) =>
      series.segment === options.segment && series.subtype === options.subtype
  );
}

export function seriesChange(
  series: MarketSeries,
  fromYear: number,
  toYear: number
): { kind: "pct" | "pp"; value: number } | null {
  const start = series.points.find((point) => point.year === fromYear);
  const end = series.points.find((point) => point.year === toYear);
  if (!start || !end) return null;
  if (series.unit === "percent") {
    return { kind: "pp", value: Math.round((end.value - start.value) * 100) / 100 };
  }
  if (start.value === 0) return null;
  return {
    kind: "pct",
    value: Math.round(((end.value / start.value - 1) * 100) * 10) / 10,
  };
}

export function validateMarketSeries(series: MarketSeries[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of series) {
    if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`);
    ids.add(item.id);
    if (item.points.length === 0) errors.push(`${item.id}: empty points`);
    let prev = -Infinity;
    for (const point of item.points) {
      if (!Number.isFinite(point.year) || !Number.isFinite(point.value)) {
        errors.push(`${item.id}: non-finite point`);
      }
      if (point.year <= prev) errors.push(`${item.id}: unsorted/duplicate year`);
      prev = point.year;
    }
    if (!item.sourceUrl.startsWith("https://")) {
      errors.push(`${item.id}: source must be https`);
    }
  }
  return errors;
}
