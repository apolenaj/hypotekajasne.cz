import type {
  ReportEngineStore,
  ReportShareCreateInput,
  ReportShareGrant,
} from "@/lib/report-engine/types";
import { defaultWhiteLabel } from "@/lib/report-engine/types";

export type ShareAccessResult =
  | { ok: true; grant: ReportShareGrant }
  | { ok: false; reason: "not_found" | "expired" | "revoked" | "password_required" | "password_invalid" };

/** Deterministic hash for BETA localStorage — not server-grade crypto. */
export function hashPassword(password: string): string {
  let h = 5381;
  for (let i = 0; i < password.length; i++) {
    h = ((h << 5) + h) ^ password.charCodeAt(i);
  }
  return `hj_pw_${(h >>> 0).toString(36)}`;
}

export function generateShareToken(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 18);
  return `shr_${rand}`;
}

export function createShareGrant(
  store: ReportEngineStore,
  input: ReportShareCreateInput
): { store: ReportEngineStore; grant: ReportShareGrant } {
  const report = store.reports[input.reportId];
  if (!report) {
    throw new Error("Report not found");
  }

  const now = new Date();
  const hours = input.expiresInHours ?? 168;
  const token = generateShareToken();
  const grant: ReportShareGrant = {
    token,
    reportId: input.reportId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + hours * 3_600_000).toISOString(),
    passwordHash: input.password ? hashPassword(input.password) : null,
    revokedAt: null,
    allowSensitive: input.allowSensitive ?? false,
    whiteLabel: input.whiteLabel ?? report.whiteLabel ?? null,
  };

  return {
    store: {
      ...store,
      shares: { ...store.shares, [token]: grant },
    },
    grant,
  };
}

export function validateShareAccess(
  grant: ReportShareGrant | null | undefined,
  password?: string | null
): ShareAccessResult {
  if (!grant) return { ok: false, reason: "not_found" };
  if (grant.revokedAt) return { ok: false, reason: "revoked" };
  if (Date.parse(grant.expiresAt) <= Date.now()) return { ok: false, reason: "expired" };

  if (grant.passwordHash) {
    if (!password) return { ok: false, reason: "password_required" };
    if (hashPassword(password) !== grant.passwordHash) {
      return { ok: false, reason: "password_invalid" };
    }
  }

  return { ok: true, grant };
}

export function revokeShareGrant(
  store: ReportEngineStore,
  token: string
): ReportEngineStore {
  const grant = store.shares[token];
  if (!grant) return store;
  return {
    ...store,
    shares: {
      ...store.shares,
      [token]: { ...grant, revokedAt: new Date().toISOString() },
    },
  };
}

export function buildSharePath(token: string): string {
  return `/reporty/sdilet/${token}`;
}

export function buildShareUrl(token: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "https://hypotekajasne.cz");
  return `${base}${buildSharePath(token)}`;
}

export function normalizeWhiteLabel(
  partial?: Partial<{
    agentLogoUrl: string | null;
    companyName: string;
    contactEmail: string | null;
    contactPhone: string | null;
  }> | null
) {
  if (!partial?.companyName?.trim()) return null;
  return defaultWhiteLabel(partial);
}
