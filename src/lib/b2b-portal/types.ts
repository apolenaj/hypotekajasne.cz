/**
 * B2B Professional Portal — typy organizace, objednávek, billing a audit.
 * SaaS vrstva — ne jednorázový formulář.
 */

export const B2B_PORTAL_STORAGE_KEY = "hj-b2b-portal-v1";
export const B2B_PORTAL_AUDIT_KEY = "hj-b2b-portal-audit-v1";
export const B2B_PORTAL_FEATURE_STATUS = "BETA" as const;
export const B2B_PORTAL_VERSION = "2026.07.1";

export const MAJETIO_INTELLIGENCE_LABEL =
  "Analyzováno pomocí Majetio Property Intelligence";

/** Provenance vrstvy — musí být vizuálně oddělené */
export const DATA_PROVENANCE_KINDS = [
  "independent_data",
  "partner_provided",
  "modelled_estimate",
] as const;

export type DataProvenanceKind = (typeof DATA_PROVENANCE_KINDS)[number];

export const DATA_PROVENANCE_LABELS: Record<DataProvenanceKind, string> = {
  independent_data: "Nezávislá data platformy",
  partner_provided: "Data od partnera",
  modelled_estimate: "Modelový odhad",
};

export const B2B_ORG_TYPES = [
  "real_estate_agent",
  "agency",
  "developer",
  "mortgage_partner",
] as const;

export type B2bOrgType = (typeof B2B_ORG_TYPES)[number];

export const B2B_ORG_TYPE_LABELS: Record<B2bOrgType, string> = {
  real_estate_agent: "Realitní makléř",
  agency: "Realitní kancelář",
  developer: "Developer",
  mortgage_partner: "Hypoteční partner",
};

export const B2B_MEMBER_ROLES = [
  "org_owner",
  "org_admin",
  "agent",
  "analyst",
  "developer_pm",
  "finance_partner",
  "viewer",
] as const;

export type B2bMemberRole = (typeof B2B_MEMBER_ROLES)[number];

export const B2B_MEMBER_ROLE_LABELS: Record<B2bMemberRole, string> = {
  org_owner: "Vlastník organizace",
  org_admin: "Administrátor",
  agent: "Makléř",
  analyst: "Analytik",
  developer_pm: "Project manager (developer)",
  finance_partner: "Finanční partner",
  viewer: "Pouze náhled",
};

export type B2bOrganization = {
  id: string;
  type: B2bOrgType;
  name: string;
  ico: string | null;
  contactEmail: string;
  whiteLabelLogoUrl: string | null;
  createdAt: string;
  /** Billing-ready — Stripe/customer id placeholder */
  billingCustomerId: string | null;
  activePlanId: BillingPlanId | null;
};

export type B2bMember = {
  id: string;
  orgId: string;
  displayName: string;
  email: string;
  role: B2bMemberRole;
  joinedAt: string;
};

export const BILLING_PLAN_IDS = [
  "single_analysis",
  "package_starter",
  "package_pro",
  "subscription_enterprise",
] as const;

export type BillingPlanId = (typeof BILLING_PLAN_IDS)[number];

export const BILLING_PLAN_STATUS: Record<
  BillingPlanId,
  "available" | "coming_soon"
> = {
  single_analysis: "available",
  package_starter: "available",
  package_pro: "available",
  subscription_enterprise: "coming_soon",
};

export type BillingLineItem = {
  sku: string;
  description: string;
  quantity: number;
  unitAmountCzk: number;
  currency: "CZK";
  taxRatePercent: number;
};

export type BillingInvoiceDraft = {
  id: string;
  orgId: string;
  orderId: string | null;
  status: "draft" | "pending_payment" | "paid" | "void";
  lineItems: BillingLineItem[];
  subtotalCzk: number;
  taxCzk: number;
  totalCzk: number;
  currency: "CZK";
  createdAt: string;
  paidAt: string | null;
  /** Externí platební reference — připraveno pro Stripe */
  externalPaymentIntentId: string | null;
};

export const ANALYSIS_ORDER_STATUSES = [
  "draft",
  "awaiting_payment",
  "paid",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
] as const;

export type AnalysisOrderStatus = (typeof ANALYSIS_ORDER_STATUSES)[number];

export type PropertySubmission = {
  id: string;
  orgId: string;
  submittedByMemberId: string;
  label: string;
  country: string;
  city: string;
  propertyType: "Byt" | "Dům" | "Komerce" | "";
  areaM2: number;
  priceCzk: number;
  rentMonthlyCzk: number | null;
  listingUrl: string | null;
  notes: string | null;
  createdAt: string;
  /** Partner data — oddělené od nezávislého skóre */
  partnerProvidedFields: string[];
};

