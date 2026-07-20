import type { CookieConsentRecord } from "@/lib/consent/records";
import type { NotificationChannel } from "@/lib/alert-center/types";

export type ChannelDescriptor = {
  channel: NotificationChannel;
  status: "LIVE" | "BETA" | "COMING_SOON";
  consentRequired: boolean;
  consentCategory: "none" | "product_email" | "marketing" | "push_os";
  description: string;
};

export const ALERT_CHANNELS: ChannelDescriptor[] = [
  {
    channel: "in_app",
    status: "LIVE",
    consentRequired: false,
    consentCategory: "none",
    description: "Alert Center + dashboard widget — výchozí kanál.",
  },
  {
    channel: "email",
    status: "COMING_SOON",
    consentRequired: true,
    consentCategory: "product_email",
    description:
      "Digest e-mail — vyžaduje výslovný product consent (oddělený od lead formuláře).",
  },
  {
    channel: "push",
    status: "COMING_SOON",
    consentRequired: true,
    consentCategory: "push_os",
    description: "Web push — vyžaduje OS permission + consent záznam.",
  },
];

export type NotifyQueueJob = {
  id: string;
  channel: Exclude<NotificationChannel, "in_app">;
  alertFingerprints: string[];
  scheduledFor: string;
  digestKind: "daily" | "weekly";
  consentVersion: string;
};

export function channelStatusMap(): Record<
  NotificationChannel,
  { status: "LIVE" | "BETA" | "COMING_SOON"; consentRequired: boolean }
> {
  return Object.fromEntries(
    ALERT_CHANNELS.map((c) => [
      c.channel,
      { status: c.status, consentRequired: c.consentRequired },
    ])
  ) as Record<
    NotificationChannel,
    { status: "LIVE" | "BETA" | "COMING_SOON"; consentRequired: boolean }
  >;
}

/**
 * Respektuje consent — email/push jen při explicitním opt-in.
 * In-app je vždy povolen (nezasílá data mimo prohlížeč).
 */
export function resolveEnabledChannels(input: {
  preferences: { channels: { in_app: boolean; email: boolean; push: boolean } };
  cookieConsent: CookieConsentRecord | null;
  productEmailConsent: boolean;
}): NotificationChannel[] {
  const enabled: NotificationChannel[] = [];
  if (input.preferences.channels.in_app) enabled.push("in_app");

  if (
    input.preferences.channels.email &&
    input.productEmailConsent
  ) {
    enabled.push("email");
  }

  if (input.preferences.channels.push && input.productEmailConsent) {
    enabled.push("push");
  }

  return enabled;
}

export const ALERT_CENTER_CONSENT_NOTE =
  "E-mail a push notifikace nejsou aktivní bez výslovného souhlasu. In-app alerty nevyžadují marketing consent — neodesílají data třetím stranám.";

export const NOTIFY_PIPELINE = [
  "1. collectAllAlertCandidates (deterministické zdroje)",
  "2. dedupeAlerts (fingerprint)",
  "3. filterAlreadyEmitted (24h okno)",
  "4. split immediate vs digest dle preferencí",
  "5. in-app persist",
  "6. IF email/push consented → enqueue NotifyQueueJob (worker COMING_SOON)",
] as const;
