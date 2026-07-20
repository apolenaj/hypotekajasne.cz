import { loadB2bAuditLogs, appendB2bAudit } from "@/lib/b2b-portal/audit";
import { listOrdersForOrg } from "@/lib/b2b-portal/analysis";
import { listProjectsForOrg, projectAvailabilitySummary } from "@/lib/b2b-portal/developer";
import { seedDemoB2bStore } from "@/lib/b2b-portal/demo";
import { engagementSummaryForOrg } from "@/lib/b2b-portal/engagement";
import { listInterestsForOrg } from "@/lib/b2b-portal/interest";
import { B2B_BILLING_PLANS, formatPlanPrice } from "@/lib/b2b-portal/pricing";
import { memberHasPermission, permissionsForRole } from "@/lib/b2b-portal/roles";
import { loadB2bPortalStore, saveB2bPortalStore } from "@/lib/b2b-portal/storage";
import type {
  B2bMember,
  B2bOrganization,
  B2bPortalStore,
} from "@/lib/b2b-portal/types";
import { B2B_SCORE_ISOLATION_RULES } from "@/lib/b2b-portal/architecture";

export type B2bPortalDashboard = {
  store: B2bPortalStore;
  organization: B2bOrganization | null;
  member: B2bMember | null;
  permissions: ReturnType<typeof permissionsForRole>;
  orders: ReturnType<typeof listOrdersForOrg>;
  projects: ReturnType<typeof listProjectsForOrg>;
  projectSummaries: { projectId: string; name: string; availability: ReturnType<typeof projectAvailabilitySummary> }[];
  engagement: ReturnType<typeof engagementSummaryForOrg>;
  interests: ReturnType<typeof listInterestsForOrg>;
  recentAudit: ReturnType<typeof loadB2bAuditLogs>;
  billingPlans: typeof B2B_BILLING_PLANS;
  scoreIsolationRules: typeof B2B_SCORE_ISOLATION_RULES;
};

export function ensureB2bPortalStore(): B2bPortalStore {
  let store = loadB2bPortalStore();
  store = seedDemoB2bStore(store);
  saveB2bPortalStore(store);
  return store;
}

export function buildB2bPortalDashboard(store?: B2bPortalStore): B2bPortalDashboard {
  const s = store ?? ensureB2bPortalStore();
  const org = s.activeOrgId ? s.organizations[s.activeOrgId] ?? null : null;
  const member = s.activeMemberId ? s.members[s.activeMemberId] ?? null : null;
  const orgId = org?.id ?? "";

  const projects = orgId ? listProjectsForOrg(s, orgId) : [];

  return {
    store: s,
    organization: org,
    member,
    permissions: member ? permissionsForRole(member.role) : [],
    orders: orgId ? listOrdersForOrg(s, orgId) : [],
    projects,
    projectSummaries: projects.map((p) => ({
      projectId: p.id,
      name: p.name,
      availability: projectAvailabilitySummary(p),
    })),
    engagement: orgId ? engagementSummaryForOrg(s, orgId) : { totalEvents: 0, uniqueViewers: 0 },
    interests: orgId ? listInterestsForOrg(s, orgId) : [],
    recentAudit: orgId ? loadB2bAuditLogs(orgId).slice(0, 12) : [],
    billingPlans: B2B_BILLING_PLANS,
    scoreIsolationRules: B2B_SCORE_ISOLATION_RULES,
  };
}

export function switchActiveOrg(
  store: B2bPortalStore,
  orgId: string
): B2bPortalStore {
  const member = Object.values(store.members).find((m) => m.orgId === orgId);
  if (!member) throw new Error("No member for org");
  appendB2bAudit({
    orgId,
    actorMemberId: member.id,
    action: "org_switch",
    resourceType: "organization",
    resourceId: orgId,
    metadata: {},
  });
  return {
    ...store,
    activeOrgId: orgId,
    activeMemberId: member.id,
  };
}

export { memberHasPermission, formatPlanPrice };
