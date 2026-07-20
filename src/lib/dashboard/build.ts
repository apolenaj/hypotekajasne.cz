import type { CurrentRates } from "@/lib/rates";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import {
  formatTimelineHeadline,
} from "@/lib/financial-passport/timeline";
import type { TimelineEntry } from "@/lib/financial-passport/types";
import { toMajetioHandoff } from "@/lib/financial-passport/handoff";
import {
  buildAttribution,
  buildMajetioDiscoveryUrl,
} from "@/lib/majetio";
import { evaluateAffordability } from "@/lib/majetio/affordability";
import { routes } from "@/lib/routes";
import { detectPersona, profileCompleteness } from "@/lib/dashboard/persona";
import { rankDashboardWidgets } from "@/lib/dashboard/relevance";
import { resolveNextBestAction, resolveNextBestRecommendations } from "@/lib/dashboard/next-action";
import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import { recommendEducation } from "@/lib/dashboard/education";
import type {
  BuyingPowerPanel,
  DashboardModel,
  DocumentChecklistItem,
  MarketRateCard,
  PortfolioSnapshot,
  PropertyDashboardRow,
  ReadinessPanel,
  WatchlistItem,
} from "@/lib/dashboard/types";

function buildReadinessPanel(
  doc: FinancialPassportDocument,
  timeline: TimelineEntry[]
): ReadinessPanel {
  const latest = timeline[0] ?? null;
  const previousScore = latest ? latest.scoreFrom : null;
  let trend: ReadinessPanel["trend"] = "new";
  let mainChange = "Zatím bez historie — uložte profil po změně údajů.";

  if (latest) {
    if (latest.scoreTo > latest.scoreFrom) trend = "up";
    else if (latest.scoreTo < latest.scoreFrom) trend = "down";
    else trend = "flat";
    mainChange =
      latest.reasons[0] ?? formatTimelineHeadline(latest);
  }

  return {
    score: doc.readiness.overall,
    previousScore,
    trend,
    mainChange,
    band: doc.readiness.band,
    href: routes.financniPas,
  };
}

function buildBuyingPower(doc: FinancialPassportDocument): BuyingPowerPanel {
  const funds = doc.assets.totalOwnFundsModel;
  const maxLoan = doc.financing.estimatedMaximum;
  const cons = doc.financing.conservativeMaximum;
  const rec = doc.financing.recommendedMaximum;

  return {
    max:
      maxLoan != null ? Math.round(maxLoan + funds) : funds > 0 ? funds : null,
    recommended:
      rec != null ? Math.round(rec + funds) : null,
    safe:
      cons != null
        ? Math.round(cons + funds)
        : doc.financing.safeMonthlyPayment != null
          ? null
          : funds > 0
            ? funds
            : null,
    claimNote: doc.claimNote,
  };
}

function buildMarketRates(
  doc: FinancialPassportDocument | null,
  rates: CurrentRates | null
): MarketRateCard[] {
  if (!doc) return [];

  const purpose = doc.propertyGoals.purpose;
  const cards: MarketRateCard[] = [];
  const updatedAt = rates?.updatedAt ?? null;

  // Only profile-relevant products
  if (
    purpose === "owner_occupied" ||
    purpose === "investment" ||
    purpose === "refinance" ||
    purpose === "unknown"
  ) {
    const withIns = rates?.rateWithInsurance ?? null;
    cards.push({
      id: "cz_classic_with",
      label:
        purpose === "investment"
          ? "Modelová sazba ČR (investice — přísnější DSTI)"
          : "Klasická hypotéka ČR (s pojištěním)",
      ratePercent: withIns,
      claimKind: withIns != null ? "DATA" : "NEOVERENO",
      relevanceNote:
        purpose === "refinance"
          ? "Relevantní pro srovnání při refinancování / refixaci."
          : "Odpovídá účelu ve Finančním pasu.",
      updatedAt,
    });
  }

  if (purpose === "foreign_purchase" || purpose === "refinance") {
    // American mortgage as CZ collateral path — relevant for foreign / equity
    cards.push({
      id: "cz_american",
      label: "Americká hypotéka (české zajištění)",
      ratePercent: rates?.rateWithInsurance ?? null,
      claimKind: rates?.rateWithInsurance != null ? "ODHAD" : "NEOVERENO",
      relevanceNote:
        "Orientační odkaz na české zajištění — ne sazba zahraniční banky.",
      updatedAt,
    });
  }

  // Never invent foreign bank rates
  if (purpose === "foreign_purchase") {
    cards.push({
      id: "foreign_local",
      label: "Lokální hypotéka v cílové zemi",
      ratePercent: null,
      claimKind: "NEOVERENO",
      relevanceNote:
        "V datech nemáme ověřenou live sazbu — individuálně u specialisty.",
      updatedAt: null,
    });
  }

  return cards;
}

