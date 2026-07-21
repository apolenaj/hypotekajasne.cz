"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import {
  buildOfferStrategyModel,
  defaultOfferStrategyInput,
  DEMO_OFFER_INPUT,
  DEMO_PROPERTY_LABEL,
  formatOfferCzk,
  formatOfferPct,
  investmentSnapshot,
  OFFER_STRATEGY_FEATURE_STATUS,
  type OfferStrategyInput,
  type PropertyCondition,
  type UserUrgency,
} from "@/lib/offer-strategy";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

type FormState = {
  askingPriceCzk: string;
  fairValueLowCzk: string;
  fairValueHighCzk: string;
  daysOnMarket: string;
  rentMonthlyCzk: string;
  targetNetYield: string;
  condition: PropertyCondition;
  urgency: UserUrgency;
  competitionVerified: boolean;
  competitionNote: string;
  propertyLabel: string;
};

function inputToForm(i: OfferStrategyInput, label: string): FormState {
  return {
    askingPriceCzk: String(i.askingPriceCzk),
    fairValueLowCzk: String(i.fairValueLowCzk),
    fairValueHighCzk: String(i.fairValueHighCzk),
    daysOnMarket: i.daysOnMarket != null ? String(i.daysOnMarket) : "",
    rentMonthlyCzk: String(i.rentMonthlyCzk),
    targetNetYield: i.targetNetYield != null ? String(i.targetNetYield * 100) : "",
    condition: i.condition,
    urgency: i.urgency,
    competitionVerified: i.competition.verified,
    competitionNote: i.competition.note ?? "",
    propertyLabel: label,
  };
}

function formToInput(f: FormState): OfferStrategyInput {
  return defaultOfferStrategyInput({
    askingPriceCzk: Number(f.askingPriceCzk) || 0,
    fairValueLowCzk: Number(f.fairValueLowCzk) || 0,
    fairValueHighCzk: Number(f.fairValueHighCzk) || 0,
    daysOnMarket: f.daysOnMarket ? Number(f.daysOnMarket) : null,
    rentMonthlyCzk: Number(f.rentMonthlyCzk) || 0,
    targetNetYield: f.targetNetYield ? Number(f.targetNetYield) / 100 : null,
    condition: f.condition,
    urgency: f.urgency,
    competition: {
      verified: f.competitionVerified,
      note: f.competitionNote || null,
      claimKind: f.competitionVerified ? "ODHAD" : "NEOVERENO",
    },
    comparables: DEMO_OFFER_INPUT.comparables,
    priceHistory: DEMO_OFFER_INPUT.priceHistory,
  });
}

