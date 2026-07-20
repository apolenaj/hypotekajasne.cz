"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileDown,
  GitCompare,
  Link2,
  Plus,
  Scale,
  Trash2,
  Trophy,
} from "lucide-react";
import { ComparisonRadarChart } from "@/components/property-compare/ComparisonRadarChart";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import {
  buildPropertyComparison,
  buildShareableComparisonUrl,
  decodeComparisonLink,
  DEMO_COMPARE_PROPERTIES,
  encodeComparisonLink,
  fmtCzk,
  fmtPct,
  MAX_PROPERTIES,
  MIN_PROPERTIES,
  newCompareProperty,
  type ComparePropertyInput,
  type ComparePropertyMetrics,
  type ClaimedMetric,
} from "@/lib/property-compare";
import {
  buildFinancialPassportDocument,
  loadFinancialProfile,
} from "@/lib/financial-passport";
import { loadCopilotProperties } from "@/lib/copilot/context";
import { listWatchTargets } from "@/lib/watchlist";
import { useCurrentRates } from "@/lib/rates";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function MetricCell<T extends number | string | null>({
  metric,
  format,
}: {
  metric: ClaimedMetric<T>;
  format: (v: T) => string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="font-semibold tabular-nums text-text-dark">
        {format(metric.value)}
      </p>
      <ClaimBadge kind={metric.kind} />
    </div>
  );
}

const METRIC_ROWS: {
  label: string;
  get: (m: ComparePropertyMetrics) => ClaimedMetric<number | string | null>;
  format: (v: number | string | null) => string;
}[] = [
  {
    label: "Kupní cena",
    get: (m) => m.purchasePrice,
    format: (v) => fmtCzk(v as number),
  },
  {
    label: "Cena/m²",
    get: (m) => m.pricePerM2,
    format: (v) =>
      v != null ? `${Number(v).toLocaleString("cs-CZ")} Kč/m²` : "—",
  },
  {
    label: "Odhadovaná férová hodnota",
    get: (m) => m.estimatedFairValue,
    format: (v) => fmtCzk(v as number | null),
  },
  {
    label: "Sleva / prémie",
    get: (m) => m.discountPremiumPct,
    format: (v) =>
      v != null ? `${((v as number) * 100).toFixed(1).replace(".", ",")} %` : "—",
  },
  {
    label: "Hrubý výnos",
    get: (m) => m.grossYieldPct,
    format: (v) => fmtPct(v as number | null),
  },
  {
    label: "Čistý výnos",
    get: (m) => m.netYieldPct,
    format: (v) => fmtPct(v as number | null),
  },
  {
    label: "Peněžní tok (měs.)",
    get: (m) => m.monthlyCashFlow,
    format: (v) => fmtCzk(v as number | null),
  },
  {
    label: "IRR (základní, 7 let)",
    get: (m) => m.irrPct,
    format: (v) => fmtPct(v as number | null),
  },
  {
    label: "Potřebná hotovost",
    get: (m) => m.requiredCash,
    format: (v) => fmtCzk(v as number),
  },
  {
    label: "Splátka hypotéky",
    get: (m) => m.mortgagePayment,
    format: (v) => fmtCzk(v as number | null),
  },
  {
    label: "DSCR",
    get: (m) => m.dscr,
    format: (v) =>
      v != null ? (v as number).toFixed(2).replace(".", ",") : "—",
  },
  {
    label: "Likvidita",
    get: (m) => m.liquidityScore,
    format: (v) => `${v}/100`,
  },
  {
    label: "Poptávka po nájmu",
    get: (m) => m.rentalDemandScore,
    format: (v) => `${v}/100`,
  },
  {
    label: "Skóre lokality",
    get: (m) => m.locationScore,
    format: (v) => `${v}/100`,
  },
  {
    label: "Skóre rizika",
    get: (m) => m.riskScore,
    format: (v) => `${v}/100`,
  },
  {
    label: "Úplnost právních/datových podkladů",
    get: (m) => m.dataCompleteness,
    format: (v) => `${v} %`,
  },
  {
    label: "Potřeba renovace",
    get: (m) => m.renovationNeed,
    format: (v) => String(v),
  },
  {
    label: "Fit dostupnosti",
    get: (m) => ({
      value: m.affordability?.verdict ?? "—",
      kind: m.affordability?.claimKind ?? "NEOVERENO",
      note: m.affordability?.summary,
    }),
    format: (v) =>
      String(v)
        .replace(/_/g, " ")
        .replace("within safe budget", "ve bezpečném rozpočtu")
        .replace("within max estimate", "v max. odhadu")
        .replace("above budget", "nad rozpočtem")
        .replace("insufficient data", "bez Finančního pasu"),
  },
];

