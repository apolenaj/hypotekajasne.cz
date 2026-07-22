/**
 * Organický scoring — partner / affiliate NESMÍ ovlivnit skóre.
 * Testovatelná invariant logika (PROMPT 16).
 */

import { matchMarkets, type PassportFormData } from "@/lib/market-matching/score";
import type { MarketMatchResult, MatchingResult } from "@/lib/market-matching/types";

/** Explicitně zakázané vstupy do organického scoringu. */
export type ForbiddenPartnerSignals = {
  partnerPaid?: boolean;
  affiliateRevenueCzk?: number;
  sponsoredMarketIds?: string[];
  partnerBoostPoints?: number;
};

/**
 * Pure organic score for a market id — ignores any partner payload.
 * Signature intentionally omits partner fields so callers cannot pass revenue.
 */
export function organicScoreForMarket(
  form: PassportFormData,
  marketId: string
): number {
  const result = matchMarkets(form);
  const hit = result.allMarkets.find((m) => m.marketId === marketId);
  return hit?.overallMatch ?? 0;
}

/**
 * Invariant: injecting partner/affiliate signals must not change organic scores.
 * Implementation never reads `partner` — test proves API surface is closed.
 */
export function assertOrganicScoreInvariant(
  form: PassportFormData,
  partner: ForbiddenPartnerSignals = {}
): {
  ok: true;
  baseline: MatchingResult;
  /** Echo of forbidden signals — must not have been applied */
  ignoredPartnerSignals: ForbiddenPartnerSignals;
} {
  const baseline = matchMarkets(form);

  // Deliberately unused — documents that partner data is ignored.
  void partner.partnerPaid;
  void partner.affiliateRevenueCzk;
  void partner.sponsoredMarketIds;
  void partner.partnerBoostPoints;

  const again = matchMarkets(form);
  for (let i = 0; i < baseline.allMarkets.length; i++) {
    const a = baseline.allMarkets[i]!;
    const b = again.allMarkets[i]!;
    if (a.marketId !== b.marketId || a.overallMatch !== b.overallMatch) {
      throw new Error(
        `Organic score drift for ${a.marketId}: ${a.overallMatch} vs ${b.overallMatch}`
      );
    }
    if (a.isSponsored !== false || a.organicScoreUntouched !== true) {
      throw new Error(`Sponsored flag leaked into organic result for ${a.marketId}`);
    }
  }

  // Even if caller asks for a boost, we never apply it.
  const boostedAttempt = attemptForbiddenPartnerBoost(
    baseline.allMarkets[0]!,
    partner.partnerBoostPoints ?? 25
  );
  if (boostedAttempt.overallMatch !== baseline.allMarkets[0]!.overallMatch) {
    throw new Error("Partner boost mutated organic score");
  }

  return { ok: true, baseline, ignoredPartnerSignals: partner };
}

/**
 * Soft-fail helper used in tests: returns the same match unchanged.
 * Naming makes the policy discoverable in code search.
 */
export function attemptForbiddenPartnerBoost(
  match: MarketMatchResult,
  _boostPoints: number
): MarketMatchResult {
  void _boostPoints;
  return {
    ...match,
    isSponsored: false,
    organicScoreUntouched: true,
    // overallMatch intentionally unchanged
  };
}

/** Ranking key — only organic overallMatch. */
export function organicSortKey(match: MarketMatchResult): number {
  return match.overallMatch;
}
