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
  onboarding: 4,
  buyer: 6,
  investor: 6,
  refinance: 5,
};

/**
 * Relevance engine — ranks widgets; returns top N for persona.
 * Never dumps all 10 sections at once.
 */
export function rankDashboardWidgets(
  input: RelevanceInput
): DashboardWidget[] {
  const scores: Record<DashboardWidgetId, { score: number; reason: string; title: string }> = {
    next_best_action: {
      score: 100,
      reason: "Jeden jasný další krok",
      title: "Další krok",
    },
    financial_readiness: {
      score: input.doc ? 92 : 20,
      reason: "Skóre připravenosti je jádro profilu",
      title: "Připravenost",
    },
    onboarding_progress: {
      score: input.persona === "onboarding" ? 95 : 10,
      reason: "Nový uživatel potřebuje dokončit profil",
      title: "Jak začít",
    },
    safe_buying_power: {
      score: input.doc && input.doc.financing.estimatedMaximum ? 88 : 25,
      reason: "Safe / recommended / max rozpočet",
      title: "Kupní síla",
    },
    mortgage_market: {
      score:
        input.doc &&
        (input.persona === "buyer" ||
          input.persona === "refinance" ||
          input.doc.propertyGoals.purpose === "owner_occupied")
          ? 78
          : input.persona === "investor"
            ? 45
            : 30,
      reason: "Sazby relevantní k účelu profilu",
      title: "Hypoteční trh",
    },
    saved_properties: {
      score: input.watchlistCount > 0 ? 85 : 15,
      reason: "Uložené nemovitosti",
      title: "Uložené nemovitosti",
    },
    watchlist_alerts: {
      score: input.alertCount > 0 ? 90 : input.watchlistCount > 0 ? 40 : 5,
      reason: "Změny na watchlistu",
      title: "Upozornění",
    },
    portfolio_snapshot: {
      score:
        input.persona === "investor" && input.watchlistCount > 0
          ? 80
          : input.watchlistCount >= 2
            ? 55
            : 12,
      reason: "Souhrn sledovaných nemovitostí",
      title: "Portfolio snapshot",
    },
    majetio_matches: {
      score:
        input.doc && input.doc.financing.safeMonthlyPayment
          ? input.persona === "investor"
            ? 82
            : 70
          : 20,
      reason: "Discovery v rozpočtu (Majetio)",
      title: "Majetio shody",
    },
    document_status: {
      score:
        input.doc && input.completeness >= 40 && input.completeness < 90
          ? 72
          : input.persona === "refinance"
            ? 75
            : 35,
      reason: "Chybějící doklady brzdí žádost",
      title: "Dokumenty",
    },
    education: {
      score:
        input.persona === "onboarding"
          ? 65
          : input.hasTimelineChange
            ? 50
            : 42,
      reason: "Krátká edukace podle profilu",
      title: "Akademie",
    },
  };

  // Soft boosts
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
  // Always keep next_best_action if present in top
  const top = ranked.filter((w) => w.relevance >= 40).slice(0, cap);

  // Ensure next action always visible when personalized or onboarding
  if (!top.some((w) => w.id === "next_best_action")) {
    const nba = ranked.find((w) => w.id === "next_best_action");
    if (nba) {
      top.pop();
      top.unshift(nba);
    }
  }

  return top;
}
