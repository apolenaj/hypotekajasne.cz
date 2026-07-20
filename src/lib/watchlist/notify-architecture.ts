/**
 * Email / push notification architecture — SEPARATE from in-app alerts.
 * Not implemented as live delivery; blueprint only (COMING_SOON).
 */

export type NotifyChannel = "in_app" | "email" | "web_push";

export type NotifyDeliveryStatus = "COMING_SOON" | "BETA" | "LIVE";

export const NOTIFY_CHANNELS: Record<
  NotifyChannel,
  {
    status: NotifyDeliveryStatus;
    description: string;
  }
> = {
  in_app: {
    status: "LIVE",
    description: "Smart Watchlist alerts in /sledovani + dashboard widget.",
  },
  email: {
    status: "COMING_SOON",
    description:
      "Digest or transactional email — requires consent + LEGAL_OPERATOR identity.",
  },
  web_push: {
    status: "COMING_SOON",
    description: "Browser push — requires VAPID keys + explicit opt-in.",
  },
};

export type NotifyQueueJob = {
  id: string;
  channel: Exclude<NotifyChannel, "in_app">;
  userRef: string; // anonymous lifecycle id or future account id — not email in cleartext at rest without encryption
  alertIds: string[];
  scheduledFor: string;
  consentVersion: string;
  templateId: "watchlist_digest" | "watchlist_important";
};

export type NotifyArchitectureBlueprint = {
  principles: string[];
  pipeline: string[];
  consent: string[];
  nonGoals: string[];
  envPlaceholders: string[];
};

export const NOTIFY_ARCHITECTURE: NotifyArchitectureBlueprint = {
  principles: [
    "In-app alerts are the default retention surface.",
    "Email/push never send without separate marketing/product consent.",
    "Throttle in-app first; remote channels inherit the same cooldown keys.",
    "No dark-pattern ‘urgent’ subjects; digest preferred over bursts.",
  ],
  pipeline: [
    "1. generateWatchAlertCandidates (deterministic)",
    "2. filterAlertsByThrottle",
    "3. persist in-app alerts",
    "4. IF email/push consented → enqueue NotifyQueueJob (future worker)",
    "5. Worker renders template from alert ids only (no invented copy)",
  ],
  consent: [
    "Reuse FormConsentRecord / cookie marketing category where applicable.",
    "Product transactional watchlist email = separate purpose + version.",
    "Unsubscribe link mandatory on every email.",
  ],
  nonGoals: [
    "Sending email from the browser",
    "Buying third-party lead lists",
    "Push without OS permission prompt",
  ],
  envPlaceholders: [
    "NOTIFY_EMAIL_PROVIDER_API_KEY",
    "NOTIFY_EMAIL_FROM",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "NOTIFY_WORKER_SECRET",
  ],
};
