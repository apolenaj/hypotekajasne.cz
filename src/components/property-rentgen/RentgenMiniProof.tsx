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

/**
 * Compact post-hero proof strip — real control-model numbers only.
 * Full model stays lower on the page (RentgenControlPreview).
 */
export function RentgenMiniProof() {
  const model = useMemo(() => runControlModel(), []);
  const scenarios = useMemo(() => runControlScenarios(), []);
  const adverse = scenarios.find((s) => s.id === "adverse");
  const rentZero = Math.round(model.rentForZeroCashFlowCzk);

  const cells = [
    {
      label: "Kupní cena",
      value: formatModelCzk(CONTROL_MODEL_INPUTS.purchasePriceCzk),
    },
    {
      label: "Potřebná hotovost",
      value: formatModelCzk(model.totalOwnCashIncludingReserveCzk),
    },
    {
      label: "Měsíční cash flow",
      value: formatModelCzk(Math.round(model.monthlyCashFlowCzk)),
      tone: model.monthlyCashFlowCzk < 0 ? "neg" : "neu",
    },
    {
      label: "Hrubý výnos",
      value: formatModelPct(model.grossYieldOnPurchase, 2),
    },
    {
      label: "Nepříznivý scénář",
      value: `${formatModelCzk(Math.round(adverse?.monthlyCashFlowCzk ?? 0))} / měs.`,
      tone: "neg",
    },
    {
      label: "Nájem pro nulové cash flow",
      value: `${formatModelCzk(rentZero)} / měs.`,
    },
  ] as const;

  return (
    <section
      id="mini-model"
      className="scroll-mt-24 border-b border-border bg-white py-10 sm:py-12"
      aria-labelledby="mini-model-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Modelový příklad
        </p>
        <h2
          id="mini-model-heading"
          className="mt-1 font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          Jedna nemovitost. Pět odpovědí, které chcete znát před koupí.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Smyšlená nemovitost — stejný model jako v kompletní ukázce. Ne tržní
          nabídka.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cells.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-border bg-[#f7f9f8] px-3 py-3 sm:px-4"
            >
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {c.label}
              </dt>
              <dd
                className={
                  "mt-1 font-heading text-base font-bold tabular-nums sm:text-lg " +
                  ("tone" in c && c.tone === "neg"
                    ? "text-red-700"
                    : "text-text-dark")
                }
              >
                {c.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <a
            href="#ukazka-nahled"
            className="inline-flex rounded-xl bg-deep-teal px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-deep-teal/90"
          >
            Prohlédnout celý modelový výstup
          </a>
          <Link
            href="/investicni-rentgen/ukazka"
            className="ml-3 inline-flex text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Veřejná ukázka PDF
          </Link>
        </div>
      </div>
    </section>
  );
}
