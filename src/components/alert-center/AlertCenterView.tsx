"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Mail,
  Settings2,
  Smartphone,
  X,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import {
  ALERT_CENTER_FEATURE_STATUS,
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
  ALERT_CHANNELS,
  DELIVERY_PREFERENCE_LABELS,
  buildAlertCenterDashboard,
  dismissAlert,
  loadAlertCenterStore,
  markAlertRead,
  saveAlertCenterStore,
  setTypeDeliveryPreference,
  type AlertDeliveryPreference,
  type AlertType,
  type CentralAlert,
} from "@/lib/alert-center";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

const SEVERITY_STYLES: Record<CentralAlert["severity"], string> = {
  info: "border-stone-200 bg-stone-50",
  notable: "border-sky-200 bg-sky-50",
  important: "border-amber-200 bg-amber-50",
  critical: "border-red-200 bg-red-50",
};

function AlertCard({
  alert,
  onDismiss,
  onRead,
}: {
  alert: CentralAlert;
  onDismiss: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <article
      className={`rounded-2xl border-2 p-4 ${SEVERITY_STYLES[alert.severity]} ${alert.readAt ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">
              {ALERT_TYPE_LABELS[alert.type]}
            </span>
            <DataStatusBadge status={alert.dataSource.status} />
            <ClaimBadge kind={alert.dataSource.claimKind} />
          </div>
          <h3 className="mt-1 font-semibold">{alert.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{alert.reason}</p>
        </div>
        <button
          type="button"
          aria-label="Zavřít upozornění"
          onClick={() => onDismiss(alert.id)}
          className="rounded p-1 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={alert.action.href}
          onClick={() => onRead(alert.id)}
          className="inline-flex items-center gap-1 rounded-full bg-deep-teal px-3 py-1 text-xs font-semibold text-white"
        >
          {alert.action.label}
          <ChevronRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          onClick={() => setShowWhy(!showWhy)}
          className="rounded-full border px-3 py-1 text-xs font-semibold"
        >
          Proč to vidím?
        </button>
      </div>
      {showWhy && (
        <p className="mt-2 rounded-lg border border-border bg-white/80 p-3 text-xs">
          {alert.whyExplanation}
          <br />
          <span className="text-muted-foreground">
            Typ údaje:{" "}
            {alert.dataSource.claimKind === "DATA"
              ? "Data"
              : alert.dataSource.claimKind === "MODEL"
                ? "Modelový výpočet"
                : alert.dataSource.claimKind === "ODHAD"
                  ? "Odhad"
                  : "Neověřeno"}{" "}
            ·{" "}
            {alert.dataSource.status === "LIVE"
              ? "Aktuální data"
              : alert.dataSource.status === "VERIFIED"
                ? "Ověřeno"
                : alert.dataSource.status === "MODEL"
                  ? "Modelový výpočet"
                  : alert.dataSource.status === "PARTNER_QUOTE"
                    ? "Nabídka partnera"
                    : "Údaj potřebuje aktualizaci"}
          </span>
        </p>
      )}
      {alert.expiresAt && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Platí do: {new Date(alert.expiresAt).toLocaleString("cs-CZ")}
        </p>
      )}
    </article>
  );
}

export function AlertCenterView() {
  const ready = useIsClient();
  const { rates } = useCurrentRates();
  const [store, setStore] = useState(() =>
    ready ? loadAlertCenterStore() : null
  );
  const [tab, setTab] = useState<"immediate" | "digest" | "all">("immediate");

  useEffect(() => {
    if (ready) setStore(loadAlertCenterStore());
  }, [ready]);

  const dashboard = useMemo(() => {
    if (!store) return null;
    return buildAlertCenterDashboard({
      store,
      rates,
      collectContext: { previousRatePercent: 5.14 },
    });
  }, [store, rates]);

  const persist = useCallback((next: NonNullable<typeof store>) => {
    saveAlertCenterStore(next);
    setStore(next);
  }, []);

  const setDelivery = useCallback(
    (type: AlertType, pref: AlertDeliveryPreference) => {
      if (!store) return;
      persist(setTypeDeliveryPreference(store, type, pref));
    },
    [persist, store]
  );

  const setChannel = useCallback(
    (channel: "email" | "push", enabled: boolean) => {
      if (!store) return;
      persist({
        ...store,
        preferences: {
          ...store.preferences,
          channels: { ...store.preferences.channels, [channel]: enabled },
        },
      });
    },
    [persist, store]
  );

  if (!ready || !store || !dashboard) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">
        Načítám Centrum upozornění…
      </div>
    );
  }

  const list =
    tab === "immediate"
      ? dashboard.immediateAlerts
      : tab === "digest"
        ? dashboard.digestAlerts
        : dashboard.alerts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <FeatureStatusBadge status={ALERT_CENTER_FEATURE_STATUS} />
          <h1 className="mt-2 font-heading text-3xl font-black">Centrum upozornění</h1>
          <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
            Upozornění na změny sazeb, blížící se konec fixace, dokumenty a
            regulaci — stejnou změnu sloučíme do jednoho přehledného záznamu.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        {dashboard.dedupedCount > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Sloučeno {dashboard.dedupedCount} podobných upozornění.
          </p>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["immediate", `Okamžité (${dashboard.immediateAlerts.length})`],
              ["digest", `Souhrn (${dashboard.digestAlerts.length})`],
              ["all", `Vše (${dashboard.alerts.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === key ? "bg-deep-teal text-white" : "border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Alerts */}
        <section className="space-y-3">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pro zvolený režim zatím žádná upozornění — to neznamená, že je
              vše v pořádku; jen teď nemáme nový podnět nebo máte typ vypnutý.
            </p>
          ) : (
            list.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onDismiss={(id) => persist(dismissAlert(store, id))}
                onRead={(id) => persist(markAlertRead(store, id))}
              />
            ))
          )}
        </section>

        {/* Preferences */}
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Settings2 className="h-5 w-5" />
            Preference doručení
          </h2>
          <div className="mt-4 space-y-3">
            <label className="block text-xs">
              Výchozí režim
              <select
                value={store.preferences.defaultDelivery}
                onChange={(e) =>
                  persist({
                    ...store,
                    preferences: {
                      ...store.preferences,
                      defaultDelivery: e.target.value as AlertDeliveryPreference,
                    },
                  })
                }
                className="mt-1 w-full rounded border px-2 py-1"
              >
                {Object.entries(DELIVERY_PREFERENCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            {ALERT_TYPES.map((type) => (
              <label key={type} className="flex items-center justify-between text-xs">
                <span>{ALERT_TYPE_LABELS[type]}</span>
                <select
                  value={store.preferences.byType[type] ?? ""}
                  onChange={(e) =>
                    setDelivery(
                      type,
                      (e.target.value ||
                        store.preferences.defaultDelivery) as AlertDeliveryPreference
                    )
                  }
                  className="rounded border px-2 py-1"
                >
                  <option value="">Výchozí</option>
                  {Object.entries(DELIVERY_PREFERENCE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>

        {/* Channels */}
        <section className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Bell className="h-5 w-5" />
            Kanály upozornění
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{dashboard.consentNote}</p>
          <ul className="mt-4 space-y-3">
            {ALERT_CHANNELS.map((ch) => (
              <li
                key={ch.channel}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  {ch.channel === "in_app" && <Bell className="h-4 w-4" />}
                  {ch.channel === "email" && <Mail className="h-4 w-4" />}
                  {ch.channel === "push" && <Smartphone className="h-4 w-4" />}
                  <span className="font-semibold">
                    {ch.channel === "in_app"
                      ? "Na webu"
                      : ch.channel === "email"
                        ? "E-mail"
                        : "Push v prohlížeči"}
                  </span>
                  <FeatureStatusBadge status={ch.status} />
                </div>
                <p className="text-xs text-muted-foreground">{ch.description}</p>
                {ch.channel !== "in_app" && (
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={
                        ch.channel === "email"
                          ? store.preferences.channels.email
                          : store.preferences.channels.push
                      }
                      disabled={ch.status === "COMING_SOON"}
                      onChange={(e) =>
                        setChannel(
                          ch.channel as "email" | "push",
                          e.target.checked
                        )
                      }
                    />
                    Zapnout
                    {ch.consentRequired ? " (vyžaduje souhlas)" : ""}
                  </label>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5">
          <h3 className="mb-2 flex items-center gap-2 font-heading font-bold">
            <HelpCircle className="h-4 w-4" />
            Metodika
          </h3>
          <ul className="space-y-1">
            {dashboard.methodology.map((m) => (
              <li key={m} className="text-xs text-muted-foreground">
                · {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href={routes.refinanceRadar} className="text-deep-teal underline">
              Radar refinancování
            </Link>
            <Link href={routes.sledovani} className="text-deep-teal underline">
              Sledování
            </Link>
            <Link href={routes.documentVault} className="text-deep-teal underline">
              Dokumentový trezor
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
