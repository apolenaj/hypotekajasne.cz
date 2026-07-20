import type { ClaimKind } from "@/lib/property-rentgen/types";
import type { DataStatus } from "@/lib/data/types";

export const REPORT_ENGINE_STORAGE_KEY = "hj-report-engine-v1";
export const REPORT_SHARE_STORAGE_KEY = "hj-report-shares-v1";
export const REPORT_ENGINE_FEATURE_STATUS = "BETA" as const;
export const REPORT_VERSION = "2026.07.1";

export const REPORT_TYPES = [
  "mortgage_readiness",
  "property_analysis",
  "property_comparison",
  "investment_passport",
  "portfolio_risk",
  "refinance",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  mortgage_readiness: "Report připravenosti na hypotéku",
  property_analysis: "Report analýzy nemovitosti",
  property_comparison: "Report porovnání nemovitostí",
  investment_passport: "Investiční pas",
  portfolio_risk: "Report rizika portfolia",
  refinance: "Report refinancování",
};

export type ReportSensitivity = "private" | "shareable_summary";

export type WhiteLabelConfig = {
  agentLogoUrl: string | null;
  companyName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  /** Metodika a zdroje HJ/Majetio vždy transparentní */
  preservePlatformAttribution: true;
};

export type ReportKeyValue = {
  label: string;
  value: string;
  claimKind?: ClaimKind;
  status?: DataStatus;
};

export type ReportTable = {
  headers: string[];
  rows: string[][];
};

export type ReportBlock = {
  id: string;
  title: string;
  items: ReportKeyValue[];
  prose?: string[];
  tables?: ReportTable[];
};

export type ReportHighlight = {
  label: string;
  value: string;
  sub?: string;
  claimKind?: ClaimKind;
};

export type ReportDocument = {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  version: string;
  sensitivity: ReportSensitivity;
  whiteLabel: WhiteLabelConfig | null;
  highlights: ReportHighlight[];
  inputs: ReportBlock;
  outputs: ReportBlock;
  assumptions: ReportBlock;
  sources: ReportBlock;
  dataFreshness: ReportBlock;
  methodology: ReportBlock;
  disclaimers: ReportBlock;
  nextSteps: ReportBlock;
};

export type ReportShareGrant = {
  token: string;
  reportId: string;
  createdAt: string;
  expiresAt: string;
  passwordHash: string | null;
  revokedAt: string | null;
  /** Default false — citlivá data maskována */
  allowSensitive: boolean;
  whiteLabel: WhiteLabelConfig | null;
};

export type ReportShareCreateInput = {
  reportId: string;
  expiresInHours?: number;
  password?: string | null;
  allowSensitive?: boolean;
  whiteLabel?: WhiteLabelConfig | null;
};

export type ReportEngineStore = {
  version: 1;
  reports: Record<string, ReportDocument>;
  shares: Record<string, ReportShareGrant>;
};

export function defaultReportEngineStore(): ReportEngineStore {
  return { version: 1, reports: {}, shares: {} };
}

export function defaultWhiteLabel(partial?: Partial<Omit<WhiteLabelConfig, "preservePlatformAttribution">>): WhiteLabelConfig {
  return {
    agentLogoUrl: partial?.agentLogoUrl ?? null,
    companyName: partial?.companyName ?? "",
    contactEmail: partial?.contactEmail ?? null,
    contactPhone: partial?.contactPhone ?? null,
    preservePlatformAttribution: true,
  };
}