export function OfferStrategyView() {
  const ready = useIsClient();
  const [form, setForm] = useState<FormState>(
    inputToForm(DEMO_OFFER_INPUT, DEMO_PROPERTY_LABEL)
  );
  const [sliderPrice, setSliderPrice] = useState<number | null>(null);

  const input = useMemo(() => formToInput(form), [form]);

  const model = useMemo(() => {
    if (!ready) return null;
    return buildOfferStrategyModel(input, form.propertyLabel);
  }, [ready, input, form.propertyLabel]);

  const sliderSnap = useMemo(() => {
    if (!model) return null;
    const price =
      sliderPrice ?? model.output.targetPriceCzk;
    return investmentSnapshot(input, price);
  }, [input, model, sliderPrice]);

  const loadDemo = useCallback(() => {
    setForm(inputToForm(DEMO_OFFER_INPUT, DEMO_PROPERTY_LABEL));
    setSliderPrice(null);
  }, []);

  if (!ready || !model || !sliderSnap) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám Asistenta strategie nabídky…
      </div>
    );
  }

  const { output, offerText } = model;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center gap-2">
            <FeatureStatusBadge status={OFFER_STRATEGY_FEATURE_STATUS} />
            <ClaimBadge kind="MODEL" />
          </div>
          <h1 className="mt-2 font-heading text-3xl font-black">
            Asistent strategie nabídky
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            MODEL strategie nabídky — ne garantovaná valuace. Bez manipulace a
            falešných protinabídek.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {/* Form */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-lg font-bold text-deep-teal">
            Vstupy
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { k: "propertyLabel" as const, l: "Nemovitost", type: "text" },
                { k: "askingPriceCzk" as const, l: "Nabídková cena (Kč)", type: "number" },
                { k: "fairValueLowCzk" as const, l: "Odhadovaná férová hodnota min (MODEL)", type: "number" },
                { k: "fairValueHighCzk" as const, l: "Odhadovaná férová hodnota max (MODEL)", type: "number" },
                { k: "daysOnMarket" as const, l: "Dní na trhu", type: "number" },
                { k: "rentMonthlyCzk" as const, l: "Nájem/měs. (MODEL)", type: "number" },
                { k: "targetNetYield" as const, l: "Cíl čistého výnosu (%)", type: "number" },
              ] as const
            ).map(({ k, l, type }) => (
              <div key={k}>
                <label className="mb-1 block text-xs text-muted-foreground">{l}</label>
                <input
                  type={type}
                  value={form[k]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [k]: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Stav</label>
              <select
                value={form.condition}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    condition: e.target.value as PropertyCondition,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="good">Dobrý</option>
                <option value="average">Průměrný</option>
                <option value="needs_work">Vyžaduje investici</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Urgence</label>
              <select
                value={form.urgency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    urgency: e.target.value as UserUrgency,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="low">Nízká</option>
                <option value="medium">Střední</option>
                <option value="high">Vysoká</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.competitionVerified}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, competitionVerified: e.target.checked }))
                  }
                />
                Konkurence ověřena (jinak se nepromítá)
              </label>
              {form.competitionVerified && (
                <input
                  value={form.competitionNote}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, competitionNote: e.target.value }))
                  }
                  placeholder="Popis ověřené konkurence"
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
                />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={loadDemo}
            className="mt-4 text-sm text-deep-teal underline"
          >
            Načíst demo (6,5M / 5,95–6,25M)
          </button>
        </section>

        {/* Output summary */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: "Nabídková cena", v: formatOfferCzk(input.askingPriceCzk) },
            {
              l: "Odhadované pásmo",
              v: `${formatOfferCzk(input.fairValueLowCzk)} – ${formatOfferCzk(input.fairValueHighCzk)}`,
            },
            { l: "Otevírací (MODEL)", v: formatOfferCzk(output.openingScenarioCzk) },
            { l: "Cílová (MODEL)", v: formatOfferCzk(output.targetPriceCzk) },
            {
              l: "Maximální investice (MODEL)",
              v: formatOfferCzk(output.maximumEconomicallySensibleCzk),
            },
            {
              l: "Vyjednávací rezerva",
              v: `${formatOfferCzk(output.negotiationMarginCzk)} (${output.negotiationMarginPercent} %)`,
            },
          ].map(({ l, v }) => (
            <div key={l} className="rounded-2xl border border-border bg-white p-4">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="mt-1 font-heading text-lg font-bold">{v}</p>
            </div>
          ))}
        </section>

        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mr-1 inline h-4 w-4" />
          {output.disclaimer}
        </p>

        {/* Scenario slider */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <label className="mb-4 block font-heading text-xl font-bold text-deep-teal">
            <span className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" aria-hidden />
              Pokud koupíte za…
            </span>
            <input
              type="range"
              min={model.sliderRange.minCzk}
              max={model.sliderRange.maxCzk}
              step={model.sliderRange.stepCzk}
              value={sliderPrice ?? output.targetPriceCzk}
              onChange={(e) => setSliderPrice(Number(e.target.value))}
              aria-label="Cílová kupní cena"
              aria-valuetext={formatOfferCzk(sliderPrice ?? output.targetPriceCzk)}
              className="w-full accent-deep-teal touch-manipulation"
            />
          </label>
          <p className="mt-2 text-center font-heading text-2xl font-black text-deep-teal break-words">
            {formatOfferCzk(sliderPrice ?? output.targetPriceCzk)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[
              { l: "Hrubý výnos", v: formatOfferPct(sliderSnap.grossYield) },
              { l: "Čistý výnos", v: formatOfferPct(sliderSnap.netYield) },
              { l: "Peněžní tok/měs.", v: formatOfferCzk(sliderSnap.monthlyCashFlowCzk) },
              {
                l: "IRR (MODEL)",
                v: sliderSnap.irr != null ? formatOfferPct(sliderSnap.irr) : "—",
              },
              { l: "Vlastní prostředky", v: formatOfferCzk(sliderSnap.ownFundsCzk) },
            ].map(({ l, v }) => (
              <div key={l} className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">{l}</p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key questions */}
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
            <Target className="h-5 w-5" />
            Klíčové otázky před nabídkou
          </h2>
          <ul className="space-y-2">
            {output.keyQuestions.map((q) => (
              <li key={q} className="text-sm text-muted-foreground">
                · {q}
              </li>
            ))}
          </ul>
        </section>

        {/* Offer text draft */}
        <section className="rounded-2xl border border-sky-200 bg-sky-50/50 p-6">
          <h2 className="font-heading text-lg font-bold text-sky-900">
            Návrh textu nabídky
          </h2>
          <p className="mt-1 text-xs text-sky-800">{offerText.ethicsNote}</p>
          <ClaimBadge kind={offerText.claimKind} className="mt-2" />
          <p className="mt-3 text-sm font-semibold">{offerText.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-sky-200 bg-white p-4 text-sm">
            {offerText.body}
          </pre>
        </section>

        <section className="rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-heading font-bold">
            <HelpCircle className="h-4 w-4" />
            Metodika
          </h3>
          <ul className="space-y-1">
            {model.methodology.map((m) => (
              <li key={m} className="text-xs text-muted-foreground">
                · {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
          <Link
            href={routes.dealRoom}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-deep-teal underline"
          >
            Pokračovat v Transakční místnosti
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
