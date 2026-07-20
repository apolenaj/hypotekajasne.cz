import { NBA_RULES } from "@/lib/nba/rules";
import type {
  NbaEngineInput,
  NbaRecommendation,
  NbaUserState,
} from "@/lib/nba/types";
import { NBA_ENGINE_VERSION } from "@/lib/nba/types";

export type NbaEngineResult = {
  engineVersion: string;
  evaluatedAt: string;
  firedRuleIds: string[];
  recommendations: NbaRecommendation[];
  suppressed: { id: string; why: string }[];
};

function urgencyFromPriority(p: number): NbaRecommendation["urgency"] {
  if (p >= 85) return "high";
  if (p >= 65) return "medium";
  return "low";
}

function isSuppressed(
  ruleId: string,
  user: NbaUserState | null | undefined,
  now: Date
): string | null {
  if (!user) return null;
  if (user.completed[ruleId]) return "completed";
  if (user.dismissed[ruleId]) return "dismissed";
  const snoozeUntil = user.snoozed[ruleId];
  if (snoozeUntil) {
    const t = Date.parse(snoozeUntil);
    if (Number.isFinite(t) && t > now.getTime()) return "snoozed";
  }
  return null;
}

/**
 * Evaluate all rules → sort by priority → return top `limit` (default 3).
 * Deterministic for the same input + user state.
 */
export function evaluateNextBestActions(
  input: NbaEngineInput,
  options?: {
    limit?: number;
    userState?: NbaUserState | null;
  }
): NbaEngineResult {
  const now = input.now ?? new Date();
  const ctx: NbaEngineInput = { ...input, now };
  const limit = Math.min(3, Math.max(1, options?.limit ?? 3));
  const user = options?.userState;
  const suppressed: { id: string; why: string }[] = [];
  const fired: NbaRecommendation[] = [];
  const firedRuleIds: string[] = [];

  for (const rule of NBA_RULES) {
    if (!rule.when(ctx)) continue;
    firedRuleIds.push(rule.id);

    const why = isSuppressed(rule.id, user, now);
    if (why) {
      suppressed.push({ id: rule.id, why });
      continue;
    }

    const partial = rule.build(ctx);
    const expiresOk =
      !partial.expiresAt ||
      Date.parse(partial.expiresAt) >= now.getTime();
    if (!expiresOk) {
      suppressed.push({ id: rule.id, why: "expired" });
      continue;
    }

    fired.push({
      id: rule.id,
      priority: rule.priority,
      urgency: partial.urgency ?? urgencyFromPriority(rule.priority),
      action: partial.action,
      reason: partial.reason,
      expectedBenefit: partial.expectedBenefit,
      expiresAt: partial.expiresAt,
      sourceData: partial.sourceData,
      blockingIssues: partial.blockingIssues,
      href: partial.href,
    });
  }

  fired.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

  return {
    engineVersion: NBA_ENGINE_VERSION,
    evaluatedAt: now.toISOString(),
    firedRuleIds,
    recommendations: fired.slice(0, limit),
    suppressed,
  };
}

/** Primary single action — first of top recommendations (compat). */
export function pickPrimaryRecommendation(
  result: NbaEngineResult
): NbaRecommendation | null {
  return result.recommendations[0] ?? null;
}