/** Skóre vypočtené PŘED platbou — platba ho nemění */
export type AnalysisScoreSnapshot = {
  computedAt: string;
  paymentDoesNotAffectScore: true;
  orientationalYieldPct: number | null;
  pricePerM2Czk: number | null;
  investmentScore: number | null;
  scoreProvenance: DataProvenanceKind;
  methodologyNote: string;
};

export type AnalysisOrder = {
  id: string;
  orgId: string;
  propertySubmissionId: string;
  status: AnalysisOrderStatus;
  planId: BillingPlanId;
  amountCzk: number;
  invoiceId: string | null;
  createdAt: string;
  paidAt: string | null;
  deliveredAt: string | null;
  reportId: string | null;
  shareToken: string | null;
  scoreSnapshot: AnalysisScoreSnapshot;
  majetioIntelligenceBranded: true;
  sponsoredPlacements: SponsoredPlacement[];
};

export type SponsoredPlacement = {
  id: string;
  slot: "financing_sidebar" | "partner_banner" | "developer_highlight";
  partnerName: string;
  label: string;
  /** Vždy true — UI musí zobrazit SPONSORED */
  isSponsored: true;
  doesNotAffectScore: true;
};

export type ShareEngagementEvent = {
  id: string;
  analysisOrderId: string;
  orgId: string;
  eventType: "view" | "download" | "scroll_depth" | "cta_click";
  anonymousViewerHash: string;
  metadata: Record<string, string | number>;
  at: string;
};

export type QualifiedInterestLead = {
  id: string;
  analysisOrderId: string;
  orgId: string;
  consentId: string;
  consentGrantedAt: string;
  consentText: string;
  /** Kontakt až po consent — může být maskovaný v BETA */
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  interestType: "viewing" | "financing" | "investment" | "general";
  status: "new" | "contacted" | "closed";
  at: string;
};

export type DeveloperUnitStatus = "available" | "reserved" | "sold";

export type DeveloperUnit = {
  id: string;
  projectId: string;
  label: string;
  floor: number | null;
  areaM2: number;
  priceCzk: number;
  status: DeveloperUnitStatus;
  availabilityUpdatedAt: string;
};

export type PaymentPlanInstallment = {
  dueAt: string;
  amountCzk: number;
  label: string;
  claimKind: DataProvenanceKind;
};

export type DeveloperPaymentPlan = {
  id: string;
  projectId: string;
  name: string;
  installments: PaymentPlanInstallment[];
  disclaimer: string;
};

export type ProjectDocument = {
  id: string;
  projectId: string;
  title: string;
  docType: "standard" | "floor_plan" | "contract_template" | "energy";
  url: string | null;
  provenance: DataProvenanceKind;
  updatedAt: string;
};

export type VerifiedFinancingOption = {
  id: string;
  projectId: string;
  lenderLabel: string;
  maxLtvPercent: number;
  rateFromPercent: number;
  verifiedAt: string;
  provenance: "partner_provided";
  sponsored: boolean;
  disclaimer: string;
};

export type DeveloperProject = {
  id: string;
  orgId: string;
  name: string;
  city: string;
  phase: "planning" | "presale" | "construction" | "completed";
  units: DeveloperUnit[];
  paymentPlans: DeveloperPaymentPlan[];
  documents: ProjectDocument[];
  financingOptions: VerifiedFinancingOption[];
  updatedAt: string;
};

export type B2bAuditAction =
  | "org_switch"
  | "property_submit"
  | "analysis_order"
  | "payment_recorded"
  | "analysis_delivered"
  | "share_created"
  | "engagement_tracked"
  | "interest_received"
  | "project_updated"
  | "role_changed";

export type B2bAuditEntry = {
  id: string;
  at: string;
  orgId: string;
  actorMemberId: string;
  action: B2bAuditAction;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, string | number | boolean>;
};

export type B2bPortalStore = {
  version: 1;
  activeOrgId: string | null;
  activeMemberId: string | null;
  organizations: Record<string, B2bOrganization>;
  members: Record<string, B2bMember>;
  propertySubmissions: Record<string, PropertySubmission>;
  analysisOrders: Record<string, AnalysisOrder>;
  invoices: Record<string, BillingInvoiceDraft>;
  engagementEvents: ShareEngagementEvent[];
  qualifiedInterests: Record<string, QualifiedInterestLead>;
  developerProjects: Record<string, DeveloperProject>;
};

export function defaultB2bPortalStore(): B2bPortalStore {
  return {
    version: 1,
    activeOrgId: null,
    activeMemberId: null,
    organizations: {},
    members: {},
    propertySubmissions: {},
    analysisOrders: {},
    invoices: {},
    engagementEvents: [],
    qualifiedInterests: {},
    developerProjects: {},
  };
}