function buildPropertyRows(
  watchlist: WatchlistItem[],
  doc: FinancialPassportDocument | null
): PropertyDashboardRow[] {
  const handoff = doc ? toMajetioHandoff(doc) : null;

  return watchlist.map((item) => {
    let affordabilityFit: PropertyDashboardRow["affordabilityFit"] = "unknown";
    let investmentScore: number | null = null;

    if (handoff) {
      const aff = evaluateAffordability({
        priceCzk: item.priceCzk,
        passport: handoff,
        country: item.countryHint ?? undefined,
        propertyId: item.id,
      });
      if (aff.verdict === "within_safe_budget") affordabilityFit = "safe";
      else if (aff.verdict === "within_max_estimate") affordabilityFit = "stretch";
      else if (aff.verdict === "above_budget") affordabilityFit = "over";
    }

    // Lightweight investment score: closer to safe budget = higher (MODEL)
    if (doc?.financing.conservativeMaximum != null) {
      const capacity =
        (doc.financing.conservativeMaximum ?? 0) +
        doc.assets.totalOwnFundsModel;
      if (capacity > 0) {
        const ratio = item.priceCzk / capacity;
        investmentScore = Math.max(
          0,
          Math.min(100, Math.round((1.2 - Math.abs(ratio - 0.85)) * 100))
        );
      }
    }

    const priceChangePct =
      item.previousPriceCzk != null && item.previousPriceCzk > 0
        ? Math.round(
            ((item.priceCzk - item.previousPriceCzk) / item.previousPriceCzk) *
              1000
          ) / 10
        : null;

    const statusLabel =
      affordabilityFit === "safe"
        ? "V safe pásmu"
        : affordabilityFit === "stretch"
          ? "Na hraně modelu"
          : affordabilityFit === "over"
            ? "Nad stropem"
            : item.status;

    return {
      item,
      currentValue: item.priceCzk,
      priceChangePct,
      affordabilityFit,
      investmentScore,
      statusLabel,
    };
  });
}

