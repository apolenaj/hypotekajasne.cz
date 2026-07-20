import {
  B2B_PORTAL_STORAGE_KEY,
  defaultB2bPortalStore,
  type B2bPortalStore,
} from "@/lib/b2b-portal/types";

export function loadB2bPortalStore(): B2bPortalStore {
  if (typeof window === "undefined") return defaultB2bPortalStore();
  try {
    const raw = localStorage.getItem(B2B_PORTAL_STORAGE_KEY);
    if (!raw) return defaultB2bPortalStore();
    const parsed = JSON.parse(raw) as Partial<B2bPortalStore>;
    return {
      ...defaultB2bPortalStore(),
      ...parsed,
      engagementEvents: parsed.engagementEvents ?? [],
    };
  } catch {
    return defaultB2bPortalStore();
  }
}

export function saveB2bPortalStore(store: B2bPortalStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(B2B_PORTAL_STORAGE_KEY, JSON.stringify(store));
}

export function setActiveOrg(
  store: B2bPortalStore,
  orgId: string,
  memberId: string
): B2bPortalStore {
  return { ...store, activeOrgId: orgId, activeMemberId: memberId };
}
