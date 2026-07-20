import type {
  DashboardPersona,
  DashboardWidget,
  DashboardWidgetId,
} from "@/lib/dashboard/types";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";

type RelevanceInput = {
  persona: DashboardPersona;
  doc: FinancialPassportDocument | null;
  watchlistCount: number;
  alertCount: number;
  hasTimelineChange: boolean;
  completeness: number;
};

const CAP_BY_PERSONA: Record<DashboardPersona, number> = {
  onboarding: 6,
  buyer: 7,
  investor: 7,
  refinance: 6,
};

/**
 * Priorita zobrazení na dashboardu (UX):
 * 1. Co je nejdůležitější právě teď
 * 2. Můj bezpečný rozpočet
 * 3. Moje připravenost
 * 4. Uložené nemovitosti
 * 5. Upozornění
 * 6. Další kroky (+ podpůrné bloky)
 */
export const DASHBOARD_DISPLAY_ORDER: DashboardWidgetId[] = [
  "next_best_action",
  "safe_buying_power",
  "financial_readiness",
  "onboarding_progress",
  "saved_properties",
  "watchlist_alerts",
  "document_status",
  "education",
  "mortgage_market",
  "portfolio_snapshot",
  "majetio_matches",
];

/**
 * Relevance engine — ranks widgets; returns top N for persona.
 * Never dumps all sections at once.
 */
export function rankDashboardWidgets(
  input: RelevanceInput
): DashboardWidget[] {
  const scores: Record<
    DashboardWidgetId,
    { score: number; reason: string; title: string }
  > = {
    next_best_action: {
      score: 100,
      reason: "Jeden jasný další krok",
      title: "Doporučený další krok",
    },
    safe_buying_power: {
      score: input.doc && input.doc.financing.estimatedMaximum ? 94 : 72,
      reason: "Bezpečný / doporučený / maximální rozpočet",
      title: "Můj bezpečný rozpočet",
    },
    financial_readiness: {
      score: input.doc ? 90 : 68,
      reason: "Skóre připravenosti je jádro profilu",
      title: "Moje připravenost",
    },
    onboarding_progress: {
      score: input.persona === "onboarding" ? 88 : 8,
      reason: "Nový uživatel potřebuje dokončit profil",
      title: "Jak začít",
    },
    saved_properties: {
      score: input.watchlistCount > 0 ? 86 : 55,
      reason: "Uložené a sledované nemovitosti",
      title: "Uložené nemovitosti",
    },
    watchlist_alerts: {
      score: input.alertCount > 0 ? 92 : input.watchlistCount > 0 ? 50 : 48,
      reason: "Změny na sledovaných nemovitostech",
      title: "Upozornění",
    },
    document_status: {
      score:
        input.doc && input.completeness >= 40 && input.completeness < 90
          ? 70
          : input.persona === "refinance"
            ? 72
            : 40,
      reason: "Chybějící doklady brzdí žádost",
      title: "Dokumenty",
    },
    education: {
      score:
        input.persona === "onboarding"
          ? 62
          : input.hasTimelineChange
            ? 48
            : 42,
      reason: "Krátká edukace podle profilu",
      title: "Další kroky ve vzdělávání",
    },
    mortgage_market: {
      score:
        input.doc &&
        (input.persona === "buyer" ||
          input.persona === "refinance" ||
          input.doc.propertyGoals.purpose === "owner_occupied")
          ? 74
          : input.persona === "investor"
            ? 42
            : 28,
      reason: "Sazby relevantní k účelu profilu",
      title: "Hypoteční trh",
    },
    portfolio_snapshot: {
      score:
        input.persona === "investor" && input.watchlistCount > 0
          ? 76
          : input.watchlistCount >= 2
            ? 52
            : 10,
      reason: "Souhrn sledovaných nemovitostí",
      title: "Přehled portfolia",
    },
    majetio_matches: {
      score:
        input.doc && input.doc.financing.safeMonthlyPayment
          ? input.persona === "investor"
            ? 78
            : 66
          : 18,
      reason: "Nabídky v rozpočtu (Majetio)",
      title: "Nabídky Majetio",
    },
  };

  if (input.hasTimelineChange) {
    scores.financial_readiness.score += 8;
  }
  if (input.doc && input.doc.readiness.overall < 55) {
    scores.document_status.score += 10;
    scores.education.score += 8;
  }

  const ranked: DashboardWidget[] = (
    Object.entries(scores) as [
      DashboardWidgetId,
      { score: number; reason: string; title: string },
    ][]
  )
    .map(([id, v]) => ({
      id,
      title: v.title,
      relevance: v.score,
      reason: v.reason,
    }))
    .sort((a, b) => b.relevance - a.relevance);

  const cap = CAP_BY_PERSONA[input.persona];
  const top = ranked.filter((w) => w.relevance >= 40).slice(0, cap);

  const ensure = (id: DashboardWidgetId) => {
    if (top.some((w) => w.id === id)) return;
    const item = ranked.find((w) => w.id === id);
    if (!item) return;
    if (top.length >= cap) top.pop();
    top.push(item);
  };

  ensure("next_best_action");
  ensure("safe_buying_power");
  ensure("financial_readiness");
  ensure("saved_properties");
  ensure("watchlist_alerts");

  const orderIndex = new Map(
    DASHBOARD_DISPLAY_ORDER.map((id, i) => [id, i])
  );
  return top.sort(
    (a, b) =>
      (orderIndex.get(a.id) ?? 99) - (orderIndex.get(b.id) ?? 99)
  );
}
