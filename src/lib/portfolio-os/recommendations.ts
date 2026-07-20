import type {
  ConcentrationAlert,
  PortfolioPropertyRow,
  PortfolioRecommendation,
  StressScenarioResult,
} from "@/lib/portfolio-os/types";

const NO_SELL_DISCLAIMER =
  "Orientační model — nejde o investiční doporučení ani pokyn k prodeji. Zvažte scénáře s poradcem.";

export function buildPortfolioRecommendations(input: {
  rows: PortfolioPropertyRow[];
  concentrationAlerts: ConcentrationAlert[];
  stressTests: StressScenarioResult[];
}): PortfolioRecommendation[] {
  const { rows, concentrationAlerts, stressTests } = input;
  const recs: PortfolioRecommendation[] = [];

  if (rows.length < 2) {
    return [
      {
        id: "need_multi",
        priority: 100,
        headline: "Moje portfolio vyžaduje více vlastněných nemovitostí",
        explanation:
          "Přidejte alespoň 2 digitální karty nemovitostí pro smysluplné souhrny a stress testy.",
        relatedPropertyIds: rows.map((r) => r.twinId),
        scenarios: [
          {
            id: "a",
            label: "Scénář A",
            description:
              "Doplňte druhou nemovitost do Digitální karty nemovitosti (vlastněnou).",
          },
        ],
        sourceData: { keys: ["portfolio.count"], snapshot: { count: rows.length } },
        claimKind: "DATA",
        disclaimer: NO_SELL_DISCLAIMER,
      },
    ];
  }

  const lowestCf = [...rows].sort(
    (a, b) => (a.monthlyNetCashFlowCzk ?? -Infinity) - (b.monthlyNetCashFlowCzk ?? -Infinity)
  )[0];
  const highestRisk = [...rows].sort(
    (a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)
  )[0];

  if (
    lowestCf &&
    highestRisk &&
    (lowestCf.monthlyNetCashFlowCzk ?? 0) < 5_000 &&
    lowestCf.twinId === highestRisk.twinId
  ) {
    recs.push({
      id: "low_cf_high_risk",
      priority: 90,
      headline: `„${lowestCf.label}“ má v modelu nejnižší cash flow a nejvyšší koncentraci rizika`,
      explanation:
        "Tato nemovitost kombinuje slabší měsíční CF a vyšší modelové risk skóre. Neříkáme „prodejte“ — porovnejte scénáře dopadu na celé portfolio.",
      relatedPropertyIds: [lowestCf.twinId],
      scenarios: [
        {
          id: "a",
          label: "Scénář A — status quo",
          description: "Ponechat asset, sledovat nájem a refixaci; posílit rezervu likvidity.",
        },
        {
          id: "b",
          label: "Scénář B — optimalizace",
          description: "Zvážit refinancování, úpravu nájmu nebo capex snížící maintenance burden.",
        },
        {
          id: "c",
          label: "Scénář C — rebalance portfolia",
          description: "Modelovat přesun kapitálu do méně koncentrované lokality / typu (simulace, ne pokyn).",
        },
      ],
      sourceData: {
        keys: ["property.cashFlow", "property.riskScore"],
        snapshot: {
          label: lowestCf.label,
          monthlyNetCashFlowCzk: lowestCf.monthlyNetCashFlowCzk,
          riskScore: highestRisk.riskScore,
        },
      },
      claimKind: "MODEL",
      disclaimer: NO_SELL_DISCLAIMER,
    });
  }

  const cityAlert = concentrationAlerts.find((a) => a.dimension === "city");
  if (cityAlert) {
    recs.push({
      id: "city_concentration",
      priority: 85,
      headline: "Geografická koncentrace ovlivňuje stress profil",
      explanation: `${cityAlert.headline} Zvažte scénáře diverzifikace nebo posílení rezervy — ne jednostranný prodej.`,
      relatedPropertyIds: rows
        .filter((r) => r.city && cityAlert.headline.includes(r.city))
        .map((r) => r.twinId),
      scenarios: [
        {
          id: "a",
          label: "Scénář A",
          description: "Udržet koncentraci, zvýšit liquidity reserve na 6–9 měsíců CF.",
        },
        {
          id: "b",
          label: "Scénář B",
          description: "Postupná diverzifikace při nových akvizicích (model, ne timing trhu).",
        },
        {
          id: "c",
          label: "Scénář C",
          description: "Stress test combined recession — ověřit solventnost bez prodeje assetu.",
        },
      ],
      sourceData: {
        keys: ["concentration.city"],
        snapshot: { metricPct: cityAlert.metricPct },
      },
      claimKind: "MODEL",
      disclaimer: NO_SELL_DISCLAIMER,
    });
  }

  const refixAlert = concentrationAlerts.find((a) => a.dimension === "refixation");
  if (refixAlert) {
    recs.push({
      id: "refix_cluster",
      priority: 80,
      headline: "Cluster refixací — připravte scénáře financování",
      explanation: `${refixAlert.headline} Porovnejte pokračování u stávající banky vs. tržní refinancování (MODEL).`,
      relatedPropertyIds: rows
        .filter((r) => r.fixationEnd)
        .map((r) => r.twinId),
      scenarios: [
        {
          id: "a",
          label: "Scénář A",
          description: "Fixovat dříve při příznivé sazbě — simulace v kalkulačce.",
        },
        {
          id: "b",
          label: "Scénář B",
          description: "Čekat na konec fixace — stress sazby +2 p.b.",
        },
        {
          id: "c",
          label: "Scénář C",
          description: "Částečná splátka jistiny před refixí — snížit LTV.",
        },
      ],
      sourceData: {
        keys: ["concentration.refixation"],
        snapshot: { metricPct: refixAlert.metricPct },
      },
      claimKind: "MODEL",
      disclaimer: NO_SELL_DISCLAIMER,
    });
  }

  const combined = stressTests.find((s) => s.id === "combined_recession");
  if (combined?.stressed.monthlyNetCashFlowCzk != null && combined.stressed.monthlyNetCashFlowCzk < 0) {
    recs.push({
      id: "recession_cf_negative",
      priority: 75,
      headline: "Scénář kombinované recese vede k zápornému portfoliovému CF",
      explanation: `Model: ${combined.deltaSummary}. Posílení liquidity reserve nebo úprava nákladů — scénáře, ne prodej.`,
      relatedPropertyIds: rows.map((r) => r.twinId),
      scenarios: [
        {
          id: "a",
          label: "Scénář A",
          description: "Navýšit rezervu z Finančního pasu / vlastních zdrojů.",
        },
        {
          id: "b",
          label: "Scénář B",
          description: "Dočasně snížit capex a diskutovat s nájemníky indexaci.",
        },
        {
          id: "c",
          label: "Scénář C",
          description: "Refinancovat nejslabší DSCR asset (simulace splátky).",
        },
      ],
      sourceData: {
        keys: ["stress.combined_recession"],
        snapshot: {
          stressedCf: combined.stressed.monthlyNetCashFlowCzk,
        },
      },
      claimKind: "MODEL",
      disclaimer: NO_SELL_DISCLAIMER,
    });
  }

  return recs
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}