export function PropertyCompareView() {
  const ready = useIsClient();
  const searchParams = useSearchParams();
  const { rates } = useCurrentRates();
  const [properties, setProperties] = useState<ComparePropertyInput[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const modelRate =
    rates?.rateWithInsurance ?? rates?.rateWithoutInsurance ?? 5.2;

  const initFromUrl = useCallback(() => {
    const c = searchParams.get("c");
    if (c) {
      const decoded = decodeComparisonLink(c);
      if (decoded) return decoded;
    }
    return DEMO_COMPARE_PROPERTIES;
  }, [searchParams]);

  useEffect(() => {
    if (!ready || initialized) return;
    setProperties(initFromUrl());
    setInitialized(true);
  }, [ready, initialized, initFromUrl]);

  const comparison = useMemo(() => {
    if (!ready || properties.length < MIN_PROPERTIES) return null;
    const profile = loadFinancialProfile();
    const doc = profile
      ? buildFinancialPassportDocument(profile, modelRate)
      : null;
    return buildPropertyComparison({
      properties,
      modelRatePercent: modelRate,
      doc,
    });
  }, [ready, properties, modelRate]);

  const updateProperty = (id: string, patch: Partial<ComparePropertyInput>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const removeProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setEditingId(null);
  };

  const addProperty = () => {
    if (properties.length >= MAX_PROPERTIES) return;
    const p = newCompareProperty();
    setProperties((prev) => [...prev, p]);
    setEditingId(p.id);
  };

  const loadFromWatchlist = () => {
    const targets = listWatchTargets()
      .filter((t) => t.kind === "property" && t.priceCzk != null)
      .slice(0, MAX_PROPERTIES);
    if (targets.length < MIN_PROPERTIES) return;
    setProperties(
      targets.map((t) =>
        newCompareProperty({
          id: t.id,
          label: t.label,
          city: t.city ?? "Praha",
          priceCzk: t.priceCzk!,
          areaM2: t.pricePerM2 && t.priceCzk ? Math.round(t.priceCzk / t.pricePerM2) : 55,
          listingUrl: t.majetioUrl ?? undefined,
        })
      )
    );
  };

  const loadFromCopilot = () => {
    const drafts = loadCopilotProperties().slice(0, MAX_PROPERTIES);
    if (drafts.length < MIN_PROPERTIES) return;
    setProperties(
      drafts.map((d) =>
        newCompareProperty({
          id: d.id,
          label: d.label,
          priceCzk: d.priceCzk,
          city: d.locationHint ?? "Praha",
        })
      )
    );
  };

  const onShareLink = async () => {
    const code = encodeComparisonLink(properties);
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${routes.investicniRentgenPorovnani}?c=${code}`
        : buildShareableComparisonUrl(properties);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const onPrintPdf = () => {
    window.print();
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám porovnání…
      </div>
    );
  }

  return (
    <div className="property-compare-print min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white print:bg-white print:text-black">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold print:text-stone-600">
            Investiční rentgen · Profesionální porovnání
          </p>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Porovnání nemovitostí (2–5)
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50/90 print:text-stone-700">
            Číselné výsledky nejprve — výnos, peněžní tok, IRR, DSCR, fit k profilu.
            Žádné absolutní „nejlepší“ bez kompromisů. Radar jen jako doplněk.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={onShareLink}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
            >
              <Link2 className="h-4 w-4" />
              {copied ? "Odkaz zkopírován" : "Odkaz ke sdílení"}
            </button>
            <button
              type="button"
              onClick={onPrintPdf}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
            >
              <FileDown className="h-4 w-4" />
              PDF report (tisk)
            </button>
            <Link
              href={routes.financniPas}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold"
            >
              Finanční pas
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Property slots */}
        <section className="print:hidden">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
              <GitCompare className="h-5 w-5 text-deep-teal" />
              Nemovitosti v porovnání
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadFromWatchlist}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
              >
                Ze seznamu sledování
              </button>
              <button
                type="button"
                onClick={loadFromCopilot}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
              >
                Z Copilotu
              </button>
              <button
                type="button"
                onClick={() => setProperties(DEMO_COMPARE_PROPERTIES)}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
              >
                Demo A / B
              </button>
              {properties.length < MAX_PROPERTIES ? (
                <button
                  type="button"
                  onClick={addProperty}
                  className="inline-flex items-center gap-1 rounded-lg bg-deep-teal px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Přidat
                </button>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <article
                key={p.id}
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <input
                    className="w-full font-semibold outline-none"
                    value={p.label}
                    onChange={(e) =>
                      updateProperty(p.id, { label: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    aria-label="Odebrat"
                    onClick={() => removeProperty(p.id)}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <label>
                    Město
                    <input
                      className="mt-0.5 h-8 w-full rounded border px-2"
                      value={p.city}
                      onChange={(e) =>
                        updateProperty(p.id, { city: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Typ
                    <select
                      className="mt-0.5 h-8 w-full rounded border px-1"
                      value={p.propertyType}
                      onChange={(e) =>
                        updateProperty(p.id, {
                          propertyType: e.target
                            .value as ComparePropertyInput["propertyType"],
                        })
                      }
                    >
                      <option value="Byt">Byt</option>
                      <option value="Dům">Dům</option>
                      <option value="Komerce">Komerce</option>
                    </select>
                  </label>
                  <label>
                    Cena Kč
                    <input
                      className="mt-0.5 h-8 w-full rounded border px-2 tabular-nums"
                      inputMode="numeric"
                      value={p.priceCzk || ""}
                      onChange={(e) =>
                        updateProperty(p.id, {
                          priceCzk: Number(e.target.value.replace(/\s/g, "")) || 0,
                        })
                      }
                    />
                  </label>
                  <label>
                    m²
                    <input
                      className="mt-0.5 h-8 w-full rounded border px-2"
                      inputMode="numeric"
                      value={p.areaM2 || ""}
                      onChange={(e) =>
                        updateProperty(p.id, {
                          areaM2: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </label>
                  <label>
                    Nájem/měs.
                    <input
                      className="mt-0.5 h-8 w-full rounded border px-2"
                      placeholder="MODEL"
                      value={p.rentMonthlyCzk ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\s/g, "");
                        updateProperty(p.id, {
                          rentMonthlyCzk: v ? Number(v) : null,
                        });
                      }}
                    />
                  </label>
                  <label>
                    Renovace
                    <select
                      className="mt-0.5 h-8 w-full rounded border px-1"
                      value={p.renovationNeed}
                      onChange={(e) =>
                        updateProperty(p.id, {
                          renovationNeed: e.target
                            .value as ComparePropertyInput["renovationNeed"],
                        })
                      }
                    >
                      <option value="unknown">Neuvedeno</option>
                      <option value="none">Bez</option>
                      <option value="light">Lehká</option>
                      <option value="major">Větší</option>
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  className="mt-2 text-[11px] text-deep-teal underline"
                  onClick={() =>
                    setEditingId(editingId === p.id ? null : p.id)
                  }
                >
                  {editingId === p.id ? "Skrýt vlastní kapitál" : "Vlastní kapitál / sazba"}
                </button>
                {editingId === p.id ? (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <label>
                      Vlastní kapitál
                      <input
                        className="mt-0.5 h-8 w-full rounded border px-2"
                        placeholder="20 % MODEL"
                        value={p.equityCzk ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\s/g, "");
                          updateProperty(p.id, {
                            equityCzk: v ? Number(v) : null,
                          });
                        }}
                      />
                    </label>
                    <label>
                      Sazba %
                      <input
                        className="mt-0.5 h-8 w-full rounded border px-2"
                        placeholder={String(modelRate)}
                        value={p.ratePercent ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(",", ".");
                          updateProperty(p.id, {
                            ratePercent: v ? Number(v) : null,
                          });
                        }}
                      />
                    </label>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {properties.length < MIN_PROPERTIES ? (
          <p className="text-sm text-muted-foreground">
            Přidejte alespoň {MIN_PROPERTIES} nemovitosti pro porovnání.
          </p>
        ) : null}

        {comparison && comparison.properties.length >= MIN_PROPERTIES ? (
          <>
            {/* Profile recommendation */}
            <section className="rounded-2xl border-2 border-muted-gold/40 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl font-black text-deep-teal">
                {comparison.profileRecommendation.headline}
              </h2>
              <p className="mt-2 text-sm text-text-dark">
                {comparison.profileRecommendation.explanation}
              </p>
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
                <Scale className="mr-1 inline h-3.5 w-3.5" />
                {comparison.profileRecommendation.notAbsoluteBest}
              </p>
              {comparison.profileRecommendation.weightsUsed.length > 0 ? (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Váhy profilu:{" "}
                  {comparison.profileRecommendation.weightsUsed.join(" · ")}
                </p>
              ) : null}
            </section>

            {/* Category winners */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
                <Trophy className="h-5 w-5 text-muted-gold" />
                Vítěz podle kategorie
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {comparison.categoryWinners.map((w) => (
                  <div
                    key={w.category}
                    className="rounded-xl border border-border bg-white p-4"
                  >
                    <p className="text-[10px] font-bold uppercase text-deep-teal">
                      {w.title}
                    </p>
                    <p className="mt-1 font-heading text-lg font-bold">
                      {w.propertyLabel}
                    </p>
                    <p className="text-sm font-semibold text-muted-gold">
                      {w.valueDisplay}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {w.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trade-offs */}
            <section>
              <h2 className="mb-3 font-heading text-lg font-bold">Kompromisy</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {comparison.profileRecommendation.tradeoffs.map((t) => (
                  <article
                    key={t.propertyId}
                    className="rounded-xl border border-border bg-white p-4 text-sm"
                  >
                    <h3 className="font-bold text-deep-teal">{t.label}</h3>
                    <p className="mt-2">
                      <span className="font-semibold text-emerald-800">+</span>{" "}
                      {t.pros.join(" · ")}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-amber-900">−</span>{" "}
                      {t.cons.join(" · ")}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground italic">
                Příklad: Nemovitost A může mít vyšší peněžní tok a nižší růstový
                potenciál; Nemovitost B nižší peněžní tok, ale lepší lokalitu a
                likviditu — záleží na vašem cíli.
              </p>
            </section>

            {/* Main metrics table */}
            <section>
              <h2 className="mb-3 font-heading text-lg font-bold">
                Číselné srovnání
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[#f7f8f7]">
                      <th className="px-3 py-2 font-semibold">Metrika</th>
                      {comparison.properties.map((p) => (
                        <th
                          key={p.id}
                          className="px-3 py-2 font-semibold text-deep-teal"
                        >
                          {p.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {METRIC_ROWS.map((row) => (
                      <tr key={row.label} className="border-b border-border/70">
                        <td className="px-3 py-2 font-medium">{row.label}</td>
                        {comparison.properties.map((p) => (
                          <td key={p.id} className="px-3 py-2 align-top">
                            <MetricCell
                              metric={row.get(p)}
                              format={row.format}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Exit scenarios */}
            <section>
              <h2 className="mb-3 font-heading text-lg font-bold">
                Scénáře výstupu (Pesimistický / Základní / Optimistický)
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b bg-[#f7f8f7]">
                      <th className="px-3 py-2 text-left">Nemovitost</th>
                      <th className="px-3 py-2">Pesimistický IRR</th>
                      <th className="px-3 py-2">Základní IRR</th>
                      <th className="px-3 py-2">Optimistický IRR</th>
                      <th className="px-3 py-2">Výnos z prodeje (základní)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.properties.map((p) => {
                      const bear = p.exitScenarios.find(
                        (e) => e.scenario === "bear"
                      );
                      const base = p.exitScenarios.find(
                        (e) => e.scenario === "base"
                      );
                      const bull = p.exitScenarios.find(
                        (e) => e.scenario === "bull"
                      );
                      return (
                        <tr key={p.id} className="border-b border-border/70">
                          <td className="px-3 py-2 font-medium">{p.label}</td>
                          <td className="px-3 py-2 text-center tabular-nums">
                            {fmtPct(bear?.irrPct ?? null)}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums">
                            {fmtPct(base?.irrPct ?? null)}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums">
                            {fmtPct(bull?.irrPct ?? null)}
                          </td>
                          <td className="px-3 py-2 text-center tabular-nums">
                            {fmtCzk(base?.exitProceedsCzk ?? null)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="print:hidden">
              <ComparisonRadarChart properties={comparison.properties} />
            </div>

            <ClaimLegend />
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground print:break-inside-avoid">
              {comparison.methodology.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
