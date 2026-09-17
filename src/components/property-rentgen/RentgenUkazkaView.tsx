"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CONTROL_MODEL_INPUTS,
  CONTROL_MODEL_VERSION,
  CONTROL_OTHER_ANNUAL_COSTS_CZK,
  computeMonthlyAnnuity,
  computeOperatingSurplusAfterReserve,
  formatModelCzk,
  formatModelPct,
  runControlModel,
  runControlScenarios,
  type ControlModelResult,
} from "@/lib/property-rentgen/control-model";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
  rentgenPrimaryCtaLabel,
} from "@/lib/property-rentgen/pricing";
import { track } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type PackageId = "digital" | "premium";

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

const SENSITIVITY_RENTS = [18_000, 19_000, 20_000, 21_000, 22_000] as const;
const SENSITIVITY_RATES = [3.8, 4.8, 5.8, 6.8] as const;

function sensitivityCashFlow(
  monthlyRentCzk: number,
  annualRatePercent: number
): number {
  const ops = computeOperatingSurplusAfterReserve({
    monthlyRentCzk,
    vacancyRate: CONTROL_MODEL_INPUTS.vacancyRate,
    managementFeeRate: CONTROL_MODEL_INPUTS.managementFeeRate,
    otherAnnualCostsCzk: CONTROL_OTHER_ANNUAL_COSTS_CZK,
  });
  const payment = computeMonthlyAnnuity(
    CONTROL_MODEL_INPUTS.loanAmountCzk,
    annualRatePercent,
    CONTROL_MODEL_INPUTS.termYears
  );
  return ops.operatingSurplusAfterReserveCzk / 12 - payment;
}

