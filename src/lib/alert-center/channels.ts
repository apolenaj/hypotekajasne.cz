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
    description: "Upozornění přímo na webu — výchozí a vždy dostupné.",
  },
  {
    channel: "email",
    status: "COMING_SOON",
    consentRequired: true,
    consentCategory: "product_email",
    description:
      "Souhrnný e-mail — vyžaduje výslovný souhlas (oddělený od formuláře poptávky).",
  },
  {
    channel: "push",
    status: "COMING_SOON",
    consentRequired: true,
    consentCategory: "push_os",
    description:
      "Push v prohlížeči — vyžaduje povolení v systému a váš souhlas.",
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
  "E-mail a push nejsou aktivní bez výslovného souhlasu. Upozornění na webu marketingový souhlas nevyžadují a neodesílají data třetím stranám.";

/** Interní pořadí zpracování — není určeno pro veřejné UI. */
export const NOTIFY_PIPELINE = [
  "1. collect candidates",
  "2. dedupe",
  "3. filter emitted",
  "4. split immediate vs digest",
  "5. in-app persist",
  "6. email/push queue when consented",
] as const;
