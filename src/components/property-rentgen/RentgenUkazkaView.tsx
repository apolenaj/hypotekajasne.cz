"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CONTROL_MODEL_VERSION,
  CONTROL_OTHER_ANNUAL_COSTS_CZK,
  formatModelCzk,
  formatModelPct,
  runControlModel,
  runControlScenarios,
  type ControlModelResult,
} from "@/lib/property-rentgen/control-model";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
  packageQueryValue,
  rentgenPrimaryCtaLabel,
  samplePackageFromQuery,
  type RentgenSamplePackageId,
} from "@/lib/property-rentgen";
import {
  CASE_STUDY_LABEL_CS,
  buildCaseStudyBundle,
} from "@/lib/property-rentgen/case-study-analytics";
import {
  DIGITAL_SAMPLE_PAGE_COUNT,
  PREMIUM_SAMPLE_PAGE_COUNT,
} from "@/lib/property-rentgen/sample-pdf-meta";
import {
  buildMonthlyWaterfallSteps,
  RentgenBeforeAfterPanels,
  RentgenEquityDebtChart,
  RentgenReservePathChart,
  RentgenSaleSettlementCharts,
  RentgenScenarioBars,
  RentgenSensitivityHeatmap,
  RentgenStackedCashBar,
  RentgenTornadoChart,
  RentgenWaterfallChart,
} from "@/components/property-rentgen/RentgenCharts";
import {
  buildBeforeAfterPanels,
  buildCashNeededStacked,
  buildEquityDebtSeries,
  buildReservePathSeries,
  buildSaleWaterfall,
  buildSettlementWaterfall,
  buildTornadoDeltas,
} from "@/lib/property-rentgen/chart-series";
import { track } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "shrnuti", label: "Shrnutí" },
  { id: "vstupy", label: "Vstupy" },
  { id: "naklady", label: "Náklady" },
  { id: "mesicni", label: "Měsíční výsledek" },
  { id: "scenare", label: "Scénáře" },
  { id: "financovani", label: "Financování" },
  { id: "cenove", label: "Cenové podmínky" },
  { id: "podklady", label: "Podklady a rizika" },
  { id: "metodika", label: "Metodika" },
] as const;

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

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-border py-8">
      <h2 className="font-heading text-xl font-bold text-text-dark sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function EvidenceTablePremium({
  generatedAt,
  model,
}: {
  generatedAt: string;
  model: ControlModelResult;
}) {
  const rows = [
    {
      field: "List vlastnictví",
      value: "neznámo",
      source: "neznámo",
      date: "—",
      status: "chybí — v omezeních rozboru",
      impact: "Bez LV nepotvrzujeme vlastnictví ani absenci omezení.",
    },
    {
      field: "Technická prohlídka",
      value: "neznámo",
      source: "neznámo",
      date: "—",
      status: "chybí — v omezeních rozboru",
      impact: "Odhad oprav není zjištěný stav bytu.",
    },
    {
      field: "Srovnání nabídek",
      value: "veřejné nabídky Brno-Židenice",
      source: "inzeráty se URL a datem přístupu",
      date: generatedAt,
      status: "veřejná nabídka — ne realizovaný prodej",
      impact: "Nabídkové ceny ≠ tržní hodnota modelu.",
    },
    {
      field: "Kupní cena (vstup)",
      value: formatModelCzk(model.inputs.purchasePriceCzk),
      source: "upravený model po podkladech",
      date: CONTROL_MODEL_VERSION,
      status: "modelový předpoklad",
      impact: "Základ všech výpočtů.",
    },
    {
      field: "Nájem bez záloh",
      value: formatModelCzk(model.inputs.monthlyRentCzk),
      source: "upravený model po podkladech",
      date: CONTROL_MODEL_VERSION,
      status: "modelový předpoklad",
      impact: "Citlivý vstup — srovnání nájmů v PDF.",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-2 pr-3">Údaj</th>
            <th className="py-2 pr-3">Hodnota</th>
            <th className="py-2 pr-3">Původ</th>
            <th className="py-2 pr-3">Datum</th>
            <th className="py-2 pr-3">Stav</th>
            <th className="py-2">Dopad</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.field} className="border-b border-border/70 align-top">
              <td className="py-2 pr-3 font-medium text-text-dark">{r.field}</td>
              <td className="py-2 pr-3 tabular-nums">{r.value}</td>
              <td className="py-2 pr-3">{r.source}</td>
              <td className="py-2 pr-3">{r.date}</td>
              <td className="py-2 pr-3 text-amber-800">{r.status}</td>
              <td className="py-2 text-muted-foreground">{r.impact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FindingCard({
  podklad,
  zjisteni,
  dopad,
  proverit,
}: {
  podklad: string;
  zjisteni: string;
  dopad: string;
  proverit: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm">
      <p>
        <span className="font-semibold text-text-dark">Podklad:</span>{" "}
        <span className="text-muted-foreground">{podklad}</span>
      </p>
      <p className="mt-1">
        <span className="font-semibold text-text-dark">Zjištění:</span>{" "}
        <span className="text-muted-foreground">{zjisteni}</span>
      </p>
      <p className="mt-1">
        <span className="font-semibold text-text-dark">Dopad:</span>{" "}
        <span className="text-muted-foreground">{dopad}</span>
      </p>
      <p className="mt-1">
        <span className="font-semibold text-text-dark">Co prověřit:</span>{" "}
        <span className="text-muted-foreground">{proverit}</span>
      </p>
    </div>
  );
}

function ModelBody({
  model,
  pkg,
}: {
  model: ControlModelResult;
  pkg: RentgenSamplePackageId;
}) {
  const caseStudy = useMemo(() => buildCaseStudyBundle(model.inputs), [model.inputs]);
  const activeModel = pkg === "premium" ? caseStudy.adjustedModel : model;
  const scenarios =
    pkg === "premium" ? caseStudy.scenarios : runControlScenarios(model.inputs);
  const waterfallSteps = useMemo(
    () => buildMonthlyWaterfallSteps(activeModel.monthlyWaterfall),
    [activeModel.monthlyWaterfall]
  );
  const scenarioRows = scenarios.map((s) => ({
    id: s.id,
    label: s.label,
    valueCzk: s.monthlyCashFlowCzk,
    assumptions: `Nájem ${formatModelCzk(s.monthlyRentCzk, 0)} · výpadek ${(s.vacancyRate * 100).toLocaleString("cs-CZ")} % · sazba ${s.annualRatePercent.toLocaleString("cs-CZ")} %`,
    emphasize: s.id === "base",
  }));
  const sensitivityRows =
    pkg === "premium"
      ? caseStudy.sensitivity.rents
      : [18_000, 19_000, 20_000, 21_000, 22_000];
  const sensitivityColumns =
    pkg === "premium" ? caseStudy.sensitivity.rates : [3.8, 4.8, 5.8, 6.8];
  const sensitivityCells =
    pkg === "premium"
      ? caseStudy.sensitivity.cells.map((cell) => ({
          rowValue: cell.monthlyRentCzk,
          columnValue: cell.annualRatePercent,
          valueCzk: cell.monthlyCashFlowCzk,
        }))
      : sensitivityRows.flatMap((rent) =>
          sensitivityColumns.map((rate) => ({
            rowValue: rent,
            columnValue: rate,
            valueCzk: runControlModel({
              ...model.inputs,
              monthlyRentCzk: rent,
              annualRatePercent: rate,
            }).monthlyCashFlowCzk,
          }))
        );
  const cashNeeded = buildCashNeededStacked(
    {
      equityCzk: activeModel.equityTowardPurchaseCzk,
      fitoutCzk: activeModel.inputs.initialFitOutCzk,
      optionalFitoutCzk:
        pkg === "premium"
          ? Math.max(
              0,
              caseStudy.originalModel.inputs.initialFitOutCzk -
                caseStudy.adjustedInputs.initialFitOutCzk
            )
          : 0,
      closingCzk: activeModel.inputs.closingCostsCzk,
      reserveCzk: activeModel.inputs.cashReserveCzk,
    },
    {
      interpretationCs:
        pkg === "premium"
          ? "Nutná částka počítá s úpravami za 145 tis. Kč; volitelný nábytek je zobrazen zvlášť."
          : "Sloupec ukazuje vlastní část kupní ceny, úpravy, vedlejší náklady a drženou rezervu.",
      assumptionsCs: [
        `Kupní cena ${formatModelCzk(activeModel.inputs.purchasePriceCzk)}`,
        `úvěr ${formatModelCzk(activeModel.inputs.loanAmountCzk)}`,
      ],
    }
  );
  const beforeAfter = buildBeforeAfterPanels(
    {
      monthlyCashFlow: {
        beforeCzk: caseStudy.originalModel.monthlyCashFlowCzk,
        afterCzk: caseStudy.adjustedModel.monthlyCashFlowCzk,
      },
      ownCash: {
        beforeCzk: caseStudy.originalModel.totalOwnCashIncludingReserveCzk,
        afterCzk: caseStudy.adjustedModel.totalOwnCashIncludingReserveCzk,
      },
      ownerCosts: {
        beforeCzk: CONTROL_OTHER_ANNUAL_COSTS_CZK / 12,
        afterCzk:
          (caseStudy.adjustedInputs.ownerBuildingCostsAnnualCzk +
            caseStudy.adjustedInputs.insuranceAnnualCzk +
            caseStudy.adjustedInputs.propertyTaxAnnualCzk +
            caseStudy.adjustedInputs.unitMaintenanceReserveAnnualCzk) /
          12,
      },
    },
    {
      interpretationCs:
        "Podklady snížily nutné úpravy, ale zvýšily pravidelné náklady vlastníka a měsíční doplatek.",
      assumptionsCs: ["Před = původní zadání", "po = údaje upravené podle modelových podkladů"],
    }
  );
  const tornado = buildTornadoDeltas(
    caseStudy.sensitivity.concreteDeltas
      .filter((row) => Math.abs(row.deltaMonthlyCashFlowCzk) >= 100)
      .map((row) => ({
        label: row.label,
        deltaCzk: row.deltaMonthlyCashFlowCzk,
        changeNote: row.changeDescriptionCs,
      })),
    {
      interpretationCs:
        "Největší délka pruhu označuje změnu s největším dopadem na měsíční výsledek.",
      assumptionsCs: ["Každá změna je počítána samostatně proti upravenému modelu"],
    }
  );
  const reservePath = buildReservePathSeries(
    caseStudy.combinedLiquidity.path.map((row) => ({
      month: row.month,
      openingCzk: row.openingCzk,
      closingCzk: row.closingCzk,
      topupCzk: row.investorInflowCzk,
      empty: row.month <= caseStudy.combinedLiquidity.emptyMonthsWithoutRent,
      repair: row.month === caseStudy.combinedLiquidity.repairMonth,
      relet:
        row.month === caseStudy.combinedLiquidity.emptyMonthsWithoutRent + 1,
    })),
    {
      interpretationCs:
        "Rezerva při souběhu prázdna a opravy nestačí bez externího doplnění.",
      assumptionsCs: [
        "4 měsíce bez nájmu",
        "oprava 80 000 Kč ve 4. měsíci",
        "opětovné pronajmutí od 5. měsíce",
      ],
    }
  );
  const equityDebt = buildEquityDebtSeries(
    caseStudy.longTermFlatCosts.map((row) => ({
      year: row.year,
      propertyValueCzk: row.propertyValueCzk,
      debtCzk: row.loanBalanceCzk,
      equityCzk: row.equityCzk,
    })),
    {
      interpretationCs:
        "Rozdíl mezi modelovou hodnotou bytu a zůstatkem úvěru tvoří vlastní kapitál.",
      assumptionsCs: ["Hodnota nemovitosti +2 % ročně", "řádné splácení úvěru"],
    }
  );
  const saleY5 = caseStudy.sales[0]!;
  const saleChart = buildSaleWaterfall(
    {
      salePriceCzk: saleY5.assumedSalePriceCzk,
      costsCzk: saleY5.sellingCostsCzk,
      debtCzk: saleY5.loanBalanceCzk,
      netProceedsCzk: saleY5.netProceedsBeforeTaxCzk,
    },
    {
      interpretationCs:
        "Po nákladech prodeje a splacení zůstatku úvěru zbývá čisté inkaso před daní.",
      assumptionsCs: ["prodej po 5 letech", "náklady prodeje 4 %", "růst hodnoty 2 % ročně"],
    }
  );
  const settlementChart = buildSettlementWaterfall(
    {
      initialOutlayCzk: caseStudy.settlementStressY5.initialOwnCashCzk,
      topupsCzk: caseStudy.settlementStressY5.investorTopUpsCzk,
      saleAndReserveCzk:
        caseStudy.settlementStressY5.saleNetProceedsBeforeTaxCzk +
        caseStudy.settlementStressY5.reserveReleasedCzk,
      totalCzk: caseStudy.settlementStressY5.totalResultBeforeTaxCzk,
    },
    {
      interpretationCs:
        "Výsledek spojuje počáteční hotovost, doplnění rezervy a konečné inkaso bez dvojího započtení provozních toků.",
      assumptionsCs: ["stres na začátku", "prodej po 5 letech", "výsledek před daní z příjmů"],
    }
  );

  return (
    <>
      <Section id="shrnuti" title="Shrnutí">
        <p className="text-lg font-semibold text-text-dark">
          {cashFlowHeadline(activeModel.monthlyCashFlowCzk)}
        </p>
        <p className="text-sm leading-relaxed text-text-dark">
          {activeModel.baseConclusionCs}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Vlastní hotovost vč. rezervy",
              formatModelCzk(activeModel.totalOwnCashIncludingReserveCzk),
            ],
            ["Měsíční tok", formatModelCzk(activeModel.monthlyCashFlowCzk, 0)],
            ["Hrubý výnos z kupní ceny", formatModelPct(activeModel.grossYieldOnPurchase, 2)],
            [
              "Provozní výnos z pořízení",
              formatModelPct(activeModel.operatingYieldOnAcquisition, 2),
            ],
          ].map(([l, v]) => (
            <div
              key={l}
              className="rounded-xl border border-border bg-[#f7f9f8] px-3 py-3"
            >
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                {l}
              </p>
              <p className="mt-1 font-heading text-lg font-bold tabular-nums">
                {v}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Hrubý výnos = roční potenciální nájem / kupní cena. Provozní výnos po
          rezervě = přebytek po rezervě / pořizovací investice{" "}
          {formatModelCzk(activeModel.totalAcquisitionCostCzk)}. Tok je před daní z
          příjmů.
        </p>
        {pkg === "premium" ? (
          <RentgenBeforeAfterPanels data={beforeAfter.data} meta={beforeAfter.meta} />
        ) : null}
      </Section>

      <Section id="vstupy" title="Vstupy">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {(
            [
              ["Plocha", `${activeModel.inputs.areaM2} m²`],
              ["Kupní cena", formatModelCzk(activeModel.inputs.purchasePriceCzk)],
              ["Úpravy a vybavení", formatModelCzk(activeModel.inputs.initialFitOutCzk)],
              ["Vedlejší náklady", formatModelCzk(activeModel.inputs.closingCostsCzk)],
              ["Úvěr", formatModelCzk(activeModel.inputs.loanAmountCzk)],
              [
                "Sazba / splatnost",
                `${activeModel.inputs.annualRatePercent} % · ${activeModel.inputs.termYears} let`,
              ],
              ["Nájem bez záloh / měs.", formatModelCzk(activeModel.inputs.monthlyRentCzk)],
              [
                "Výpadek / správa",
                `${activeModel.inputs.vacancyRate * 100} % / ${activeModel.inputs.managementFeeRate * 100} %`,
              ],
            ] as const
          ).map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-4 border-b border-border/60 py-2"
            >
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="tabular-nums font-medium text-text-dark">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="naklady" title="Náklady a rozpočet vstupu">
        <p className="text-sm text-muted-foreground">
          Celková pořizovací investice {formatModelCzk(activeModel.totalAcquisitionCostCzk)}{" "}
          nezahrnuje drženou rezervu {formatModelCzk(activeModel.inputs.cashReserveCzk)}.
        </p>
        <RentgenStackedCashBar data={cashNeeded.data} meta={cashNeeded.meta} />
        <ul className="space-y-1 text-sm">
          <li>
            Vlastní část kupní ceny:{" "}
            {formatModelCzk(activeModel.equityTowardPurchaseCzk)}
          </li>
          <li>Úpravy: {formatModelCzk(activeModel.inputs.initialFitOutCzk)}</li>
          <li>Vedlejší: {formatModelCzk(activeModel.inputs.closingCostsCzk)}</li>
          <li>
            Oddělená hotovostní rezerva:{" "}
            {formatModelCzk(activeModel.inputs.cashReserveCzk)}
          </li>
          <li className="font-semibold">
            Celkem vlastní hotovost:{" "}
            {formatModelCzk(activeModel.totalOwnCashIncludingReserveCzk)}
          </li>
        </ul>
      </Section>

      <Section id="mesicni" title="Měsíční výsledek">
        <p className="text-base font-semibold text-text-dark">
          {cashFlowHeadline(activeModel.monthlyCashFlowCzk)}
        </p>
        <RentgenWaterfallChart
          steps={waterfallSteps}
          meta={{
            id: "sample-waterfall",
            questionCs: "Jak vzniká měsíční výsledek?",
            unitCs: "Kč/měs.",
            periodCs: "Počáteční stav",
            interpretationCs:
              "Jednotlivé odpočty vedou od nájemného k částce, kterou investor doplácí nebo která mu zbývá.",
            assumptionsCs: [
              `nájem ${formatModelCzk(activeModel.inputs.monthlyRentCzk)}`,
              `výpadek ${activeModel.inputs.vacancyRate * 100} %`,
              `sazba ${activeModel.inputs.annualRatePercent} %`,
            ],
          }}
        />
        <details>
          <summary className="cursor-pointer text-xs font-semibold text-deep-teal">
            Tabulka vodopádu
          </summary>
          <table className="mt-2 w-full min-w-[320px] text-left text-xs">
            <caption className="sr-only">Vodopád měsíčního výsledku</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2">Položka</th>
                <th className="py-2">Kč / měs.</th>
              </tr>
            </thead>
            <tbody>
              {activeModel.monthlyWaterfall.map((w) => (
                <tr key={w.key} className="border-b border-border/70">
                  <td className="py-1.5">{w.label}</td>
                  <td className="py-1.5 tabular-nums font-medium">
                    {formatModelCzk(w.amountCzk, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <p className="text-sm font-semibold tabular-nums text-text-dark">
          Výsledek: {formatModelCzk(activeModel.monthlyCashFlowCzk, 0)} / měs. před
          daní z příjmů
        </p>
      </Section>

      <Section id="scenare" title="Scénáře">
        <p className="text-xs text-muted-foreground">
          Srovnání různých počátečních podmínek — ne predikce ani pravděpodobnost.
          Fixované: správa {activeModel.inputs.managementFeeRate * 100} %, úvěr{" "}
          {formatModelCzk(activeModel.inputs.loanAmountCzk)}, splatnost{" "}
          {activeModel.inputs.termYears * 12}
          měsíců.
        </p>
        <RentgenScenarioBars
          rows={scenarioRows}
          meta={{
            id: "sample-scenarios",
            questionCs: "Jak dopadnou tři možné vstupní podmínky?",
            unitCs: "Kč/měs.",
            periodCs: "Počáteční stav",
            interpretationCs:
              "Pruhy porovnávají měsíční výsledek; nejde o předpověď ani pravděpodobnost.",
            assumptionsCs: [
              `úvěr ${formatModelCzk(activeModel.inputs.loanAmountCzk)}`,
              `splatnost ${activeModel.inputs.termYears} let`,
              "správa a náklady podle zvoleného balíčku",
            ],
          }}
        />
        {pkg === "premium" ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Co říká historie neobsazenosti?</p>
            <p className="mt-1">
              V podkladu chyběl nájem {caseStudy.vacancyAnalysis.historicalEmptyMonths} z{" "}
              {caseStudy.vacancyAnalysis.historicalHorizonMonths} měsíců, tedy{" "}
              {(caseStudy.vacancyAnalysis.historicalRate * 100).toLocaleString("cs-CZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              %. Budoucí model ponechává předpoklad{" "}
              {caseStudy.vacancyAnalysis.futureAssumptionRate * 100} %.
            </p>
            <p className="mt-1 tabular-nums">
              Při 5 %:{" "}
              <strong>
                {formatModelCzk(
                  caseStudy.vacancyAnalysis.monthlyCashFlowAtFutureAssumptionCzk,
                  0
                )}{" "}
                / měs.
              </strong>{" "}
              · při historických 4/36:{" "}
              <strong>
                {formatModelCzk(
                  caseStudy.vacancyAnalysis.monthlyCashFlowAtHistoricalRateCzk,
                  0
                )}{" "}
                / měs.
              </strong>
            </p>
            <p className="mt-1 text-xs">{caseStudy.vacancyAnalysis.futureAssumptionReasonCs}</p>
          </div>
        ) : null}
        <details>
          <summary className="cursor-pointer text-xs font-semibold text-deep-teal">
            Detailní tabulka scénářů
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2">Scénář</th>
                  <th className="py-2">Nájem</th>
                  <th className="py-2">Výpadek</th>
                  <th className="py-2">Sazba</th>
                  <th className="py-2">Splátka</th>
                  <th className="py-2">Tok / měs.</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} className="border-b border-border/70">
                    <td className="py-2">{s.label}</td>
                    <td className="py-2 tabular-nums">
                      {formatModelCzk(s.monthlyRentCzk)}
                    </td>
                    <td className="py-2 tabular-nums">{s.vacancyRate * 100} %</td>
                    <td className="py-2 tabular-nums">{s.annualRatePercent} %</td>
                    <td className="py-2 tabular-nums">
                      {formatModelCzk(s.monthlyPaymentCzk, 0)}
                    </td>
                    <td className="py-2 tabular-nums font-semibold">
                      {formatModelCzk(s.monthlyCashFlowCzk, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className="mt-6">
          <h3 className="font-semibold text-text-dark">
            Citlivost: nájem versus sazba
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Buňky = měsíční peněžní tok (Kč). Zelená jen nad nulou. Výpadek a
            správa zůstávají jako v základním modelu.
          </p>
          <RentgenSensitivityHeatmap
            rows={sensitivityRows}
            columns={sensitivityColumns}
            cells={sensitivityCells}
            currentRow={20_000}
            currentColumn={4.8}
            meta={{
              id: "sample-sensitivity",
              questionCs: "Jak nájem a sazba mění měsíční výsledek?",
              unitCs: "Kč/měs.",
              periodCs: "Počáteční stav",
              interpretationCs:
                "Zlatý rámeček označuje základní kombinaci nájmu 20 000 Kč a sazby 4,8 %.",
              assumptionsCs: [
                `výpadek ${activeModel.inputs.vacancyRate * 100} %`,
                `správa ${activeModel.inputs.managementFeeRate * 100} %`,
                "ostatní vstupy beze změny",
              ],
            }}
          />
          {pkg === "premium" ? (
            <div className="mt-6">
              <RentgenTornadoChart data={tornado.data} meta={tornado.meta} />
            </div>
          ) : null}
        </div>
      </Section>

      <Section id="financovani" title="Financování — prvních 12 měsíců">
        <p className="text-sm text-muted-foreground">
          Splacená jistina za 12 měsíců:{" "}
          <span className="font-semibold tabular-nums text-text-dark">
            {formatModelCzk(activeModel.principalPaidFirst12MonthsCzk, 0)}
          </span>
          . Jistina není peněžní příjem na účet.
        </p>
        {pkg === "premium" ? (
          <>
            <RentgenReservePathChart data={reservePath.data} meta={reservePath.meta} />
            <RentgenEquityDebtChart data={equityDebt.data} meta={equityDebt.meta} />
          </>
        ) : null}
        <details>
          <summary className="cursor-pointer text-xs font-semibold text-deep-teal">
            Tabulka amortizace
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <caption className="sr-only">
                Amortizace úvěru v prvních 12 měsících
              </caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2">Měsíc</th>
                  <th className="py-2">Úrok</th>
                  <th className="py-2">Umoření</th>
                  <th className="py-2">Splátka</th>
                  <th className="py-2">Zůstatek</th>
                </tr>
              </thead>
              <tbody>
                {activeModel.first12Months.map((m) => (
                  <tr key={m.month} className="border-b border-border/70">
                    <td className="py-1.5 tabular-nums">{m.month}</td>
                    <td className="py-1.5 tabular-nums">
                      {formatModelCzk(m.interestCzk, 0)}
                    </td>
                    <td className="py-1.5 tabular-nums">
                      {formatModelCzk(m.principalCzk, 0)}
                    </td>
                    <td className="py-1.5 tabular-nums">
                      {formatModelCzk(m.paymentCzk, 0)}
                    </td>
                    <td className="py-1.5 tabular-nums">
                      {formatModelCzk(m.closingBalanceCzk, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Section>

      <Section id="cenove" title="Cenové podmínky modelu">
        <ul className="space-y-2 text-sm text-text-dark">
          <li>
            Nájem pro nulový tok:{" "}
            <strong className="tabular-nums">
              {formatModelCzk(activeModel.rentForZeroCashFlowCzk, 0)}
            </strong>{" "}
            / měs.
          </li>
          <li>
            Cenová hranice nulového toku při úvěru 70 % kupní ceny:{" "}
            <strong className="tabular-nums">
              {formatModelCzk(activeModel.purchasePriceForZeroCashFlowAt70LoanCzk, 0)}
            </strong>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Není to tržní ocenění, garantovaná nákupní cena ani osobní doporučení.
          Úvěr se v tomto výpočtu mění s 70 % kupní ceny. Tok je před daní z
          příjmů.
        </p>
        {pkg === "premium" ? (
          <RentgenSaleSettlementCharts
            sale={saleChart.data}
            settlement={settlementChart.data}
            saleMeta={saleChart.meta}
            settlementMeta={settlementChart.meta}
          />
        ) : null}
      </Section>

      <Section id="podklady" title="Podklady a rizika">
        {pkg === "premium" ? (
          <>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">{CASE_STUDY_LABEL_CS}</p>
              <p className="mt-1 text-amber-900/90">
                Modelový byt v lokalitě Brno-Židenice. Srovnání vychází z
                veřejných nabídek se zdrojem a datem. Modelové podklady jsou
                výslovně označené. Plný rozbor: PDF ({PREMIUM_SAMPLE_PAGE_COUNT}{" "}
                stran).
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Původní zadání
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-text-dark">
                  {formatModelCzk(caseStudy.originalModel.monthlyCashFlowCzk, 0)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / měs.
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-deep-teal/30 bg-[#f7f9f8] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-deep-teal">
                  Po zpracování podkladů
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-deep-teal">
                  {formatModelCzk(caseStudy.adjustedModel.monthlyCashFlowCzk, 0)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / měs.
                  </span>
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-text-dark">
              Co tento rozbor přidává oproti automatickému modelu
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {caseStudy.whatPremiumAddsCs.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-semibold text-text-dark">
              Hlavní zjištění z podkladů a trhu
            </p>
            <div className="space-y-3">
              {caseStudy.findings
                .filter((f) => f.fromDocumentWork)
                .slice(0, 3)
                .map((f) => (
                  <FindingCard
                    key={f.id}
                    podklad={f.podklad}
                    zjisteni={f.zjisteni}
                    dopad={f.dopad}
                    proverit={f.overit}
                  />
                ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-text-dark">
              Veřejné nájemní nabídky (Brno-Židenice)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2">Nabídka</th>
                    <th className="py-2">m²</th>
                    <th className="py-2">Nájem</th>
                    <th className="py-2">Omezení</th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudy.rentListings.map((l) => (
                    <tr key={l.id} className="border-b border-border/70">
                      <td className="py-1.5">
                        {l.url ? (
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-deep-teal underline-offset-2 hover:underline"
                          >
                            {l.label}
                          </a>
                        ) : (
                          l.label
                        )}
                      </td>
                      <td className="py-1.5 tabular-nums">{l.areaM2}</td>
                      <td className="py-1.5 tabular-nums">
                        {formatModelCzk(l.priceOrRentCzk)}
                      </td>
                      <td className="py-1.5 text-muted-foreground">
                        {l.comparabilityLimit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Nabídkové nájmy bez přeúčtovaných služeb · přístup{" "}
              {caseStudy.rentListings[0]?.accessDate ?? caseStudy.generatedAt} ·
              neprokazují realizované nájemné.
            </p>
            <EvidenceTablePremium
              generatedAt={caseStudy.generatedAt}
              model={caseStudy.adjustedModel}
            />
          </>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-text-dark">
                Rozsah výstupu za {formatDigitalRentgenPrice()}
              </strong>
              : rozpočet hotovosti, cash flow, scénáře, citlivost, bod zvratu a
              PDF ({DIGITAL_SAMPLE_PAGE_COUNT} stran) z vašich čísel a
              modelových předpokladů. Automatický výklad — bez dohledání nabídek
              a bez rozboru dokumentů.
            </p>
            <p>
              Přepněte na výstup za {formatAnalysisPrice()}, abyste viděli
              zjištění z podkladů, veřejné srovnání a likviditní scénáře (
              {PREMIUM_SAMPLE_PAGE_COUNT} stran PDF).
            </p>
          </div>
        )}
      </Section>

      <Section id="metodika" title="Metodika">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Verze modelu: {CONTROL_MODEL_VERSION}</li>
          <li>
            Anuita z jistiny, sazby a splatnosti; provozní přebytek po rezervě =
            inkasovaný nájem − správa − ostatní roční náklady (
            {formatModelCzk(
              pkg === "premium"
                ? caseStudy.adjustedModel.otherAnnualCostsCzk
                : CONTROL_OTHER_ANNUAL_COSTS_CZK
            )}{" "}
            v tomto příkladu).
          </li>
          <li>
            Poměr úvěru ke kupní ceně není automaticky bankovní LTV. Model
            nevyslovuje závěr o schválení úvěru.
          </li>
          <li>
            {pkg === "premium"
              ? "Základní automatický model neobsahuje daň z příjmů ani poplatky za úvěr. Prémiový rozbor přidává modelové prodejní náklady (např. 4 %) a vypořádání — stále před daní z příjmů."
              : "V modelu není daň z příjmů, poplatky za úvěr, výnos rezervy ani náklady prodeje."}
          </li>
        </ul>
      </Section>
    </>
  );
}

export function RentgenUkazkaView() {
  const searchParams = useSearchParams();
  const queryPackage = samplePackageFromQuery(searchParams.get("balicek"));
  const [selectedPackage, setSelectedPackage] =
    useState<RentgenSamplePackageId | null>(null);
  const pkg = selectedPackage ?? queryPackage;
  const model = useMemo(() => runControlModel(), []);

  useEffect(() => {
    track("premium_viewed", {
      tool_id: "investicni_rentgen_ukazka",
      path: routes.investicniRentgenUkazka,
    });
  }, []);

  const selectPackage = (id: RentgenSamplePackageId) => {
    setSelectedPackage(id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("balicek", packageQueryValue(id));
      window.history.replaceState({}, "", url.toString());
      track("premium_cta_clicked", {
        tool_id: "investicni_rentgen_ukazka",
        cta_id: `package_${id}`,
        price_band: "premium",
      });
    } catch {
      /* analytics / history must not block UI */
    }
  };

  return (
    <div className="overflow-x-hidden bg-white">
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto max-w-5xl px-4 py-3 text-sm text-amber-950 sm:px-6 lg:px-8">
          <strong>Modelový příklad</strong> — smyšlená nemovitost, přesně
          spočtené vstupy. Není to tržní nabídka ani ověřený rozbor konkrétního
          bytu.
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Veřejná ukázka
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-text-dark">
              Modelový rozbor výstupu
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Právě prohlížíte:{" "}
              <strong className="text-text-dark">
                {pkg === "premium"
                  ? `Individuální rozbor (${formatAnalysisPrice()}) · ${PREMIUM_SAMPLE_PAGE_COUNT} stran A4`
                  : `Investiční rentgen (${formatDigitalRentgenPrice()}) · ${DIGITAL_SAMPLE_PAGE_COUNT} stran A4`}
              </strong>
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Typ výstupu"
            className="grid grid-cols-2 gap-1 rounded-xl bg-[#eef2f0] p-1"
          >
            {(
              [
                ["digital", `Výstup za ${formatDigitalRentgenPrice()}`],
                ["premium", `Výstup za ${formatAnalysisPrice()}`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                data-package={id}
                aria-selected={pkg === id}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal sm:text-sm",
                  pkg === id
                    ? "bg-white text-deep-teal shadow-sm"
                    : "text-muted-foreground"
                )}
                onClick={() => selectPackage(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <nav
          aria-label="Obsah ukázky"
          className="mt-6 flex gap-2 overflow-x-auto pb-2 text-xs font-semibold"
        >
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-deep-teal hover:bg-[#f7f9f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`/api/rentgen-sample-pdf?balicek=${packageQueryValue(pkg)}`}
            className="inline-flex rounded-xl bg-deep-teal px-4 py-2.5 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-gold"
            onClick={() =>
              track("primary_cta_clicked", {
                tool_id: "investicni_rentgen_ukazka",
                cta_id:
                  pkg === "premium"
                    ? "sample_pdf_premium_download"
                    : "sample_pdf_digital_download",
              })
            }
          >
            {pkg === "premium"
              ? `Stáhnout individuální rozbor PDF (${PREMIUM_SAMPLE_PAGE_COUNT} stran)`
              : `Stáhnout automatický model PDF (${DIGITAL_SAMPLE_PAGE_COUNT} stran)`}
          </a>
          <Link
            href={`${routes.investicniRentgen}?balicek=${packageQueryValue(pkg)}#premium-objednavka`}
            className="inline-flex rounded-xl border border-deep-teal/30 px-4 py-2.5 text-sm font-bold text-deep-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal"
          >
            {rentgenPrimaryCtaLabel(pkg)}
          </Link>
          <Link
            href={`${routes.investicniRentgen}#nastroj`}
            className="inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground underline-offset-2 hover:underline"
          >
            Spočítat náhled zdarma
          </Link>
        </div>

        {pkg === "premium" ? (
          <div className="mt-6">
            <p className="text-sm font-semibold text-text-dark">
              Náhledy stran z modelového PDF
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Skutečné stránky vygenerovaného dokumentu (ne ilustrace).
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Rozhodnutí a hotovost",
                  body: "Tok před a po podkladech, potřebná hotovost.",
                  src: "/rentgen-sample-previews/premium-p02.png",
                  page: 2,
                },
                {
                  title: "Rozklad nájmu a scénáře",
                  body: "Vodopád měsíčního toku a srovnání variant.",
                  src: "/rentgen-sample-previews/premium-p08.png",
                  page: 8,
                },
                {
                  title: "Likvidita a refixace",
                  body: "Čtyři měsíce bez inkasa a dopad sazby.",
                  src: "/rentgen-sample-previews/premium-p12.png",
                  page: 12,
                },
                {
                  title: "Závěr a vypořádání",
                  body: "Prodej, celkový výsledek a co ověřit.",
                  src: "/rentgen-sample-previews/premium-p16.png",
                  page: 16,
                },
              ].map((card) => (
                <figure
                  key={card.title}
                  className="overflow-hidden rounded-xl border border-border bg-[#f7f9f8]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt={`Strana ${card.page} — ${card.title}`}
                    className="aspect-[210/297] w-full object-cover object-top bg-white"
                  />
                  <figcaption className="px-3 py-2">
                    <p className="text-sm font-semibold text-deep-teal">
                      {card.title}
                      <span className="ml-1 font-normal text-muted-foreground">
                        · s. {card.page}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {card.body}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm font-semibold text-text-dark">
              Náhledy stran z automatického PDF
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Shrnutí výsledků",
                  src: "/rentgen-sample-previews/digital-p01.png",
                  page: 1,
                },
                {
                  title: "Vstupy a rozpočet",
                  src: "/rentgen-sample-previews/digital-p02.png",
                  page: 2,
                },
                {
                  title: "Scénáře",
                  src: "/rentgen-sample-previews/digital-p04.png",
                  page: 4,
                },
                {
                  title: "Citlivost",
                  src: "/rentgen-sample-previews/digital-p06.png",
                  page: 6,
                },
              ].map((card) => (
                <figure
                  key={card.title}
                  className="overflow-hidden rounded-xl border border-border bg-[#f7f9f8]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt={`Strana ${card.page} — ${card.title}`}
                    className="aspect-[210/297] w-full object-cover object-top bg-white"
                  />
                  <figcaption className="px-3 py-2">
                    <p className="text-sm font-semibold text-deep-teal">
                      {card.title}
                      <span className="ml-1 font-normal text-muted-foreground">
                        · s. {card.page}
                      </span>
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        <ModelBody model={model} pkg={pkg} />
      </div>
    </div>
  );
}
