import { appendB2bAudit } from "@/lib/b2b-portal/audit";
import {
  B2B_BILLING_PLANS,
  buildInvoiceLineItems,
  computeInvoiceTotals,
} from "@/lib/b2b-portal/pricing";
import type {
  AnalysisOrder,
  AnalysisScoreSnapshot,
  BillingInvoiceDraft,
  BillingPlanId,
  B2bPortalStore,
  PropertySubmission,
  SponsoredPlacement,
} from "@/lib/b2b-portal/types";
import { buildFreePreview } from "@/lib/property-rentgen/preview";
import type { ManualPropertyInput } from "@/lib/property-rentgen/types";
import { buildPropertyAnalysisReport } from "@/lib/report-engine/builders";
import { upsertReport, loadReportEngineStore, saveReportEngineStore } from "@/lib/report-engine/storage";
import { createShareGrant } from "@/lib/report-engine/share";
import { defaultWhiteLabel } from "@/lib/report-engine/types";

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Score computed ONLY from independent + modelled inputs.
 * Payment never enters this function.
 */
export function computeIsolatedAnalysisScore(
  submission: PropertySubmission
): AnalysisScoreSnapshot {
  const input: ManualPropertyInput = {
    country: submission.country,
    city: submission.city,
    propertyType: submission.propertyType,
    areaM2: submission.areaM2,
    priceCzk: submission.priceCzk,
    rentMonthlyCzk: submission.rentMonthlyCzk,
    equityCzk: null,
    purpose: "investment",
    listingUrl: submission.listingUrl ?? "",
  };
  const preview = buildFreePreview(input, "manual");
  const yieldVal = preview.orientationalYieldPa.value;
  const pricePerM2 = preview.pricePerM2.value;

  let investmentScore: number | null = null;
  if (yieldVal != null) {
    investmentScore = Math.min(100, Math.max(0, Math.round(yieldVal * 12 + 20)));
  }

  return {
    computedAt: new Date().toISOString(),
    paymentDoesNotAffectScore: true,
    orientationalYieldPct: yieldVal,
    pricePerM2Czk: pricePerM2,
    investmentScore,
    scoreProvenance: "independent_data",
    methodologyNote:
      "Skóre z nezávislých a modelových vstupů platformy. Platba a partner data neovlivňují výpočet.",
  };
}

export function submitProperty(input: {
  store: B2bPortalStore;
  orgId: string;
  memberId: string;
  data: Omit<
    PropertySubmission,
    "id" | "orgId" | "submittedByMemberId" | "createdAt" | "partnerProvidedFields"
  >;
  partnerProvidedFields?: string[];
}): { store: B2bPortalStore; submission: PropertySubmission } {
  const submission: PropertySubmission = {
    id: id("prop"),
    orgId: input.orgId,
    submittedByMemberId: input.memberId,
    createdAt: new Date().toISOString(),
    partnerProvidedFields: input.partnerProvidedFields ?? [],
    ...input.data,
  };

  appendB2bAudit({
    orgId: input.orgId,
    actorMemberId: input.memberId,
    action: "property_submit",
    resourceType: "property_submission",
    resourceId: submission.id,
    metadata: { label: submission.label },
  });

  return {
    store: {
      ...input.store,
      propertySubmissions: {
        ...input.store.propertySubmissions,
        [submission.id]: submission,
      },
    },
    submission,
  };
}

function defaultSponsoredPlacements(): SponsoredPlacement[] {
  return [
    {
      id: "sp_fin_1",
      slot: "financing_sidebar",
      partnerName: "Hypo Partner s.r.o.",
      label: "Ověřené financování u partnerské banky",
      isSponsored: true,
      doesNotAffectScore: true,
    },
  ];
}

