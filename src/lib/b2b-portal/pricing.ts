import type { BillingPlanId, BillingLineItem } from "@/lib/b2b-portal/types";
import { BILLING_PLAN_STATUS } from "@/lib/b2b-portal/types";
import { PROPERTY_ANALYSIS_PRICING } from "@/lib/property-rentgen/pricing";

export type BillingPlanDef = {
  id: BillingPlanId;
  name: string;
  description: string;
  status: "available" | "coming_soon";
  /** Analyses included per purchase (subscription = monthly quota later) */
  analysisCredits: number;
  unitAmountCzk: number;
  sku: string;
};

export const B2B_BILLING_PLANS: Record<BillingPlanId, BillingPlanDef> = {
  single_analysis: {
    id: "single_analysis",
    name: "Jednotlivá analýza",
    description: `Analýza nemovitosti ${PROPERTY_ANALYSIS_PRICING.amountCzk.toLocaleString("cs-CZ")} Kč — report Majetio`,
    status: BILLING_PLAN_STATUS.single_analysis,
    analysisCredits: 1,
    unitAmountCzk: PROPERTY_ANALYSIS_PRICING.amountCzk,
    sku: "b2b-analysis-single-v1",
  },
  package_starter: {
    id: "package_starter",
    name: "Balíček Starter (5×)",
    description: "5 analýz se slevou — pro aktivní makléře",
    status: BILLING_PLAN_STATUS.package_starter,
    analysisCredits: 5,
    unitAmountCzk: 22_500,
    sku: "b2b-analysis-pack-5-v1",
  },
  package_pro: {
    id: "package_pro",
    name: "Balíček Pro (20×)",
    description: "20 analýz — pro kanceláře a týmy",
    status: BILLING_PLAN_STATUS.package_pro,
    analysisCredits: 20,
    unitAmountCzk: 80_000,
    sku: "b2b-analysis-pack-20-v1",
  },
  subscription_enterprise: {
    id: "subscription_enterprise",
    name: "Enterprise subscription",
    description: "Neomezený tým + API — aktivace později",
    status: BILLING_PLAN_STATUS.subscription_enterprise,
    analysisCredits: 0,
    unitAmountCzk: 0,
    sku: "b2b-sub-enterprise-v1",
  },
};

const VAT_PERCENT = 21;

export function buildInvoiceLineItems(
  planId: BillingPlanId
): BillingLineItem[] {
  const plan = B2B_BILLING_PLANS[planId];
  return [
    {
      sku: plan.sku,
      description: plan.name,
      quantity: 1,
      unitAmountCzk: plan.unitAmountCzk,
      currency: "CZK",
      taxRatePercent: VAT_PERCENT,
    },
  ];
}

export function computeInvoiceTotals(lineItems: BillingLineItem[]): {
  subtotalCzk: number;
  taxCzk: number;
  totalCzk: number;
} {
  const subtotalCzk = lineItems.reduce(
    (s, li) => s + li.quantity * li.unitAmountCzk,
    0
  );
  const taxCzk = Math.round(
    lineItems.reduce(
      (s, li) =>
        s + li.quantity * li.unitAmountCzk * (li.taxRatePercent / 100),
      0
    )
  );
  return { subtotalCzk, taxCzk, totalCzk: subtotalCzk + taxCzk };
}

export function formatPlanPrice(planId: BillingPlanId): string {
  const plan = B2B_BILLING_PLANS[planId];
  if (plan.status === "coming_soon") return "Na vyžádání";
  return `${plan.unitAmountCzk.toLocaleString("cs-CZ")} Kč`;
}
