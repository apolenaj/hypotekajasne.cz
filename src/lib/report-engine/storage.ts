import {
  REPORT_ENGINE_STORAGE_KEY,
  defaultReportEngineStore,
  type ReportDocument,
  type ReportEngineStore,
  type ReportShareGrant,
} from "@/lib/report-engine/types";

export function loadReportEngineStore(): ReportEngineStore {
  if (typeof window === "undefined") return defaultReportEngineStore();
  try {
    const raw = localStorage.getItem(REPORT_ENGINE_STORAGE_KEY);
    if (!raw) return defaultReportEngineStore();
    const parsed = JSON.parse(raw) as Partial<ReportEngineStore>;
    return {
      version: 1,
      reports: parsed.reports ?? {},
      shares: parsed.shares ?? {},
    };
  } catch {
    return defaultReportEngineStore();
  }
}

export function saveReportEngineStore(store: ReportEngineStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORT_ENGINE_STORAGE_KEY, JSON.stringify(store));
}

export function upsertReport(
  store: ReportEngineStore,
  report: ReportDocument
): ReportEngineStore {
  return {
    ...store,
    reports: { ...store.reports, [report.id]: report },
  };
}

export function getReport(
  store: ReportEngineStore,
  reportId: string
): ReportDocument | null {
  return store.reports[reportId] ?? null;
}

export function listReports(store: ReportEngineStore): ReportDocument[] {
  return Object.values(store.reports).sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function listSharesForReport(
  store: ReportEngineStore,
  reportId: string
): ReportShareGrant[] {
  return Object.values(store.shares)
    .filter((s) => s.reportId === reportId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getShareByToken(
  store: ReportEngineStore,
  token: string
): ReportShareGrant | null {
  return store.shares[token] ?? null;
}
