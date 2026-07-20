"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bell,
  Building2,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  MAJETIO_WATCH_SYNC_STATUS,
  NOTIFY_CHANNELS,
  addFilterWatch,
  addPlaceWatch,
  addPropertyWatch,
  clearWatchAlerts,
  listWatchAlerts,
  listWatchTargets,
  loadWatchlistStore,
  recordPriceObservation,
  removeWatchTarget,
  runWatchlistEvaluation,
  updateWatchPreferences,
  type WatchTarget,
  type WatchTargetKind,
} from "@/lib/watchlist";
import {
  buildFinancialPassportDocument,
  loadFinancialProfile,
} from "@/lib/financial-passport";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

const KIND_LABEL: Record<WatchTargetKind, string> = {
  property: "Nemovitost",
  city: "Město",
  area: "Oblast",
  developer_project: "Projekt",
  property_type: "Typ",
  filter: "Filtr / pásmo",
};

export function SmartWatchlistView() {
  const ready = useIsClient();
  const { rates } = useCurrentRates();
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<"targets" | "alerts" | "add">("targets");
  const [evalMsg, setEvalMsg] = useState<string | null>(null);

  // Add forms
  const [propLabel, setPropLabel] = useState("");
  const [propPrice, setPropPrice] = useState("");
  const [propCity, setPropCity] = useState("");
  const [placeKind, setPlaceKind] = useState<
    "city" | "area" | "developer_project" | "property_type"
  >("city");
  const [placeLabel, setPlaceLabel] = useState("");
  const [filterLabel, setFilterLabel] = useState("");
  const [filterMax, setFilterMax] = useState("");
  const [filterMinYield, setFilterMinYield] = useState("");
  const [filterMaxM2, setFilterMaxM2] = useState("");
  const [filterMinScore, setFilterMinScore] = useState("");

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const targets = useMemo(() => {
    void tick;
    if (!ready) return [] as WatchTarget[];
    return listWatchTargets();
  }, [ready, tick]);

  const alerts = useMemo(() => {
    void tick;
    if (!ready) return [];
    return listWatchAlerts();
  }, [ready, tick]);

  const prefs = useMemo(() => {
    void tick;
    if (!ready) return null;
    return loadWatchlistStore().preferences;
  }, [ready, tick]);

  const runEval = () => {
    const profile = loadFinancialProfile();
    const rate =
      rates?.rateWithInsurance ?? rates?.rateWithoutInsurance ?? null;
    const doc = profile
      ? buildFinancialPassportDocument(profile, rate ?? 5)
      : null;
    const result = runWatchlistEvaluation({
      currentRatePercent: rate,
      doc,
    });
    setEvalMsg(
      result.accepted.length
        ? `Nové alerty: ${result.accepted.length} (kandidátů ${result.candidateCount}, odfiltrováno ${result.rejected.length}).`
        : `Žádné nové alerty (kandidátů ${result.candidateCount}, throttle odfiltroval ${result.rejected.length}). Nevymýšlíme data.`
    );
    refresh();
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-16">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        <p className="sr-only">Načítám sledované nemovitosti</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
            Součást Mého dashboardu
            {MAJETIO_WATCH_SYNC_STATUS === "COMING_SOON"
              ? " · synchronizace Majetio již brzy"
              : ""}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Sledované nemovitosti
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Sledujte nemovitost, město, oblast, projekt, typ nebo cenové / výnosové
            filtry. Alerty jen z dostupných pozorování — podobné nabídky až po
            Majetio feedu.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runEval}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Přepočítat alerty
            </button>
            <Link
              href={routes.oMajetio}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
            >
              O Majetio
            </Link>
          </div>
          {evalMsg ? (
            <p className="mt-3 text-xs text-emerald-100/90">{evalMsg}</p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {(
            [
              ["targets", "Sledované"],
              ["alerts", `Alerty (${alerts.length})`],
              ["add", "Přidat"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold",
                tab === id
                  ? "bg-deep-teal text-white"
                  : "border border-border bg-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "targets" ? (
          <div className="mt-6 space-y-3">
            {targets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-[#f7f8f7] p-4">
                <p className="text-sm text-muted-foreground">
                  Zatím nic nesledujete. Přidejte nemovitost nebo filtr — nebo
                  uložte cenu ve Finančním AI průvodci.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTab("add")}
                    className="inline-flex h-10 items-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white"
                  >
                    Přidat sledování
                  </button>
                  <Link
                    href={routes.copilot}
                    className="inline-flex h-10 items-center rounded-lg border border-deep-teal/30 px-4 text-sm font-semibold text-deep-teal"
                  >
                    Otevřít Finanční AI průvodce
                  </Link>
                </div>
              </div>
            ) : (
              targets.map((t) => (
                <article
                  key={t.id}
                  className="rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        {KIND_LABEL[t.kind]}
                      </p>
                      <h2 className="font-heading text-lg font-bold">{t.label}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[t.city, t.area, t.propertyType, t.developerProject]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Odebrat"
                      onClick={() => {
                        removeWatchTarget(t.id);
                        refresh();
                      }}
                      className="rounded-full p-2 text-muted-foreground hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {t.kind === "property" ? (
                    <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Cena</p>
                        <p className="font-bold tabular-nums">{fmt(t.priceCzk)}</p>
                      </div>
                      {t.estimatedYieldPct != null ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Výnos</p>
                          <p className="font-bold">{t.estimatedYieldPct.toFixed(1)} %</p>
                        </div>
                      ) : null}
                      {t.listingPublishedAt ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Publikováno</p>
                          <p className="text-xs">
                            {new Date(t.listingPublishedAt).toLocaleDateString("cs-CZ")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Stáří inzerátu: neznámé (čeká na Majetio)
                        </p>
                      )}
                      <label className="ml-auto flex items-center gap-2 text-xs">
                        Nová cena
                        <input
                          className="h-8 w-28 rounded border border-border px-2"
                          inputMode="numeric"
                          placeholder="Kč"
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            const v = Number(
                              (e.target as HTMLInputElement).value.replace(/\s/g, "")
                            );
                            if (Number.isFinite(v) && v > 0) {
                              recordPriceObservation(t.id, v);
                              (e.target as HTMLInputElement).value = "";
                              refresh();
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : null}
                  {t.kind === "filter" ? (
                    <ul className="mt-2 text-sm text-muted-foreground">
                      {t.priceBandMax != null && (
                        <li>Max cena: {fmt(t.priceBandMax)}</li>
                      )}
                      {t.minYieldPct != null && (
                        <li>Min výnos: {t.minYieldPct} %</li>
                      )}
                      {t.maxPricePerM2 != null && (
                        <li>Max Kč/m²: {t.maxPricePerM2.toLocaleString("cs-CZ")}</li>
                      )}
                      {t.minScore != null && <li>Min skóre: {t.minScore}</li>}
                    </ul>
                  ) : null}
                  {t.majetioUrl ? (
                    <a
                      href={t.majetioUrl}
                      className="mt-2 inline-block text-xs font-semibold text-deep-teal underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Majetio
                    </a>
                  ) : null}
                </article>
              ))
            )}
          </div>
        ) : null}

        {tab === "alerts" ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Throttle: max {prefs?.maxAlertsPerDay ?? 5}/den · cooldown{" "}
                {prefs?.minHoursBetweenSameKind ?? 48} h
              </p>
              <button
                type="button"
                className="text-xs underline"
                onClick={() => {
                  clearWatchAlerts();
                  refresh();
                }}
              >
                Vymazat alerty
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(prefs?.digestOnly)}
                onChange={(e) => {
                  updateWatchPreferences({ digestOnly: e.target.checked });
                  refresh();
                }}
              />
              Jen digest (bez okamžitých in-app alertů)
            </label>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Žádné alerty. Spusťte přepočet po změně ceny / sazby.
              </p>
            ) : (
              <ul className="space-y-3">
                {alerts.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-border bg-white p-4 text-sm shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <Bell className="mt-0.5 h-4 w-4 text-muted-gold" />
                      <div>
                        <p className="font-semibold text-text-dark">{a.title}</p>
                        <p className="mt-1 text-muted-foreground">{a.body}</p>
                        <p className="mt-2 text-[10px] font-bold uppercase text-deep-teal">
                          {a.claimKind} · {a.kind} · {a.severity}
                        </p>
                        {a.href ? (
                          <Link
                            href={a.href}
                            className="mt-1 inline-block text-xs text-deep-teal underline"
                          >
                            Detail
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <section className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-text-dark">Upozornění v aplikaci / e-mail</p>
              <p className="mt-1">
                V aplikaci:{" "}
                {NOTIFY_CHANNELS.in_app.status === "LIVE"
                  ? "dostupné"
                  : NOTIFY_CHANNELS.in_app.status === "BETA"
                    ? "beta"
                    : "připravujeme"}
                . E-mail:{" "}
                {NOTIFY_CHANNELS.email.status === "LIVE"
                  ? "dostupné"
                  : "připravujeme"}
                . Push v prohlížeči:{" "}
                {NOTIFY_CHANNELS.web_push.status === "LIVE"
                  ? "dostupné"
                  : "připravujeme"}
                . Nic neodesíláme bez vašeho souhlasu.
              </p>
            </section>
          </div>
        ) : null}

        {tab === "add" ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <form
              className="space-y-3 rounded-2xl border border-border bg-white p-4"
              onSubmit={(e) => {
                e.preventDefault();
                const price = Number(propPrice.replace(/\s/g, ""));
                if (!propLabel.trim() || !Number.isFinite(price) || price < 100_000)
                  return;
                addPropertyWatch({
                  label: propLabel.trim(),
                  priceCzk: Math.round(price),
                  city: propCity.trim() || undefined,
                });
                setPropLabel("");
                setPropPrice("");
                setPropCity("");
                setTab("targets");
                refresh();
              }}
            >
              <p className="flex items-center gap-2 font-semibold">
                <Building2 className="h-4 w-4" /> Konkrétní nemovitost
              </p>
              <input
                className="h-10 w-full rounded-lg border px-3 text-sm"
                placeholder="Název"
                value={propLabel}
                onChange={(e) => setPropLabel(e.target.value)}
                required
              />
              <input
                className="h-10 w-full rounded-lg border px-3 text-sm"
                placeholder="Cena Kč"
                value={propPrice}
                onChange={(e) => setPropPrice(e.target.value)}
                required
              />
              <input
                className="h-10 w-full rounded-lg border px-3 text-sm"
                placeholder="Město (volitelné)"
                value={propCity}
                onChange={(e) => setPropCity(e.target.value)}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" /> Přidat
              </button>
            </form>

            <form
              className="space-y-3 rounded-2xl border border-border bg-white p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!placeLabel.trim()) return;
                addPlaceWatch({ kind: placeKind, label: placeLabel.trim() });
                setPlaceLabel("");
                setTab("targets");
                refresh();
              }}
            >
              <p className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4" /> Město / oblast / projekt / typ
              </p>
              <select
                className="h-10 w-full rounded-lg border px-3 text-sm"
                value={placeKind}
                onChange={(e) =>
                  setPlaceKind(e.target.value as typeof placeKind)
                }
              >
                <option value="city">Město</option>
                <option value="area">Oblast</option>
                <option value="developer_project">Developerský projekt</option>
                <option value="property_type">Typ nemovitosti</option>
              </select>
              <input
                className="h-10 w-full rounded-lg border px-3 text-sm"
                placeholder="Název"
                value={placeLabel}
                onChange={(e) => setPlaceLabel(e.target.value)}
                required
              />
              <button
                type="submit"
                className="rounded-full bg-deep-teal px-4 py-2 text-sm font-bold text-white"
              >
                Přidat
              </button>
            </form>

            <form
              className="space-y-3 rounded-2xl border border-border bg-white p-4 md:col-span-2"
              onSubmit={(e) => {
                e.preventDefault();
                addFilterWatch({
                  label: filterLabel.trim() || "Uložený filtr",
                  priceBandMax: filterMax
                    ? Number(filterMax.replace(/\s/g, ""))
                    : undefined,
                  minYieldPct: filterMinYield
                    ? Number(filterMinYield.replace(",", "."))
                    : undefined,
                  maxPricePerM2: filterMaxM2
                    ? Number(filterMaxM2.replace(/\s/g, ""))
                    : undefined,
                  minScore: filterMinScore
                    ? Number(filterMinScore)
                    : undefined,
                });
                setFilterLabel("");
                setFilterMax("");
                setFilterMinYield("");
                setFilterMaxM2("");
                setFilterMinScore("");
                setTab("targets");
                refresh();
              }}
            >
              <p className="flex items-center gap-2 font-semibold">
                <Filter className="h-4 w-4" /> Cenové pásmo / výnos / m² / skóre
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  className="h-10 rounded-lg border px-3 text-sm"
                  placeholder="Název filtru"
                  value={filterLabel}
                  onChange={(e) => setFilterLabel(e.target.value)}
                />
                <input
                  className="h-10 rounded-lg border px-3 text-sm"
                  placeholder="Max cena Kč"
                  value={filterMax}
                  onChange={(e) => setFilterMax(e.target.value)}
                />
                <input
                  className="h-10 rounded-lg border px-3 text-sm"
                  placeholder="Min výnos %"
                  value={filterMinYield}
                  onChange={(e) => setFilterMinYield(e.target.value)}
                />
                <input
                  className="h-10 rounded-lg border px-3 text-sm"
                  placeholder="Max Kč/m²"
                  value={filterMaxM2}
                  onChange={(e) => setFilterMaxM2(e.target.value)}
                />
                <input
                  className="h-10 rounded-lg border px-3 text-sm"
                  placeholder="Min. skóre"
                  value={filterMinScore}
                  onChange={(e) => setFilterMinScore(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Porovnání s nabídkami Majetio připravujeme — filtr se uloží
                lokálně už teď.
              </p>
              <button
                type="submit"
                className="rounded-full bg-deep-teal px-4 py-2 text-sm font-bold text-white"
              >
                Uložit filtr
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
