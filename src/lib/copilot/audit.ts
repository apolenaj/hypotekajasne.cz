import type { CopilotAuditEntry } from "@/lib/copilot/types";

const AUDIT_KEY = "hj-copilot-audit-v1";
const MAX_ENTRIES = 40;

export function loadAuditLog(): CopilotAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CopilotAuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAuditLog(entry: CopilotAuditEntry) {
  if (typeof window === "undefined") return;
  const prev = loadAuditLog();
  const next = [entry, ...prev].slice(0, MAX_ENTRIES);
  sessionStorage.setItem(AUDIT_KEY, JSON.stringify(next));
}

export function clearAuditLog() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUDIT_KEY);
}

export function createAuditId(): string {
  return `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createMessageId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