function ChartShell({
  ready,
  heightClass,
  children,
}: {
  ready: boolean;
  heightClass: string;
  children: ReactNode;
}) {
  return (
    <div className={`${heightClass} w-full min-h-0`}>
      {ready ? (
        children
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
          Načítám graf…
        </div>
      )}
    </div>
  );
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

function EvidenceTablePremium() {
  const rows = [
    {
      field: "List vlastnictví",
      value: "—",
      source: "—",
      date: "—",
      status: "v této modelové ukázce nezjišťováno",
      impact: "Bez LV nepotvrzujeme vlastnictví ani absenci omezení.",
    },
    {
      field: "Technická prohlídka",
      value: "—",
      source: "—",
      date: "—",
      status: "v této modelové ukázce nezjišťováno",
      impact: "Odhad oprav není zjištěný stav.",
    },
    {
      field: "Srovnání místních nabídek",
      value: "Ukázková šablona",
      source: "veřejné inzeráty",
      date: "doplní se při reálném rozboru",
      status: "v této modelové ukázce nezjišťováno",
      impact: "Nabídkové ceny ≠ realizované prodeje.",
    },
    {
      field: "Kupní cena (vstup)",
      value: formatModelCzk(CONTROL_MODEL_INPUTS.purchasePriceCzk),
      source: "zadáno v modelu",
      date: CONTROL_MODEL_VERSION,
      status: "modelový předpoklad",
      impact: "Základ všech výpočtů.",
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

function ModelBody({
  model,
  pkg,
  chartsReady,
}: {
  model: ControlModelResult;
  pkg: PackageId;
  chartsReady: boolean;
}) {
  const scenarios = useMemo(() => runControlScenarios(), []);
  const waterfall = model.monthlyWaterfall.filter((w) => w.key !== "net");
  const chartScenarios = scenarios.map((s) => ({
    name: s.label,
    value: Math.round(s.monthlyCashFlowCzk * 100) / 100,
  }));
  const amortChart = model.first12Months.map((m) => ({
    month: String(m.month),
    interest: Math.round(m.interestCzk),
    principal: Math.round(m.principalCzk),
  }));

  return (
    <>
      <Section id="shrnuti" title="Shrnutí">
        <p className="text-sm leading-relaxed text-text-dark">
          {model.baseConclusionCs}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Vlastní hotovost vč. rezervy", formatModelCzk(model.totalOwnCashIncludingReserveCzk)],
            ["Měsíční tok", formatModelCzk(model.monthlyCashFlowCzk, 2)],
            ["Hrubý výnos", formatModelPct(model.grossYieldOnPurchase, 2)],
            ["Provozní výnos po rezervě", formatModelPct(model.operatingYieldOnAcquisition, 2)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-border bg-[#f7f9f8] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">{l}</p>
              <p className="mt-1 font-heading text-lg font-bold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="vstupy" title="Vstupy">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {(
            [
              ["Plocha", `${model.inputs.areaM2} m²`],
              ["Kupní cena", formatModelCzk(model.inputs.purchasePriceCzk)],
              ["Úpravy a vybavení", formatModelCzk(model.inputs.initialFitOutCzk)],
              ["Vedlejší náklady", formatModelCzk(model.inputs.closingCostsCzk)],
              ["Úvěr", formatModelCzk(model.inputs.loanAmountCzk)],
              ["Sazba / splatnost", `${model.inputs.annualRatePercent} % · ${model.inputs.termYears} let`],
              ["Nájem / měs.", formatModelCzk(model.inputs.monthlyRentCzk)],
              ["Výpadek / správa", `${model.inputs.vacancyRate * 100} % / ${model.inputs.managementFeeRate * 100} %`],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border/60 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="tabular-nums font-medium text-text-dark">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="naklady" title="Náklady a rozpočet vstupu">
        <p className="text-sm text-muted-foreground">
          Celková pořizovací investice {formatModelCzk(model.totalAcquisitionCostCzk)}{" "}
          nezahrnuje drženou rezervu {formatModelCzk(model.inputs.cashReserveCzk)}.
        </p>
        <ul className="space-y-1 text-sm">
          <li>Vlastní část kupní ceny: {formatModelCzk(model.equityTowardPurchaseCzk)}</li>
          <li>Úpravy: {formatModelCzk(model.inputs.initialFitOutCzk)}</li>
          <li>Vedlejší: {formatModelCzk(model.inputs.closingCostsCzk)}</li>
          <li>Oddělená hotovostní rezerva: {formatModelCzk(model.inputs.cashReserveCzk)}</li>
          <li className="font-semibold">
            Celkem vlastní hotovost:{" "}
            {formatModelCzk(model.totalOwnCashIncludingReserveCzk)}
          </li>
        </ul>
      </Section>

      <Section id="mesicni" title="Měsíční výsledek">
        <ChartShell ready={chartsReady} heightClass="h-[260px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={waterfall.map((w) => ({
                name: w.label,
                amount: Math.round(w.amountCzk * 100) / 100,
              }))}
              margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v) => formatModelCzk(Number(v), 2)} />
              <Bar dataKey="amount" name="Kč / měs.">
                {waterfall.map((w) => (
                  <Cell
                    key={w.key}
                    fill={w.amountCzk >= 0 ? "#059669" : "#dc2626"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-xs">
            <caption className="sr-only">Vodopád měsíčního výsledku</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2">Položka</th>
                <th className="py-2">Kč / měs.</th>
              </tr>
            </thead>
            <tbody>
              {model.monthlyWaterfall.map((w) => (
                <tr key={w.key} className="border-b border-border/70">
                  <td className="py-1.5">{w.label}</td>
                  <td className="py-1.5 tabular-nums font-medium">
                    {formatModelCzk(w.amountCzk, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm font-semibold tabular-nums text-text-dark">
          Výsledek: {formatModelCzk(model.monthlyCashFlowCzk, 2)} / měs. před daní
          z příjmů
        </p>
      </Section>

      <Section id="scenare" title="Scénáře">
        <p className="text-xs text-muted-foreground">
          Srovnání různých počátečních podmínek — ne predikce ani pravděpodobnost.
          Fixované: správa 5 %, ostatní náklady{" "}
          {formatModelCzk(CONTROL_OTHER_ANNUAL_COSTS_CZK)}/rok, úvěr{" "}
          {formatModelCzk(CONTROL_MODEL_INPUTS.loanAmountCzk)}, splatnost 360
          měsíců.
        </p>
        <ChartShell ready={chartsReady} heightClass="h-[240px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartScenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis width={44} />
              <ReferenceLine y={0} stroke="#1a1a1a" />
              <Tooltip formatter={(v) => formatModelCzk(Number(v), 2)} />
              <Bar dataKey="value" name="Tok / měs.">
                {chartScenarios.map((r) => (
                  <Cell key={r.name} fill={r.value >= 0 ? "#047857" : "#dc2626"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
        <div className="overflow-x-auto">
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
                  <td className="py-2 tabular-nums">{formatModelCzk(s.monthlyRentCzk)}</td>
                  <td className="py-2 tabular-nums">{s.vacancyRate * 100} %</td>
                  <td className="py-2 tabular-nums">{s.annualRatePercent} %</td>
                  <td className="py-2 tabular-nums">{formatModelCzk(s.monthlyPaymentCzk, 2)}</td>
                  <td className="py-2 tabular-nums font-semibold">
                    {formatModelCzk(s.monthlyCashFlowCzk, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-text-dark">
            Citlivost: nájem versus sazba
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Buňky = měsíční peněžní tok (Kč). Zelená jen nad nulou. Výpadek a
            správa zůstávají jako v základním modelu.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-center text-xs">
              <caption className="sr-only">
                Citlivost měsíčního toku na nájem a sazbu
              </caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 text-left">Nájem \ sazba</th>
                  {SENSITIVITY_RATES.map((r) => (
                    <th key={r} className="px-2 py-2 tabular-nums">
                      {r} %
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SENSITIVITY_RENTS.map((rent) => (
                  <tr key={rent} className="border-b border-border/70">
                    <td className="py-2 text-left tabular-nums font-medium">
                      {formatModelCzk(rent)}
                    </td>
                    {SENSITIVITY_RATES.map((rate) => {
                      const cf = sensitivityCashFlow(rent, rate);
                      const positive = cf >= 0;
                      return (
                        <td
                          key={`${rent}-${rate}`}
                          className={cn(
                            "px-2 py-2 tabular-nums",
                            positive
                              ? "bg-emerald-50 font-semibold text-emerald-800"
                              : "text-red-700"
                          )}
                        >
                          {formatModelCzk(cf, 0)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="financovani" title="Financování — prvních 12 měsíců">
        <ChartShell ready={chartsReady} heightClass="h-[240px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={amortChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis width={44} />
              <Tooltip formatter={(v) => formatModelCzk(Number(v))} />
              <Legend />
              <Bar dataKey="interest" stackId="a" fill="#c5a059" name="Úrok" />
              <Bar dataKey="principal" stackId="a" fill="#1b4d3e" name="Umoření" />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
        <p className="text-sm text-muted-foreground">
          Splacená jistina za 12 měsíců:{" "}
          <span className="font-semibold tabular-nums text-text-dark">
            {formatModelCzk(model.principalPaidFirst12MonthsCzk, 2)}
          </span>
          . Jistina není peněžní příjem na účet.
        </p>
        <div className="overflow-x-auto">
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
              {model.first12Months.map((m) => (
                <tr key={m.month} className="border-b border-border/70">
                  <td className="py-1.5 tabular-nums">{m.month}</td>
                  <td className="py-1.5 tabular-nums">
                    {formatModelCzk(m.interestCzk, 2)}
                  </td>
                  <td className="py-1.5 tabular-nums">
                    {formatModelCzk(m.principalCzk, 2)}
                  </td>
                  <td className="py-1.5 tabular-nums">
                    {formatModelCzk(m.paymentCzk, 2)}
                  </td>
                  <td className="py-1.5 tabular-nums">
                    {formatModelCzk(m.closingBalanceCzk, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="cenove" title="Cenové podmínky modelu">
        <ul className="space-y-2 text-sm text-text-dark">
          <li>
            Nájem pro nulový tok:{" "}
            <strong className="tabular-nums">
              {formatModelCzk(model.rentForZeroCashFlowCzk, 2)}
            </strong>{" "}
            / měs.
          </li>
          <li>
            Cenová hranice nulového toku při úvěru 70 % kupní ceny:{" "}
            <strong className="tabular-nums">
              {formatModelCzk(model.purchasePriceForZeroCashFlowAt70LoanCzk, 2)}
            </strong>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Není to tržní ocenění, garantovaná nákupní cena ani osobní doporučení.
          Úvěr se v tomto výpočtu mění s 70 % kupní ceny. Tok je před daní z příjmů.
        </p>
      </Section>

      <Section id="podklady" title="Podklady a rizika">
        {pkg === "premium" ? (
          <>
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">
                Šablona rozsahu podrobného rozboru — v této ukázce neprovedeno
              </p>
              <p className="mt-1 text-amber-900/90">
                Níže nejsou výsledky skutečného průzkumu ani ověření dokumentů.
                Ukazují, co by individuální práce doplnila po dodání podkladů a
                úhradě. Nevydávejte tuto sekci za hotový placený rozbor.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Potřebné podklady od vás: kupní / rezervační smlouva nebo nabídka,
              výpis SVJ / předpis plateb, nájemní smlouva (pokud existuje), LV
              (pokud máte), technické podklady nebo zápis z prohlídky. Bez nich
              nelze potvrdit vlastnictví, absenci omezení ani zjištěný stav
              oprav.
            </p>
            <EvidenceTablePremium />
            <div className="rounded-xl border border-border bg-[#f7f9f8] px-4 py-3 text-sm text-text-dark">
              <p className="font-semibold">
                Příklady otázek pro prodávajícího (individuální práce)
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Jaké jsou skutečné platby SVJ / správě domu za posledních 12 měsíců?</li>
                <li>Existují plánované investice do společných částí?</li>
                <li>Jaký je stav rozvodů, oken a střechy / jádra? (vyžaduje prohlídku)</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-text-dark">
                Rozsah modelu {formatDigitalRentgenPrice()}
              </strong>
              : rozpočet hotovosti, cash flow, scénáře, citlivost, bod zvratu a
              PDF z vašich čísel a modelových předpokladů. Automatický výklad —
              bez lidské kontroly a bez dohledání nabídek.
            </p>
            <p>
              V tomto přepínači proto neukazujeme tabulku podkladů, srovnání
              inzerátů ani otázky z prohlídky. To patří do podrobného rozboru{" "}
              {formatAnalysisPrice()} a vzniká jen skutečnou individuální prací.
            </p>
          </div>
        )}
      </Section>

      <Section id="metodika" title="Metodika">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Verze modelu: {CONTROL_MODEL_VERSION}</li>
          <li>
            Anuita z jistiny, sazby a splatnosti; provozní přebytek po rezervě =
            inkasovaný nájem − správa − ostatní roční náklady (42 000 Kč v tomto
            příkladu).
          </li>
          <li>
            Poměr úvěru ke kupní ceně není automaticky bankovní LTV. Model
            nevyslovuje závěr o schválení úvěru.
          </li>
          <li>
            V modelu není daň z příjmů, poplatky za úvěr, výnos rezervy ani náklady
            prodeje.
          </li>
        </ul>
      </Section>
    </>
  );
}

export function RentgenUkazkaView() {
  const [pkg, setPkg] = useState<PackageId>("digital");
  const [chartsReady, setChartsReady] = useState(false);
  const model = useMemo(() => runControlModel(), []);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  useEffect(() => {
    track("premium_viewed", {
      tool_id: "investicni_rentgen_ukazka",
      path: routes.investicniRentgenUkazka,
    });
  }, []);

  const selectPackage = (id: PackageId) => {
    setPkg(id);
    try {
      track("premium_cta_clicked", {
        tool_id: "investicni_rentgen_ukazka",
        cta_id: `package_${id}`,
        price_band: "premium",
      });
    } catch {
      /* analytics must not block UI */
    }
  };

  return (
    <div className="overflow-x-hidden bg-white" data-charts-ready={chartsReady ? "1" : "0"}>
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
                  "rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm",
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
              className="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-deep-teal hover:bg-[#f7f9f8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/api/rentgen-sample-pdf"
            className="inline-flex rounded-xl bg-deep-teal px-4 py-2.5 text-sm font-bold text-white"
            onClick={() =>
              track("primary_cta_clicked", {
                tool_id: "investicni_rentgen_ukazka",
                cta_id: "sample_pdf_download",
              })
            }
          >
            Stáhnout ukázkový rozbor PDF
          </a>
          <Link
            href={`${routes.investicniRentgen}#premium-objednavka`}
            className="inline-flex rounded-xl border border-deep-teal/30 px-4 py-2.5 text-sm font-bold text-deep-teal"
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

        <ModelBody model={model} pkg={pkg} chartsReady={chartsReady} />
      </div>
    </div>
  );
}
