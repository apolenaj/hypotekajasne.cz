"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  packageQueryValue,
  rentgenPrimaryCtaLabel,
  samplePackageFromQuery,
  type RentgenSamplePackageId,
} from "@/lib/property-rentgen";
import {
  buildMonthlyWaterfallSteps,
  RentgenScenarioBars,
  RentgenWaterfallChart,
} from "@/components/property-rentgen/RentgenCharts";
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

const SENSITIVITY_RENTS = [18_000, 19_000, 20_000, 21_000, 22_000] as const;
const SENSITIVITY_RATES = [3.8, 4.8, 5.8, 6.8] as const;

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
  const scenarios = useMemo(() => runControlScenarios(), []);
  const waterfallSteps = useMemo(
    () => buildMonthlyWaterfallSteps(model.monthlyWaterfall),
    [model.monthlyWaterfall]
  );
  const scenarioRows = scenarios.map((s) => ({
    id: s.id,
    label: s.label,
    valueCzk: s.monthlyCashFlowCzk,
    assumptions: `Nájem ${formatModelCzk(s.monthlyRentCzk, 0)} · výpadek ${(s.vacancyRate * 100).toLocaleString("cs-CZ")} % · sazba ${s.annualRatePercent.toLocaleString("cs-CZ")} %`,
    emphasize: s.id === "base",
  }));

  return (
    <>
      <Section id="shrnuti" title="Shrnutí">
        <p className="text-lg font-semibold text-text-dark">
          {cashFlowHeadline(model.monthlyCashFlowCzk)}
        </p>
        <p className="text-sm leading-relaxed text-text-dark">
          {model.baseConclusionCs}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Vlastní hotovost vč. rezervy",
              formatModelCzk(model.totalOwnCashIncludingReserveCzk),
            ],
            ["Měsíční tok", formatModelCzk(model.monthlyCashFlowCzk, 0)],
            ["Hrubý výnos z kupní ceny", formatModelPct(model.grossYieldOnPurchase, 2)],
            [
              "Provozní výnos z pořízení",
              formatModelPct(model.operatingYieldOnAcquisition, 2),
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
          {formatModelCzk(model.totalAcquisitionCostCzk)}. Tok je před daní z
          příjmů.
        </p>
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
              [
                "Sazba / splatnost",
                `${model.inputs.annualRatePercent} % · ${model.inputs.termYears} let`,
              ],
              ["Nájem bez záloh / měs.", formatModelCzk(model.inputs.monthlyRentCzk)],
              [
                "Výpadek / správa",
                `${model.inputs.vacancyRate * 100} % / ${model.inputs.managementFeeRate * 100} %`,
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
          Celková pořizovací investice {formatModelCzk(model.totalAcquisitionCostCzk)}{" "}
          nezahrnuje drženou rezervu {formatModelCzk(model.inputs.cashReserveCzk)}.
        </p>
        <ul className="space-y-1 text-sm">
          <li>
            Vlastní část kupní ceny:{" "}
            {formatModelCzk(model.equityTowardPurchaseCzk)}
          </li>
          <li>Úpravy: {formatModelCzk(model.inputs.initialFitOutCzk)}</li>
          <li>Vedlejší: {formatModelCzk(model.inputs.closingCostsCzk)}</li>
          <li>
            Oddělená hotovostní rezerva:{" "}
            {formatModelCzk(model.inputs.cashReserveCzk)}
          </li>
          <li className="font-semibold">
            Celkem vlastní hotovost:{" "}
            {formatModelCzk(model.totalOwnCashIncludingReserveCzk)}
          </li>
        </ul>
      </Section>

      <Section id="mesicni" title="Měsíční výsledek">
        <p className="text-base font-semibold text-text-dark">
          {cashFlowHeadline(model.monthlyCashFlowCzk)}
        </p>
        <RentgenWaterfallChart steps={waterfallSteps} />
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
              {model.monthlyWaterfall.map((w) => (
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
          Výsledek: {formatModelCzk(model.monthlyCashFlowCzk, 0)} / měs. před
          daní z příjmů
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
        <RentgenScenarioBars rows={scenarioRows} />
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
        <p className="text-sm text-muted-foreground">
          Splacená jistina za 12 měsíců:{" "}
          <span className="font-semibold tabular-nums text-text-dark">
            {formatModelCzk(model.principalPaidFirst12MonthsCzk, 0)}
          </span>
          . Jistina není peněžní příjem na účet.
        </p>
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
                {model.first12Months.map((m) => (
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
              {formatModelCzk(model.rentForZeroCashFlowCzk, 0)}
            </strong>{" "}
            / měs.
          </li>
          <li>
            Cenová hranice nulového toku při úvěru 70 % kupní ceny:{" "}
            <strong className="tabular-nums">
              {formatModelCzk(model.purchasePriceForZeroCashFlowAt70LoanCzk, 0)}
            </strong>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Není to tržní ocenění, garantovaná nákupní cena ani osobní doporučení.
          Úvěr se v tomto výpočtu mění s 70 % kupní ceny. Tok je před daní z
          příjmů.
        </p>
      </Section>

      <Section id="podklady" title="Podklady a rizika">
        {pkg === "premium" ? (
          <>
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">
                Ukázka rozsahu individuálního rozboru — v této ukázce
                neprovedeno
              </p>
              <p className="mt-1 text-amber-900/90">
                Níže nejsou výsledky skutečného průzkumu ani ověření dokumentů.
                Ukazují strukturu zjištění po dodání podkladů. Nevydávejte tuto
                sekci za hotový placený rozbor.
              </p>
            </div>
            <p className="text-sm font-semibold text-text-dark">
              Co individuální rozbor přidává oproti automatickému modelu
            </p>
            <div className="space-y-3">
              <FindingCard
                podklad="Veřejné inzeráty v lokalitě (se zdrojem a datem)"
                zjisteni="V ukázce neprovedeno — při reálném rozboru doplníme srovnání nabídek."
                dopad="Bez srovnání nelze posoudit, zda je zadaný nájem a cena realistické."
                proverit="Aktuální nabídkové nájmy a prodejní ceny ve stejném segmentu."
              />
              <FindingCard
                podklad="Dodané doklady (smlouva, předpis SVJ, nájemní smlouva…)"
                zjisteni="V ukázce neprovedeno — rozsah závisí na tom, co skutečně dodáte."
                dopad="Chybějící podklady = neověřené předpoklady příjmů a výdajů."
                proverit="Skutečné platby SVJ, plánované investice, stav bytu."
              />
              <FindingCard
                podklad="Model cash flow z vašich čísel"
                zjisteni="Stejný automatický model jako u výstupu za 999 Kč."
                dopad="Individuální komentář vysvětlí citlivá místa modelu."
                proverit="Otázky k prodávajícímu a bankovní podmínky."
              />
            </div>
            <EvidenceTablePremium />
          </>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-text-dark">
                Rozsah výstupu za {formatDigitalRentgenPrice()}
              </strong>
              : rozpočet hotovosti, cash flow, scénáře, citlivost, bod zvratu a
              PDF z vašich čísel a modelových předpokladů. Automatický výklad —
              bez dohledání nabídek a bez rozboru dokumentů.
            </p>
            <p>
              Přepněte na výstup za {formatAnalysisPrice()}, abyste viděli
              strukturu individuálních zjištění (podklad → zjištění → dopad → co
              prověřit).
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
            {formatModelCzk(CONTROL_OTHER_ANNUAL_COSTS_CZK)} v tomto příkladu).
          </li>
          <li>
            Poměr úvěru ke kupní ceně není automaticky bankovní LTV. Model
            nevyslovuje závěr o schválení úvěru.
          </li>
          <li>
            V modelu není daň z příjmů, poplatky za úvěr, výnos rezervy ani
            náklady prodeje.
          </li>
        </ul>
      </Section>
    </>
  );
}

export function RentgenUkazkaView() {
  const searchParams = useSearchParams();
  const [pkg, setPkg] = useState<RentgenSamplePackageId>(() =>
    samplePackageFromQuery(searchParams.get("balicek"))
  );
  const model = useMemo(() => runControlModel(), []);

  useEffect(() => {
    setPkg(samplePackageFromQuery(searchParams.get("balicek")));
  }, [searchParams]);

  useEffect(() => {
    track("premium_viewed", {
      tool_id: "investicni_rentgen_ukazka",
      path: routes.investicniRentgenUkazka,
    });
  }, []);

  const selectPackage = (id: RentgenSamplePackageId) => {
    setPkg(id);
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
                  ? `Individuální rozbor (${formatAnalysisPrice()})`
                  : `Investiční rentgen (${formatDigitalRentgenPrice()})`}
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
            href="/api/rentgen-sample-pdf"
            className="inline-flex rounded-xl bg-deep-teal px-4 py-2.5 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-gold"
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

        <ModelBody model={model} pkg={pkg} />
      </div>
    </div>
  );
}
