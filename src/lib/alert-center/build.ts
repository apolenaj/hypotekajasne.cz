import type { CurrentRates } from "@/lib/rates";
import {
  collectAllAlertCandidates,
  collectRefinanceRadarAlerts,
  type AlertCollectContext,
} from "@/lib/alert-center/collect";
import {
  ALERT_CENTER_CONSENT_NOTE,
  channelStatusMap,
} from "@/lib/alert-center/channels";
import {
  dedupeAlerts,
  filterAlreadyEmitted,
  stampEmittedFingerprints,
} from "@/lib/alert-center/dedupe";
import type {
  AlertCenterDashboard,
  AlertCenterStore,
  AlertDeliveryPreference,
  CentralAlert,
} from "@/lib/alert-center/types";
import { deliveryForType } from "@/lib/alert-center/types";

function splitByDelivery(
  alerts: CentralAlert[],
  store: AlertCenterStore
): { immediate: CentralAlert[]; digest: CentralAlert[] } {
  const immediate: CentralAlert[] = [];
  const digest: CentralAlert[] = [];

  for (const a of alerts) {
    if (store.dismissedAlertIds.includes(a.id)) continue;
    const mode = deliveryForType(store.preferences, a.type);
    if (mode === "off") continue;
    if (mode === "immediate") immediate.push(a);
    else digest.push(a);
  }

  return { immediate, digest };
}

export function buildAlertCenterDashboard(input: {
  store: AlertCenterStore;
  rates?: CurrentRates | null;
  collectContext?: Partial<AlertCollectContext>;
  now?: Date;
}): AlertCenterDashboard {
  const now = input.now ?? new Date();
  const ctx: AlertCollectContext = {
    rates: input.rates ?? null,
    previousRatePercent: input.collectContext?.previousRatePercent ?? 5.14,
    includeDemo: input.collectContext?.includeDemo ?? true,
    ...input.collectContext,
    now,
  };

  const raw = [
    ...collectAllAlertCandidates(ctx),
    ...collectRefinanceRadarAlerts(ctx),
  ];

  const { alerts: deduped, removedCount } = dedupeAlerts(raw);
  const fresh = filterAlreadyEmitted(
    deduped,
    input.store.emittedFingerprints,
    now
  );

  const withReadState = fresh.map((a) => ({
    ...a,
    readAt: input.store.readAlertIds.includes(a.id) ? now.toISOString() : null,
  }));

  const { immediate, digest } = splitByDelivery(withReadState, input.store);

  return {
    generatedAt: now.toISOString(),
    alerts: withReadState,
    immediateAlerts: immediate,
    digestAlerts: digest,
    dedupedCount: removedCount,
    preferences: input.store.preferences,
    channelStatus: channelStatusMap(),
    consentNote: ALERT_CENTER_CONSENT_NOTE,
    methodology: [
      "Každý alert má severity, priority, reason, action, expiresAt, dataSource.",
      "Deduplication přes fingerprint — stejná změna sazby = jeden alert.",
      "Žádné generické „Sazby klesly“ — vždy LTV/profil/splátka kontext.",
      "Why am I seeing this? = transparentní vysvětlení triggeru.",
      "Preference: immediate / daily / weekly / off per type nebo globálně.",
      "Email/push COMING_SOON — vyžadují consent, in-app je default.",
    ],
  };
}

export function evaluateAndPersistAlerts(input: {
  store: AlertCenterStore;
  dashboard: AlertCenterDashboard;
  now?: Date;
}): AlertCenterStore {
  const now = input.now ?? new Date();
  const newFingerprints = stampEmittedFingerprints(
    input.dashboard.alerts,
    input.store.emittedFingerprints,
    now
  );

  return {
    ...input.store,
    emittedFingerprints: newFingerprints,
    digestQueue: [
      ...new Set([
        ...input.store.digestQueue,
        ...input.dashboard.digestAlerts.map((a) => a.fingerprint),
      ]),
    ].slice(0, 100),
  };
}

export function setTypeDeliveryPreference(
  store: AlertCenterStore,
  type: import("@/lib/alert-center/types").AlertType,
  delivery: AlertDeliveryPreference
): AlertCenterStore {
  return {
    ...store,
    preferences: {
      ...store.preferences,
      byType: { ...store.preferences.byType, [type]: delivery },
    },
  };
}
