import type { B2bPortalStore, DeveloperProject } from "@/lib/b2b-portal/types";

export function listProjectsForOrg(
  store: B2bPortalStore,
  orgId: string
): DeveloperProject[] {
  return Object.values(store.developerProjects)
    .filter((p) => p.orgId === orgId)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function projectAvailabilitySummary(project: DeveloperProject): {
  available: number;
  reserved: number;
  sold: number;
  total: number;
} {
  const counts = { available: 0, reserved: 0, sold: 0 };
  for (const u of project.units) {
    counts[u.status]++;
  }
  return {
    ...counts,
    total: project.units.length,
  };
}
