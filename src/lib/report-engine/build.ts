import { buildReportByType } from "@/lib/report-engine/builders";
import { sanitizeReportForShare } from "@/lib/report-engine/sanitize";
import {
  createShareGrant,
  normalizeWhiteLabel,
  revokeShareGrant,
  validateShareAccess,
} from "@/lib/report-engine/share";
import {
  getReport,
  getShareByToken,
  listReports,
  listSharesForReport,
  loadReportEngineStore,
  saveReportEngineStore,
  upsertReport,
} from "@/lib/report-engine/storage";
import type {
  ReportDocument,
  ReportShareCreateInput,
  ReportShareGrant,
  ReportType,
} from "@/lib/report-engine/types";

export function generateAndStoreReport(input: {
  type: ReportType;
  ratePercent?: number | null;
  whiteLabel?: Parameters<typeof normalizeWhiteLabel>[0];
}): ReportDocument {
  const store = loadReportEngineStore();
  const report = buildReportByType(input.type, {
    ratePercent: input.ratePercent,
    whiteLabel: normalizeWhiteLabel(input.whiteLabel),
  });
  const next = upsertReport(store, report);
  saveReportEngineStore(next);
  return report;
}

export function resolveSharedReport(input: {
  token: string;
  password?: string | null;
  store?: ReportEngineStoreLike;
}): {
  access: ReturnType<typeof validateShareAccess>;
  report: ReportDocument | null;
} {
  const store = input.store ?? loadReportEngineStore();
  const grant = getShareByToken(store, input.token);
  const access = validateShareAccess(grant, input.password);
  if (!access.ok) return { access, report: null };

  const raw = getReport(store, access.grant.reportId);
  if (!raw) return { access: { ok: false, reason: "not_found" }, report: null };

  const report = sanitizeReportForShare(raw, access.grant.allowSensitive);
  if (access.grant.whiteLabel) {
    return { access, report: { ...report, whiteLabel: access.grant.whiteLabel } };
  }
  return { access, report };
}

type ReportEngineStoreLike = ReturnType<typeof loadReportEngineStore>;

export function createReportShare(
  input: ReportShareCreateInput
): { grant: ReportShareGrant; urlPath: string } {
  const store = loadReportEngineStore();
  const { store: next, grant } = createShareGrant(store, input);
  saveReportEngineStore(next);
  return { grant, urlPath: `/reporty/sdilet/${grant.token}` };
}

export function revokeReportShare(token: string): void {
  const store = loadReportEngineStore();
  saveReportEngineStore(revokeShareGrant(store, token));
}

export {
  buildReportByType,
  listReports,
  listSharesForReport,
  loadReportEngineStore,
  sanitizeReportForShare,
};
