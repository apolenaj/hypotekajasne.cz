/**
 * Lead lifecycle + revenue attribution (Phase 6.2).
 * Status changes are ops-only; revenue is never fabricated.
 */

export const LEAD_LIFECYCLE_STAGES = [
  "new",
  "contacted",
  "qualified",
  "appointment",
  "application",
  "approved",
  "funded",
  "lost",
] as const;

export type LeadLifecycleStatus = (typeof LEAD_LIFECYCLE_STAGES)[number];

export const LEAD_REVENUE_STATUSES = [
  "unknown",
  "expected",
  "realized",
  "written_off",
] as const;

export type LeadRevenueStatus = (typeof LEAD_REVENUE_STATUSES)[number];

/** Allowed forward transitions (lost is reachable from pre-funded stages). */
const ALLOWED: Record<LeadLifecycleStatus, readonly LeadLifecycleStatus[]> = {
  new: ["contacted", "qualified", "lost"],
  contacted: ["qualified", "appointment", "lost"],
  qualified: ["appointment", "application", "lost"],
  appointment: ["application", "lost"],
  application: ["approved", "lost"],
  approved: ["funded", "lost"],
  funded: [],
  lost: [],
};

export function isLeadLifecycleStatus(v: unknown): v is LeadLifecycleStatus {
  return (
    typeof v === "string" &&
    (LEAD_LIFECYCLE_STAGES as readonly string[]).includes(v)
  );
}

export function canTransitionLifecycle(
  from: LeadLifecycleStatus,
  to: LeadLifecycleStatus
): boolean {
  if (from === to) return false;
  return ALLOWED[from].includes(to);
}

export type RevenuePatch = {
  expectedRevenueAmount?: number | null;
  realizedRevenueAmount?: number | null;
  revenueCurrency?: string;
  realizedAt?: string | null;
  revenueStatus?: LeadRevenueStatus;
};

/**
 * Apply revenue rules for a lifecycle move.
 * - approved never invents realized revenue
 * - funded without explicit realized amount keeps NULL (unknown ≠ 0)
 * - explicit 0 is allowed only when caller sets it (known zero commission)
 */
export function revenueFieldsForTransition(input: {
  toStatus: LeadLifecycleStatus;
  patch?: RevenuePatch;
}): {
  expected_revenue_amount?: number | null;
  realized_revenue_amount?: number | null;
  revenue_currency?: string;
  realized_at?: string | null;
  revenue_status?: LeadRevenueStatus;
  error?: string;
} {
  const patch = input.patch ?? {};
  const out: {
    expected_revenue_amount?: number | null;
    realized_revenue_amount?: number | null;
    revenue_currency?: string;
    realized_at?: string | null;
    revenue_status?: LeadRevenueStatus;
    error?: string;
  } = {};

  if (patch.expectedRevenueAmount !== undefined) {
    if (
      patch.expectedRevenueAmount !== null &&
      (!Number.isFinite(patch.expectedRevenueAmount) ||
        patch.expectedRevenueAmount < 0)
    ) {
      return { error: "expected_revenue_amount must be null or >= 0" };
    }
    out.expected_revenue_amount = patch.expectedRevenueAmount;
    if (
      patch.expectedRevenueAmount !== null &&
      patch.revenueStatus === undefined
    ) {
      out.revenue_status = "expected";
    }
  }

  if (patch.realizedRevenueAmount !== undefined) {
    if (
      patch.realizedRevenueAmount !== null &&
      (!Number.isFinite(patch.realizedRevenueAmount) ||
        patch.realizedRevenueAmount < 0)
    ) {
      return { error: "realized_revenue_amount must be null or >= 0" };
    }
    out.realized_revenue_amount = patch.realizedRevenueAmount;
    if (patch.realizedRevenueAmount !== null) {
      out.realized_at = patch.realizedAt ?? new Date().toISOString();
      out.revenue_status = "realized";
    } else {
      out.realized_at = null;
    }
  } else if (input.toStatus === "funded") {
    // Do not invent realized amount on funded.
    if (patch.realizedAt !== undefined) {
      out.realized_at = patch.realizedAt;
    }
  } else if (input.toStatus === "approved") {
    // approved ≠ funded — never auto-set realized.
  }

  if (patch.revenueCurrency !== undefined) {
    const c = patch.revenueCurrency.trim().toUpperCase().slice(0, 3);
    if (!/^[A-Z]{3}$/.test(c)) {
      return { error: "revenue_currency must be ISO-4217 (e.g. CZK)" };
    }
    out.revenue_currency = c;
  }

  if (patch.revenueStatus !== undefined) {
    if (!(LEAD_REVENUE_STATUSES as readonly string[]).includes(patch.revenueStatus)) {
      return { error: "invalid revenue_status" };
    }
    out.revenue_status = patch.revenueStatus;
  }

  return out;
}

export type FunnelAggregateRow = {
  page_intent: string;
  attribution_source: string;
  lifecycle_status: LeadLifecycleStatus;
  lead_count: number;
  expected_revenue_sum: number | null;
  realized_revenue_sum: number | null;
};

/** Pure aggregate helper for tests / internal reporting (no PII). */
export function aggregateLeadFunnel(
  rows: Array<{
    lifecycle_status: LeadLifecycleStatus;
    page_intent: string | null;
    utm_source: string | null;
    expected_revenue_amount: number | null;
    realized_revenue_amount: number | null;
    realized_at: string | null;
  }>
): FunnelAggregateRow[] {
  const map = new Map<string, FunnelAggregateRow>();
  for (const row of rows) {
    const page_intent = row.page_intent ?? "unknown";
    const attribution_source = row.utm_source ?? "unknown";
    const key = `${page_intent}|${attribution_source}|${row.lifecycle_status}`;
    let agg = map.get(key);
    if (!agg) {
      agg = {
        page_intent,
        attribution_source,
        lifecycle_status: row.lifecycle_status,
        lead_count: 0,
        expected_revenue_sum: null,
        realized_revenue_sum: null,
      };
      map.set(key, agg);
    }
    agg.lead_count += 1;
    if (row.expected_revenue_amount != null) {
      agg.expected_revenue_sum =
        (agg.expected_revenue_sum ?? 0) + row.expected_revenue_amount;
    }
    if (row.realized_revenue_amount != null && row.realized_at) {
      agg.realized_revenue_sum =
        (agg.realized_revenue_sum ?? 0) + row.realized_revenue_amount;
    }
  }
  return [...map.values()];
}
