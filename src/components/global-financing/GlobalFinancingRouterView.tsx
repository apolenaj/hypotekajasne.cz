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
  AlertTriangle,
  ChevronRight,
  FileText,
  Globe,
  HelpCircle,
  RefreshCw,
  Shield,
  UserCheck,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { FinancingMap } from "@/components/global-financing/FinancingMap";
import { countryConfigs, countryOrder } from "@/lib/calculators";
import {
  buildGlobalFinancingMap,
  defaultRouterInput,
  DEMO_CZ_RESIDENT_SPAIN,
  GLOBAL_FINANCING_FEATURE_STATUS,
  loadGlobalFinancingStore,
  saveGlobalFinancingInput,
  type FinancingRouteCard,
  type GlobalFinancingRouterInput,
} from "@/lib/global-financing";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: currency === "CZK" ? "CZK" : currency === "EUR" ? "EUR" : "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

type FormState = {
  residency: GlobalFinancingRouterInput["residency"];
  nationality: GlobalFinancingRouterInput["nationality"];
  propertyCountry: GlobalFinancingRouterInput["propertyCountry"];
  purchasePrice: string;
  ownFunds: string;
  incomeCountry: string;
  collateral: GlobalFinancingRouterInput["collateral"];
  purpose: GlobalFinancingRouterInput["purpose"];
  termYears: string;
};

function inputToForm(i: GlobalFinancingRouterInput): FormState {
  return {
    residency: i.residency,
    nationality: i.nationality,
    propertyCountry: i.propertyCountry,
    purchasePrice: String(i.purchasePrice),
    ownFunds: String(i.ownFunds),
    incomeCountry: i.incomeCountry,
    collateral: i.collateral,
    purpose: i.purpose,
    termYears: String(i.termYears),
  };
}

function formToInput(f: FormState): GlobalFinancingRouterInput {
  return defaultRouterInput({
    residency: f.residency,
    nationality: f.nationality,
    propertyCountry: f.propertyCountry,
    purchasePrice: Number(f.purchasePrice) || 0,
    ownFunds: Number(f.ownFunds) || 0,
    incomeCountry:
      f.incomeCountry === "other"
        ? "other"
        : (f.incomeCountry as GlobalFinancingRouterInput["incomeCountry"]),
    collateral: f.collateral,
    purpose: f.purpose,
    termYears: Number(f.termYears) || 25,
  });
}

