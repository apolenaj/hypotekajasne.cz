import type { DataStatus } from "@/lib/data/types";
import type { ClaimKind } from "@/lib/property-rentgen/types";

export const ALERT_CENTER_STORAGE_KEY = "hj-alert-center-v1";
export const ALERT_CENTER_FEATURE_STATUS = "BETA" as const;

export const ALERT_TYPES = [
  "RATE_CHANGE",
  "FIXATION",
  "PROPERTY_PRICE_CHANGE",
  "NEW_PROPERTY_MATCH",
  "DOCUMENT_EXPIRY",
  "REGULATORY_CHANGE",
  "PORTFOLIO_RISK",
  "RENT_REVIEW",
  "INSURANCE_RENEWAL",
  "ANALYSIS_UPDATE",
  "DEAL_TASK",
] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  RATE_CHANGE: "Změna sazby",
  FIXATION: "Fixace hypotéky",
  PROPERTY_PRICE_CHANGE: "Změna ceny nemovitosti",
  NEW_PROPERTY_MATCH: "Nová shoda nemovitosti",
  DOCUMENT_EXPIRY: "Expirace dokumentu",
  REGULATORY_CHANGE: "Regulační změna",
  PORTFOLIO_RISK: "Riziko portfolia",
  RENT_REVIEW: "Revize nájmu",
  INSURANCE_RENEWAL: "Obnova pojištění",
  ANALYSIS_UPDATE: "Aktualizace analýzy",
  DEAL_TASK: "Úkol v transakci",
};

export type AlertSeverity = "info" | "notable" | "important" | "critical";

export type AlertPriority = 1 | 2 | 3 | 4 | 5;

export type AlertDeliveryPreference =
  | "immediate"
  | "daily_digest"
  | "weekly_digest"
  | "off";

export const DELIVERY_PREFERENCE_LABELS: Record<AlertDeliveryPreference, string> = {
  immediate: "Okamžitě (in-app)",
  daily_digest: "Denní digest",
  weekly_digest: "Týdenní digest",
  off: "Vypnuto",
};

export type NotificationChannel = "in_app" | "email" | "push";

export type AlertAction = {
  label: string;
  href: string;
};

export type AlertDataSource = {
  module: string;
  recordId: string | null;
  claimKind: ClaimKind;
  status: DataStatus;
  fetchedAt: string | null;
};

export type CentralAlert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  priority: AlertPriority;
  title: string;
  reason: string;
  action: AlertAction;
  expiresAt: string | null;
  dataSource: AlertDataSource;
  /** „Why am I seeing this?“ */
  whyExplanation: string;
  /** Dedupe key — same fingerprint = same underlying change */
  fingerprint: string;
  createdAt: string;
  readAt: string | null;
  dismissedAt: string | null;
};

export type AlertTypePreferences = Partial<
  Record<AlertType, AlertDeliveryPreference>
>;

export type AlertCenterPreferences = {
  /** Global default when type not specified */
  defaultDelivery: AlertDeliveryPreference;
  byType: AlertTypePreferences;
  channels: {
    in_app: true;
    email: boolean;
    push: boolean;
  };
};

export type AlertCenterStore = {
  version: 1;
  preferences: AlertCenterPreferences;
  /** Emitted fingerprints for deduplication window */
  emittedFingerprints: Record<string, string>;
  readAlertIds: string[];
  dismissedAlertIds: string[];
  /** Queued for digest delivery */
  digestQueue: string[];
};

export type AlertCenterDashboard = {
  generatedAt: string;
  alerts: CentralAlert[];
  immediateAlerts: CentralAlert[];
  digestAlerts: CentralAlert[];
  dedupedCount: number;
  preferences: AlertCenterPreferences;
  channelStatus: Record<
    NotificationChannel,
    { status: "LIVE" | "BETA" | "COMING_SOON"; consentRequired: boolean }
  >;
  consentNote: string;
  methodology: string[];
};

export function defaultAlertCenterPreferences(): AlertCenterPreferences {
  return {
    defaultDelivery: "immediate",
    byType: {},
    channels: {
      in_app: true,
      email: false,
      push: false,
    },
  };
}

export function defaultAlertCenterStore(): AlertCenterStore {
  return {
    version: 1,
    preferences: defaultAlertCenterPreferences(),
    emittedFingerprints: {},
    readAlertIds: [],
    dismissedAlertIds: [],
    digestQueue: [],
  };
}

export function deliveryForType(
  prefs: AlertCenterPreferences,
  type: AlertType
): AlertDeliveryPreference {
  return prefs.byType[type] ?? prefs.defaultDelivery;
}
