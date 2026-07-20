import {
  B2B_PORTAL_AUDIT_KEY,
  type B2bAuditAction,
  type B2bAuditEntry,
} from "@/lib/b2b-portal/types";

const MAX_AUDIT = 200;

export function appendB2bAudit(
  entry: Omit<B2bAuditEntry, "id" | "at">
): B2bAuditEntry {
  const full: B2bAuditEntry = {
    ...entry,
    id: `b2b_audit_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(B2B_PORTAL_AUDIT_KEY);
      const logs: B2bAuditEntry[] = raw ? JSON.parse(raw) : [];
      logs.unshift(full);
      localStorage.setItem(B2B_PORTAL_AUDIT_KEY, JSON.stringify(logs.slice(0, MAX_AUDIT)));
    } catch {
      /* audit must not break UX */
    }
  }
  return full;
}

export function loadB2bAuditLogs(orgId?: string): B2bAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(B2B_PORTAL_AUDIT_KEY);
    const logs: B2bAuditEntry[] = raw ? JSON.parse(raw) : [];
    return orgId ? logs.filter((l) => l.orgId === orgId) : logs;
  } catch {
    return [];
  }
}

export function auditActionLabel(action: B2bAuditAction): string {
  const labels: Record<B2bAuditAction, string> = {
    org_switch: "Přepnutí organizace",
    property_submit: "Odeslání nemovitosti",
    analysis_order: "Objednávka analýzy",
    payment_recorded: "Zaznamenání platby",
    analysis_delivered: "Doručení analýzy",
    share_created: "Vytvoření share linku",
    engagement_tracked: "Engagement (anonymní)",
    interest_received: "Kvalifikovaný zájem (souhlas)",
    project_updated: "Aktualizace projektu",
    role_changed: "Změna role",
  };
  return labels[action];
}