function buildDocuments(
  doc: FinancialPassportDocument | null
): DocumentChecklistItem[] {
  if (!doc) {
    return [
      {
        id: "profile",
        label: "Vyplnit Hypoteční připravenost",
        done: false,
        priority: 1,
      },
    ];
  }

  const items: DocumentChecklistItem[] = [
    {
      id: "income",
      label: "Doklad o příjmu",
      done: doc.income.totalNetIncome > 0,
      priority: 1,
    },
    {
      id: "statements",
      label: "Výpisy z účtu (3–6 měs.)",
      done: false,
      priority: 2,
    },
    {
      id: "equity",
      label: "Doklad o vlastních zdrojích",
      done: doc.assets.totalOwnFundsModel > 0,
      priority: 2,
    },
    {
      id: "id",
      label: "Doklad totožnosti",
      done: false,
      priority: 3,
    },
  ];

  if (doc.propertyGoals.purpose === "refinance") {
    items.push({
      id: "current_loan",
      label: "Smlouva + zůstatek stávající hypotéky",
      done: false,
      priority: 1,
    });
  }
  if (doc.propertyGoals.purpose === "foreign_purchase") {
    items.push({
      id: "foreign_docs",
      label: "Podklady k zahraniční nemovitosti / zajištění",
      done: Boolean(doc.propertyGoals.targetCountry),
      priority: 1,
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}

function buildAlerts(
  rows: PropertyDashboardRow[],
  smartAlertTitles: string[] = []
): string[] {
  const alerts: string[] = [...smartAlertTitles];
  for (const r of rows) {
    if (r.priceChangePct != null && r.priceChangePct <= -3) {
      const msg = `„${r.item.label}“: cena ${r.priceChangePct.toFixed(0)} % oproti uložené.`;
      if (!alerts.includes(msg)) alerts.push(msg);
    }
    if (r.affordabilityFit === "over") {
      const msg = `„${r.item.label}“ je nad modelovým rozpočtem.`;
      if (!alerts.includes(msg)) alerts.push(msg);
    }
    if (r.affordabilityFit === "safe" && r.priceChangePct != null && r.priceChangePct < 0) {
      const msg = `„${r.item.label}“ zůstává v safe pásmu po poklesu ceny.`;
      if (!alerts.includes(msg)) alerts.push(msg);
    }
  }
  return alerts.slice(0, 5);
}

/**
 * Sestaví dashboard model z lokálního profilu + sazeb + watchlistu.
 */
export function buildDashboardModel(input: {
  doc: FinancialPassportDocument | null;
  timeline: TimelineEntry[];
  watchlist: WatchlistItem[];
  rates: CurrentRates | null;
  profile?: FinancialProfileAnswers | null;
  /** Titles from Smart Watchlist in-app alerts (already throttled) */
  smartAlertTitles?: string[];
}): DashboardModel {
  const { doc, timeline, watchlist, rates, profile } = input;
  const persona = detectPersona(doc, watchlist);
  const completeness = profileCompleteness(doc);
  const properties = buildPropertyRows(watchlist, doc);
  const alerts = buildAlerts(properties, input.smartAlertTitles ?? []);
  const recommendations = resolveNextBestRecommendations({
    doc,
    profile: profile ?? null,
    properties,
    watchlist,
  });
  const nextAction = resolveNextBestAction({
    doc,
    profile: profile ?? null,
    properties,
    watchlist,
  });

  const portfolio: PortfolioSnapshot | null =
    watchlist.length > 0
      ? {
          propertyCount: watchlist.length,
          totalWatchValue: watchlist.reduce((s, w) => s + w.priceCzk, 0),
          inBudgetCount: properties.filter(
            (p) => p.affordabilityFit === "safe" || p.affordabilityFit === "stretch"
          ).length,
          overBudgetCount: properties.filter((p) => p.affordabilityFit === "over")
            .length,
          claimKind: "MODEL",
        }
      : null;

  let majetio: DashboardModel["majetio"] = null;
  if (doc) {
    const handoff = toMajetioHandoff(doc);
    const attr = buildAttribution({
      campaign: "home_dashboard",
      medium: "referral",
      content: "majetio_matches",
      conversionEvent: "cta_majetio_budget_listings",
      product: "financial_passport",
    });
    const discoveryUrl = buildMajetioDiscoveryUrl({
      passport: handoff,
      attribution: attr,
    });
    majetio = {
      budgetMax: handoff.maxEstimatedBankBudget,
      safeBudget: handoff.safePropertyBudget,
      purpose: handoff.purpose,
      country: handoff.country,
      discoveryUrl,
      summary:
        handoff.safePropertyBudget != null
          ? `Discovery podle safe rozpočtu ~${Math.round(handoff.safePropertyBudget).toLocaleString("cs-CZ")} Kč (MODEL).`
          : "Doplňte připravenost pro personalizovaný rozpočet.",
    };
  }

  const visibleWidgets = rankDashboardWidgets({
    persona,
    doc,
    watchlistCount: watchlist.length,
    alertCount: alerts.length,
    hasTimelineChange: timeline.length > 0,
    completeness,
  });

  return {
    persona,
    isPersonalized: doc != null,
    readiness: doc ? buildReadinessPanel(doc, timeline) : null,
    buyingPower: doc ? buildBuyingPower(doc) : null,
    marketRates: buildMarketRates(doc, rates),
    properties,
    nextAction,
    recommendations,
    alerts,
    portfolio,
    majetio,
    documents: buildDocuments(doc),
    education: recommendEducation(doc),
    visibleWidgets,
  };
}
