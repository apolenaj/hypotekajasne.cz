/**
 * B2B Professional Portal — architektura jako kód (SaaS vrstva).
 * Dokumentace pro engineering + product; ne marketing copy.
 */

export const B2B_ARCHITECTURE_LAYERS = [
  {
    id: "identity",
    name: "Identity & Organizations",
    description:
      "Organization accounts, member roles, org switcher. BETA: localStorage; production: auth provider + org tenancy.",
  },
  {
    id: "catalog",
    name: "Property & Project Catalog",
    description:
      "Agent property submissions; developer projects/units/availability/documents.",
  },
  {
    id: "analysis_engine",
    name: "Analysis Engine (score-isolated)",
    description:
      "Investment metrics computed from independent + modelled data BEFORE payment. Payment unlocks delivery only.",
  },
  {
    id: "billing",
    name: "Billing-ready Commerce",
    description:
      "Invoice drafts, SKUs, line items, tax fields. Stripe/payment gateway hook via externalPaymentIntentId.",
  },
  {
    id: "report_delivery",
    name: "Report Delivery",
    description:
      "Report Engine integration — download, PDF-ready HTML, expiring share links.",
  },
  {
    id: "engagement",
    name: "Anonymized Engagement",
    description:
      "Share link views/downloads — hashed viewer id, no PII in analytics layer.",
  },
  {
    id: "leads",
    name: "Qualified Interest (consent-gated)",
    description:
      "Contact details only after explicit consent record; audit trail required.",
  },
  {
    id: "audit",
    name: "Audit Log",
    description:
      "Append-only org-scoped actions — billing, orders, shares, consent events.",
  },
] as const;

export const B2B_SCORE_ISOLATION_RULES = [
  "Investment score is computed at order creation from independent_data and modelled_estimate only.",
  "partner_provided fields are displayed separately and never enter score formula.",
  "Payment status (awaiting_payment → paid) does NOT trigger score recomputation.",
  "Sponsored placements are visual slots only — doesNotAffectScore: true enforced in types.",
  "Majetio Property Intelligence branding is delivery attribution, not score modifier.",
] as const;

export const B2B_API_SURFACE = [
  { method: "GET", path: "/api/bridge/b2b/analysis/order", status: "contract" },
  { method: "POST", path: "/api/bridge/b2b/analysis/order", status: "BETA" },
  { method: "POST", path: "/api/bridge/b2b/engagement", status: "BETA" },
  { method: "GET", path: "/api/bridge/b2b/organizations", status: "COMING_SOON" },
] as const;

export const B2B_FUTURE_SUBSCRIPTION_NOTE =
  "subscription_enterprise plan is architecture-ready (BillingPlanId + invoice drafts) — activation COMING_SOON.";
