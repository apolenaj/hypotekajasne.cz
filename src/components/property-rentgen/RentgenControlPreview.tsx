"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CONTROL_MODEL_INPUTS,
  formatModelCzk,
  formatModelPct,
  runControlModel,
  runControlScenarios,
} from "@/lib/property-rentgen/control-model";
import {
  buildMonthlyWaterfallSteps,
  RentgenScenarioBars,
  RentgenWaterfallChart,
} from "@/components/property-rentgen/RentgenCharts";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function cashFlowHeadline(monthlyCashFlowCzk: number): string {
  const abs = Math.round(Math.abs(monthlyCashFlowCzk));
  const formatted = abs.toLocaleString("cs-CZ");
  if (monthlyCashFlowCzk < -0.5) {
    return `Měsíčně doplácíte přibližně ${formatted} Kč.`;
  }
  if (monthlyCashFlowCzk > 0.5) {
    return `Měsíčně vám zbývá přibližně ${formatted} Kč.`;
  }
  return "Měsíční peněžní tok vychází přibližně na nulu.";
}

/**
 * Landing: assumptions → KPIs → waterfall → scenarios (control model SoT).
 */
export function RentgenControlPreview() {
  const model = useMemo(() => runControlModel(), []);
  const scenarios = useMemo(() => runControlScenarios(), []);
  const waterfallSteps = useMemo(
    () => buildMonthlyWaterfallSteps(model.monthlyWaterfall),
    [model.monthlyWaterfall]
  );
  const cfRounded = Math.round(model.monthlyCashFlowCzk);

  const scenarioRows = scenarios.map((s) => ({
    id: s.id,
    label: s.label,
    valueCzk: s.monthlyCashFlowCzk,
    assumptions: `Nájem ${formatModelCzk(s.monthlyRentCzk, 0)} · výpadek ${(s.vacancyRate * 100).toLocaleString("cs-CZ")} % · sazba ${s.annualRatePercent.toLocaleString("cs-CZ")} %`,
    emphasize: s.id === "base",
  }));

  return (
    <section
      id="ukazka-nahled"
      className="scroll-mt-24 border-b border-border bg-[#f4f6f5] py-10 sm:py-14"
      aria-labelledby="preview-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Modelový příklad
            </p>
            <h2
              id="preview-heading"
              className="mt-1 font-heading text-2xl font-bold text-text-dark sm:text-3xl"
            >
              Jak vypadá výsledek u konkrétního bytu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Smyšlená nemovitost — ne tržní nabídka. Čísla počítá jednotný model
              ze zadaných předpokladů.
            </p>
          </div>
          <Link
            href={routes.investicniRentgenUkazka}
            className="inline-flex rounded-xl bg-deep-teal px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-deep-teal/90"
          >
            Zobrazit celou ukázku
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-white px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
            Předpoklady modelového příkladu
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {(
              [
                ["Plocha", `${CONTROL_MODEL_INPUTS.areaM2} m²`],
                ["Kupní cena", formatModelCzk(CONTROL_MODEL_INPUTS.purchasePriceCzk)],
                ["Úpravy a vybavení", formatModelCzk(CONTROL_MODEL_INPUTS.initialFitOutCzk)],
                ["Vedlejší náklady", formatModelCzk(CONTROL_MODEL_INPUTS.closingCostsCzk)],
                ["Oddělená hotovostní rezerva", formatModelCzk(CONTROL_MODEL_INPUTS.cashReserveCzk)],
                ["Úvěr", formatModelCzk(CONTROL_MODEL_INPUTS.loanAmountCzk)],
                [
                  "Sazba / splatnost",
                  `${CONTROL_MODEL_INPUTS.annualRatePercent} % · ${CONTROL_MODEL_INPUTS.termYears} let`,
                ],
                ["Nájem bez záloh", formatModelCzk(CONTROL_MODEL_INPUTS.monthlyRentCzk)],
                [
                  "Výpadek / správa",
                  `${CONTROL_MODEL_INPUTS.vacancyRate * 100} % / ${CONTROL_MODEL_INPUTS.managementFeeRate * 100} %`,
                ],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-border/50 py-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular-nums font-medium text-text-dark">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Zdroj čísel: modelový předpoklad a výpočet. Neověřená nabídka ani
            právní stav bytu.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Kolik hotovosti potřebuji",
              value: formatModelCzk(model.totalOwnCashIncludingReserveCzk),
              hint: "Vlastní část ceny + úpravy + vedlejší + rezerva",
            },
            {
              label: "Kolik měsíčně doplácím / zbývá",
              value: formatModelCzk(cfRounded),
              hint: "Po rezervě na údržbu, před daní z příjmů",
              tone: cfRounded < 0 ? "neg" : cfRounded > 0 ? "pos" : "neu",
            },
            {
              label: "Nepříznivý scénář",
              value: formatModelCzk(
                Math.round(
                  scenarios.find((s) => s.id === "adverse")?.monthlyCashFlowCzk ?? 0
                )
              ),
              hint: "Nižší nájem, vyšší výpadek, vyšší sazba",
              tone: "neg",
            },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-border bg-white px-4 py-4 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </p>
              <p
                className={cn(
                  "mt-1 font-heading text-2xl font-bold tabular-nums",
                  k.tone === "neg"
                    ? "text-red-700"
                    : k.tone === "pos"
                      ? "text-emerald-700"
                      : "text-text-dark"
                )}
              >
                {k.value}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{k.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-text-dark">Hrubý výnos</span>{" "}
            {formatModelPct(model.grossYieldOnPurchase, 2)}
            <span className="ml-1 text-[11px]">
              (roční potenciální nájem / kupní cena)
            </span>
          </p>
          <p>
            <span className="font-medium text-text-dark">Provozní výnos po rezervě</span>{" "}
            {formatModelPct(model.operatingYieldOnAcquisition, 2)}
            <span className="ml-1 text-[11px]">
              (přebytek po rezervě / pořizovací investice{" "}
              {formatModelCzk(model.totalAcquisitionCostCzk)})
            </span>
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <h3 className="font-heading text-lg font-bold text-text-dark">
            {cashFlowHeadline(model.monthlyCashFlowCzk)}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Rozklad měsíčního nájmu na výdaje a výsledek. Částky v Kč/měsíc, před
            daní z příjmů.
          </p>
          <div className="mt-4">
            <RentgenWaterfallChart steps={waterfallSteps} />
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-deep-teal">
              Tabulka vodopádu
            </summary>
            <table className="mt-2 w-full text-left text-xs">
              <caption className="sr-only">Položky měsíčního vodopádu</caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5">Položka</th>
                  <th className="py-1.5">Kč / měs.</th>
                </tr>
              </thead>
              <tbody>
                {model.monthlyWaterfall.map((w) => (
                  <tr key={w.key} className="border-b border-border/60">
                    <td className="py-1.5">{w.label}</td>
                    <td className="py-1.5 tabular-nums font-medium">
                      {formatModelCzk(w.amountCzk, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <h3 className="font-heading text-lg font-bold text-text-dark">
            Tři modelové situace
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Srovnání počátečních podmínek — ne predikce ani pravděpodobnost.
            Společná nulová osa, částky viditelné bez najetí myší.
          </p>
          <div className="mt-4">
            <RentgenScenarioBars rows={scenarioRows} />
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-text-dark">
          {model.baseConclusionCs}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Záporný tok a splácení jistiny mohou existovat současně — jistina není
          příjem na účet. Model {model.version}.
        </p>
      </div>
    </section>
  );
}