function RouteDetail({ route }: { route: FinancingRouteCard }) {
  const currency = route.currency;
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
            Route {route.routeLetter} · detail
          </p>
          <h3 className="mt-1 font-heading text-xl font-bold text-deep-teal">
            {route.label}
          </h3>
        </div>
        <ClaimBadge kind={route.claimKind} />
      </div>

      <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-foreground">
        {route.availabilityLabel}
      </p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase text-muted-foreground">
            Typická struktura
          </dt>
          <dd className="mt-1 text-sm">{route.typicalStructure}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-muted-foreground">
            Měna produktu
          </dt>
          <dd className="mt-1 text-sm font-medium">{currency}</dd>
        </div>
        {route.requiredEquityAmount != null && (
          <div>
            <dt className="text-xs font-semibold uppercase text-muted-foreground">
              Požadovaný vlastní kapitál
            </dt>
            <dd className="mt-1 text-sm">
              {route.requiredEquityPercent} % (
              {fmtMoney(route.requiredEquityAmount, currency)})
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-semibold uppercase text-muted-foreground">
            Partner
          </dt>
          <dd className="mt-1 text-sm">{route.partnerAvailability.label}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-muted-foreground">
            Čerstvost dat
          </dt>
          <dd className="mt-1 text-sm">
            {route.dataFreshness.asOf
              ? new Date(route.dataFreshness.asOf).toLocaleDateString("cs-CZ")
              : "—"}{" "}
            · {route.dataFreshness.source}
          </dd>
        </div>
        {route.calculationNote && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase text-muted-foreground">
              Simulace
            </dt>
            <dd className="mt-1 flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {route.calculationNote}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Shield className="h-4 w-4 text-deep-teal" />
            Hlavní rizika
          </h4>
          <ul className="mt-2 space-y-1">
            {route.mainRisks.map((r) => (
              <li key={r} className="text-xs text-muted-foreground">
                · {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="h-4 w-4 text-deep-teal" />
            Požadované dokumenty
          </h4>
          <ul className="mt-2 space-y-1">
            {route.requiredDocuments.map((d) => (
              <li key={d} className="text-xs text-muted-foreground">
                · {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function GlobalFinancingRouterView() {
  const ready = useIsClient();
  const [form, setForm] = useState<FormState>(inputToForm(DEMO_CZ_RESIDENT_SPAIN));
  const [input, setInput] = useState<GlobalFinancingRouterInput>(DEMO_CZ_RESIDENT_SPAIN);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const store = loadGlobalFinancingStore();
    if (store.input) {
      setInput(store.input);
      setForm(inputToForm(store.input));
    }
  }, [ready]);

  const map = useMemo(() => {
    if (!ready) return null;
    return buildGlobalFinancingMap(input);
  }, [ready, input]);

  const selectedRoute = useMemo(
    () => map?.routes.find((r) => r.routeId === selectedRouteId) ?? map?.routes[0] ?? null,
    [map, selectedRouteId]
  );

  const handleCalculate = useCallback(() => {
    const next = formToInput(form);
    setInput(next);
    saveGlobalFinancingInput(next);
    setSelectedRouteId(null);
    setEditing(false);
  }, [form]);

  const loadDemo = useCallback(() => {
    setForm(inputToForm(DEMO_CZ_RESIDENT_SPAIN));
    setInput(DEMO_CZ_RESIDENT_SPAIN);
    saveGlobalFinancingInput(DEMO_CZ_RESIDENT_SPAIN);
    setSelectedRouteId(null);
  }, []);

  if (!ready || !map) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám Global Financing Router…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-gold">
              Global Financing Router
            </p>
            <FeatureStatusBadge status={GLOBAL_FINANCING_FEATURE_STATUS} />
          </div>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Global Financing Router
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50/90">
            Zadejte profil — router zobrazí možné cesty financování. Nejedna
            doporučená hypotéka, ale mapa možností s riziky, dokumenty a
            partnery.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              {editing ? "Skrýt formulář" : "Upravit profil"}
            </button>
            <button
              type="button"
              onClick={loadDemo}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
            >
              Demo: CZ rezident → Španělsko
            </button>
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex items-center gap-2 rounded-full bg-muted-gold/90 px-4 py-2 text-sm font-semibold text-deep-teal"
            >
              <UserCheck className="h-4 w-4" />
              Ověřit u specialisty
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {editing && (
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-bold text-deep-teal">
              Profil financování
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Rezidence
                </label>
                <select
                  value={form.residency}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      residency: e.target.value as FormState["residency"],
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <option value="cz_resident">Rezident ČR</option>
                  <option value="eu_resident">Rezident EU (mimo ČR)</option>
                  <option value="non_eu_resident">Nerezident mimo EU</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Státní příslušnost (kde právně relevantní)
                </label>
                <select
                  value={form.nationality}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      nationality: e.target.value as FormState["nationality"],
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <option value="cz">ČR</option>
                  <option value="eu">EU</option>
                  <option value="other">Jiná</option>
                  <option value="not_applicable">Neuplatňuje se</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Země nemovitosti
                </label>
                <select
                  value={form.propertyCountry}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      propertyCountry: e.target.value as FormState["propertyCountry"],
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {countryOrder.map((id) => (
                    <option key={id} value={id}>
                      {countryConfigs[id].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Kupní cena
                </label>
                <input
                  type="number"
                  value={form.purchasePrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, purchasePrice: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Vlastní zdroje
                </label>
                <input
                  type="number"
                  value={form.ownFunds}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ownFunds: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Země příjmu
                </label>
                <select
                  value={form.incomeCountry}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, incomeCountry: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {countryOrder.map((id) => (
                    <option key={id} value={id}>
                      {countryConfigs[id].label}
                    </option>
                  ))}
                  <option value="other">Jiná</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Existující zástava
                </label>
                <select
                  value={form.collateral}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      collateral: e.target.value as FormState["collateral"],
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <option value="none">Žádná</option>
                  <option value="cz_property">Nemovitost v ČR</option>
                  <option value="foreign_property">Nemovitost v zahraničí</option>
                  <option value="other">Jiná</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Účel
                </label>
                <select
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      purpose: e.target.value as FormState["purpose"],
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <option value="investment">Investice</option>
                  <option value="own_use">Vlastní bydlení</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCalculate}
              className="mt-5 rounded-full bg-deep-teal px-6 py-2 text-sm font-semibold text-white"
            >
              Zobrazit Financing Map
            </button>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 font-heading text-xl font-bold text-deep-teal">
            <Globe className="h-5 w-5" />
            Financing Map
          </h2>
          <p className="mb-6 text-xs text-muted-foreground">
            {map.originLabel} → {map.destinationLabel} ·{" "}
            {map.routes.length} možných cest · bez jediného doporučení
          </p>
          <FinancingMap
            originLabel={map.originLabel}
            destinationLabel={map.destinationLabel}
            nodes={map.nodes}
            edges={map.edges}
            routes={map.routes}
            selectedRouteId={selectedRoute?.routeId ?? null}
            onRouteSelect={(r) => setSelectedRouteId(r.routeId)}
          />
        </section>

        {selectedRoute && <RouteDetail route={selectedRoute} />}

        <section className="rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold">
            <HelpCircle className="h-4 w-4" />
            Metodika
          </h3>
          <ul className="space-y-1">
            {map.methodology.map((m) => (
              <li key={m} className="text-xs text-muted-foreground">
                · {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
        </section>

        <section className="rounded-2xl bg-deep-teal p-8 text-center text-white">
          <h2 className="font-heading text-2xl font-black">
            Nechat možnosti ověřit specialistou
          </h2>
          <p className="mt-2 text-sm text-emerald-50/90">
            Router zobrazuje cesty z ověřených dat — ne individuální bankovní
            nabídku. Partner bez integrace = individuální konzultace.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex items-center gap-2 rounded-full bg-muted-gold px-6 py-3 font-semibold text-deep-teal"
            >
              Návrh na míru
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href={routes.kalkulacky.root}
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold"
            >
              Hypoteční kalkulačka
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
