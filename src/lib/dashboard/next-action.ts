import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import type {
  NextBestAction,
  PropertyDashboardRow,
  WatchlistItem,
} from "@/lib/dashboard/types";
import {
  buildNbaEngineInput,
  evaluateNextBestActions,
  loadNbaUserState,
  pickPrimaryRecommendation,
  type NbaRecommendation,
} from "@/lib/nba";

/**
 * Full rule engine — 1–3 recommendations.
 */
export function resolveNextBestRecommendations(input: {
  doc: FinancialPassportDocument | null;
  profile?: FinancialProfileAnswers | null;
  properties: PropertyDashboardRow[];
  watchlist: WatchlistItem[];
  now?: Date;
}): NbaRecommendation[] {
  const ctx = buildNbaEngineInput(input);
  const userState =
    typeof window !== "undefined" ? loadNbaUserState() : null;
  return evaluateNextBestActions(ctx, { limit: 3, userState })
    .recommendations;
}

/**
 * Compat: single primary action for older dashboard fields.
 */
export function resolveNextBestAction(input: {
  doc: FinancialPassportDocument | null;
  profile?: FinancialProfileAnswers | null;
  properties: PropertyDashboardRow[];
  watchlist: WatchlistItem[];
  now?: Date;
}): NextBestAction {
  const list = resolveNextBestRecommendations(input);
  const primary = list[0];
  if (!primary) {
    return {
      id: "fallback",
      title: "Prohlédněte dashboard",
      detail: "Žádné aktivní doporučení.",
      href: "/",
      urgency: "low",
    };
  }
  return {
    id: primary.id,
    title: primary.action,
    detail: primary.reason,
    href: primary.href,
    urgency: primary.urgency,
  };
}

export function recommendationToLegacy(
  r: NbaRecommendation
): NextBestAction {
  return {
    id: r.id,
    title: r.action,
    detail: r.reason,
    href: r.href,
    urgency: r.urgency,
  };
}

void pickPrimaryRecommendation;
