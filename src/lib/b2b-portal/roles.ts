import type { B2bMemberRole, B2bOrgType } from "@/lib/b2b-portal/types";

export type B2bPermission =
  | "property.submit"
  | "analysis.order"
  | "analysis.track"
  | "report.download"
  | "share.create"
  | "engagement.view"
  | "interest.view"
  | "project.manage"
  | "billing.view"
  | "billing.manage"
  | "org.admin"
  | "audit.view";

const ROLE_PERMISSIONS: Record<B2bMemberRole, B2bPermission[]> = {
  org_owner: [
    "property.submit",
    "analysis.order",
    "analysis.track",
    "report.download",
    "share.create",
    "engagement.view",
    "interest.view",
    "project.manage",
    "billing.view",
    "billing.manage",
    "org.admin",
    "audit.view",
  ],
  org_admin: [
    "property.submit",
    "analysis.order",
    "analysis.track",
    "report.download",
    "share.create",
    "engagement.view",
    "interest.view",
    "project.manage",
    "billing.view",
    "billing.manage",
    "org.admin",
    "audit.view",
  ],
  agent: [
    "property.submit",
    "analysis.order",
    "analysis.track",
    "report.download",
    "share.create",
    "engagement.view",
    "interest.view",
  ],
  analyst: [
    "analysis.track",
    "report.download",
    "share.create",
    "engagement.view",
    "audit.view",
  ],
  developer_pm: [
    "project.manage",
    "report.download",
    "engagement.view",
    "interest.view",
    "audit.view",
  ],
  finance_partner: [
    "analysis.track",
    "report.download",
    "engagement.view",
    "interest.view",
    "billing.view",
  ],
  viewer: ["analysis.track", "engagement.view"],
};

export function memberHasPermission(
  role: B2bMemberRole,
  permission: B2bPermission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsForRole(role: B2bMemberRole): B2bPermission[] {
  return [...ROLE_PERMISSIONS[role]];
}

/** Org type → default portal workspace tab */
export function defaultWorkspaceForOrgType(
  orgType: B2bOrgType
): "agent" | "developer" | "partner" {
  switch (orgType) {
    case "developer":
      return "developer";
    case "mortgage_partner":
      return "partner";
    default:
      return "agent";
  }
}