export function createAnalysisOrder(input: {
  store: B2bPortalStore;
  orgId: string;
  memberId: string;
  propertySubmissionId: string;
  planId?: BillingPlanId;
}): { store: B2bPortalStore; order: AnalysisOrder; invoice: BillingInvoiceDraft } {
  const submission = input.store.propertySubmissions[input.propertySubmissionId];
  if (!submission) throw new Error("Property submission not found");

  const planId = input.planId ?? "single_analysis";
  const plan = B2B_BILLING_PLANS[planId];
  if (plan.status === "coming_soon") {
    throw new Error("Plan not available");
  }

  const scoreSnapshot = computeIsolatedAnalysisScore(submission);
  const lineItems = buildInvoiceLineItems(planId);
  const totals = computeInvoiceTotals(lineItems);

  const invoice: BillingInvoiceDraft = {
    id: id("inv"),
    orgId: input.orgId,
    orderId: null,
    status: "pending_payment",
    lineItems,
    ...totals,
    currency: "CZK",
    createdAt: new Date().toISOString(),
    paidAt: null,
    externalPaymentIntentId: null,
  };

  const order: AnalysisOrder = {
    id: id("ord"),
    orgId: input.orgId,
    propertySubmissionId: submission.id,
    status: "awaiting_payment",
    planId,
    amountCzk: plan.unitAmountCzk,
    invoiceId: invoice.id,
    createdAt: new Date().toISOString(),
    paidAt: null,
    deliveredAt: null,
    reportId: null,
    shareToken: null,
    scoreSnapshot,
    majetioIntelligenceBranded: true,
    sponsoredPlacements: defaultSponsoredPlacements(),
  };

  invoice.orderId = order.id;

  appendB2bAudit({
    orgId: input.orgId,
    actorMemberId: input.memberId,
    action: "analysis_order",
    resourceType: "analysis_order",
    resourceId: order.id,
    metadata: {
      amountCzk: order.amountCzk,
      score: order.scoreSnapshot.investmentScore ?? -1,
    },
  });

  return {
    store: {
      ...input.store,
      analysisOrders: { ...input.store.analysisOrders, [order.id]: order },
      invoices: { ...input.store.invoices, [invoice.id]: invoice },
    },
    order,
    invoice,
  };
}

/** Simulates payment — scoreSnapshot MUST remain unchanged */
export function recordAnalysisPayment(input: {
  store: B2bPortalStore;
  orderId: string;
  memberId: string;
}): B2bPortalStore {
  const order = input.store.analysisOrders[input.orderId];
  if (!order) throw new Error("Order not found");
  const invoice = order.invoiceId
    ? input.store.invoices[order.invoiceId]
    : null;

  const frozenScore = { ...order.scoreSnapshot };
  const now = new Date().toISOString();

  const updatedOrder: AnalysisOrder = {
    ...order,
    status: "paid",
    paidAt: now,
    scoreSnapshot: frozenScore,
  };

  appendB2bAudit({
    orgId: order.orgId,
    actorMemberId: input.memberId,
    action: "payment_recorded",
    resourceType: "analysis_order",
    resourceId: order.id,
    metadata: { paymentDoesNotAffectScore: true },
  });

  let invoices = input.store.invoices;
  if (invoice) {
    invoices = {
      ...invoices,
      [invoice.id]: {
        ...invoice,
        status: "paid",
        paidAt: now,
        externalPaymentIntentId: `pi_beta_${order.id.slice(-8)}`,
      },
    };
  }

  return {
    ...input.store,
    analysisOrders: { ...input.store.analysisOrders, [order.id]: updatedOrder },
    invoices,
  };
}

export function deliverAnalysisOrder(input: {
  store: B2bPortalStore;
  orderId: string;
  memberId: string;
  orgName: string;
}): B2bPortalStore {
  const order = input.store.analysisOrders[input.orderId];
  if (!order) throw new Error("Order not found");
  if (order.status !== "paid" && order.status !== "in_progress") {
    throw new Error("Order not ready for delivery");
  }

  const report = buildPropertyAnalysisReport(
    defaultWhiteLabel({ companyName: input.orgName })
  );

  let reportStore = loadReportEngineStore();
  reportStore = upsertReport(reportStore, report);
  saveReportEngineStore(reportStore);

  const { store: shareStore, grant } = createShareGrant(reportStore, {
    reportId: report.id,
    expiresInHours: 720,
    allowSensitive: false,
    whiteLabel: report.whiteLabel,
  });
  saveReportEngineStore(shareStore);

  const delivered: AnalysisOrder = {
    ...order,
    status: "delivered",
    deliveredAt: new Date().toISOString(),
    reportId: report.id,
    shareToken: grant.token,
    scoreSnapshot: order.scoreSnapshot,
  };

  appendB2bAudit({
    orgId: order.orgId,
    actorMemberId: input.memberId,
    action: "analysis_delivered",
    resourceType: "analysis_order",
    resourceId: order.id,
    metadata: { reportId: report.id },
  });

  appendB2bAudit({
    orgId: order.orgId,
    actorMemberId: input.memberId,
    action: "share_created",
    resourceType: "share_grant",
    resourceId: grant.token,
    metadata: { orderId: order.id },
  });

  return {
    ...input.store,
    analysisOrders: { ...input.store.analysisOrders, [order.id]: delivered },
  };
}

export function listOrdersForOrg(
  store: B2bPortalStore,
  orgId: string
): AnalysisOrder[] {
  return Object.values(store.analysisOrders)
    .filter((o) => o.orgId === orgId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
