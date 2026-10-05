/**
 * Homepage RPSN / total-cost education.
 * Model A/B only — not a bank offer. No bank branding.
 */

import Link from "next/link";

import { CostInfoTip } from "@/components/mortgage-market/CostInfoTip";
import {
  firstFixationPeriodLabel,
  fixationLengthLabel,
  yearCountLabel,
  type FixationComparison,
  type FixationVariantSnapshot,
} from "@/lib/mortgage-market/fixation-cost-comparison";
import { buildRpsnEducationComparison } from "@/lib/mortgage-market/rpsn-education-model";
import { formatMoney, formatRate } from "@/lib/money";
import { routes } from "@/lib/routes";
import { CTA_PRIMARY_CLASS } from "@/lib/ux/cta";

const TIPS = {
  rate: "Cena, kterou věřitel účtuje za vypůjčené peníze. Sama o sobě nezahrnuje všechny další náklady.",
  apr: "Roční procentní sazba nákladů zohledňuje úrok a vybrané další náklady spojené s úvěrem. Zde jde o modelový výpočet z měsíční splátky a povinného pojištění, ne o údaj konkrétní banky.",
  totalCost:
    "V tomto porovnání zahrnujeme úroky a povinné pojištění. Splacená jistina se do nákladů nepočítá.",
  fixationCost:
    "Součet úroků a pojištění za dobu porovnání. Jistina se do nich nepočítá, protože jejím splácením vzniká vlastní kapitál.",
} as const;

function LabelWithTip({
  label,
  tip,
  tipLabel,
}: {
  label: string;
  tip: string;
  tipLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      <CostInfoTip label={tipLabel} text={tip} />
    </span>
  );
}

function AssumptionChip({ label, value }: { label: string; value: string }) {
  return (
    <li className="inline-flex items-baseline gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-text-dark">{value}</span>
    </li>
  );
}

function VariantCard({
  variant,
  cheaper,
  lowerRateId,
}: {
  variant: FixationVariantSnapshot;
  cheaper: boolean;
  lowerRateId: string;
}) {
  const isLowerRate = variant.id === lowerRateId;
  const hasInsurance = variant.monthlyInsurance > 0;

  return (
    <article
      className={`flex min-w-0 flex-col rounded-2xl border bg-white p-5 sm:p-6 ${
        cheaper
          ? "border-deep-teal/35 shadow-[0_0_0_1px_rgba(15,118,110,0.08)]"
          : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {isLowerRate ? "Nižší úrok" : "Vyšší úrok"}
          </p>
          <h3 className="mt-1 font-heading text-xl font-semibold text-text-dark">
            {variant.variant}
          </h3>
        </div>
        {cheaper ? (
          <p className="rounded-full bg-deep-teal/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-deep-teal">
            Levnější v tomto příkladu
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#f7f8f7] px-3 py-3">
          <p className="text-xs text-muted-foreground">
            <LabelWithTip
              label="Úrok"
              tip={TIPS.rate}
              tipLabel="Vysvětlení úrokové sazby"
            />
          </p>
          <p
            className={`mt-1 font-heading text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${
              isLowerRate ? "text-deep-teal" : "text-text-dark"
            }`}
          >
            {formatRate(variant.rate)}
          </p>
        </div>
        <div className="rounded-xl bg-[#f7f8f7] px-3 py-3">
          <p className="text-xs text-muted-foreground">
            <LabelWithTip
              label="RPSN"
              tip={TIPS.apr}
              tipLabel="Vysvětlení RPSN"
            />
          </p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark sm:text-3xl">
            {formatRate(variant.apr)}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="min-w-0 text-muted-foreground">Splátka hypotéky</dt>
          <dd className="shrink-0 font-semibold tabular-nums text-text-dark">
            {formatMoney(variant.monthlyMortgagePayment)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="min-w-0 text-muted-foreground">
            {hasInsurance ? "Povinné pojištění" : "Pojištění"}
          </dt>
          <dd className="shrink-0 font-semibold tabular-nums text-text-dark">
            {hasInsurance
              ? `${formatMoney(variant.monthlyInsurance)} / měsíc`
              : "Bez povinného pojištění"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="min-w-0 text-muted-foreground">
            Celkový měsíční výdaj
          </dt>
          <dd className="shrink-0 font-semibold tabular-nums text-text-dark">
            {formatMoney(variant.totalMonthlyOutflow)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl border border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <LabelWithTip
            label="Celkové náklady za 3 roky"
            tip={TIPS.totalCost}
            tipLabel="Vysvětlení celkových nákladů"
          />
        </p>
        <p className="mt-1 font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark">
          {formatMoney(variant.totalCostDuringFixation)}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Úroky {formatMoney(variant.interestDuringFixation)}
          {hasInsurance
            ? ` + pojištění ${formatMoney(variant.insuranceDuringFixation)}`
            : " · bez pojištění"}
        </p>
      </div>
    </article>
  );
}

function CostBreakdown({ comparison }: { comparison: FixationComparison }) {
  const maxCost = Math.max(
    ...comparison.variants.map((variant) => variant.totalCostDuringFixation)
  );
  const period = firstFixationPeriodLabel(
    comparison.assumptions.fixationMonths
  );

  return (
    <div className="mt-4 rounded-2xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-text-dark">
            <LabelWithTip
              label={`Náklady ${period}`}
              tip={TIPS.fixationCost}
              tipLabel="Vysvětlení grafu nákladů"
            />
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pruhy ukazují úroky a pojištění. Jistina v grafu není.
          </p>
        </div>
        <p className="text-sm font-semibold text-deep-teal">
          Rozdíl {formatMoney(comparison.fixationCostDeltaCzk)}
        </p>
      </div>
      <div className="mt-5 space-y-5">
        {comparison.variants.map((variant) => (
          <CostBar key={variant.id} variant={variant} maxCost={maxCost} />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-deep-teal" aria-hidden />
          Úroky
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-muted-gold" aria-hidden />
          Pojištění
        </li>
      </ul>
    </div>
  );
}

function CostBar({
  variant,
  maxCost,
}: {
  variant: FixationVariantSnapshot;
  maxCost: number;
}) {
  const total = variant.totalCostDuringFixation;
  const scale = maxCost > 0 ? (total / maxCost) * 100 : 0;
  const parts = [
    {
      key: "interest",
      label: "Úroky",
      amount: variant.interestDuringFixation,
      className: "bg-deep-teal",
    },
    {
      key: "insurance",
      label: "Pojištění",
      amount: variant.insuranceDuringFixation,
      className: "bg-muted-gold",
    },
  ].filter((part) => part.amount > 0);

  const summary = parts
    .map((part) => `${part.label} ${formatMoney(part.amount)}`)
    .join(", ");

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-text-dark">{variant.variant}</p>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-text-dark">
          {formatMoney(total)}
        </p>
      </div>
      <div
        className="h-4 w-full overflow-hidden rounded-full bg-light-gray"
        role="img"
        aria-label={`${variant.variant}: ${summary || "bez pojištění"}. Součet ${formatMoney(total)}.`}
      >
        <div className="flex h-full min-w-0" style={{ width: `${scale}%` }}>
          {parts.map((part) => (
            <CostInfoTip
              key={part.key}
              label={`${variant.variant}: ${part.label}`}
              text={`${part.label}: ${formatMoney(part.amount)}. Součet: ${formatMoney(total)}.`}
              className={part.className}
              style={{
                width: total > 0 ? `${(part.amount / total) * 100}%` : "0%",
              }}
            >
              <span className="sr-only">
                {part.label} {formatMoney(part.amount)}
              </span>
            </CostInfoTip>
          ))}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {summary || "Pouze úroky · bez pojištění"}
      </p>
    </div>
  );
}

function ComparisonVerdict({
  comparison,
}: {
  comparison: FixationComparison;
}) {
  const period = firstFixationPeriodLabel(
    comparison.assumptions.fixationMonths
  );

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-deep-teal/25 bg-deep-teal px-5 py-6 text-white sm:px-8 sm:py-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
        Wow moment tohoto příkladu
      </p>
      <h3 className="mt-3 max-w-3xl font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        Vyšší úrok. Přesto ušetříte{" "}
        <span className="block text-muted-gold sm:inline">
          {formatMoney(comparison.fixationCostDeltaCzk)}
        </span>{" "}
        za 3&nbsp;roky.
      </h3>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
        Nabídka B má o 0,20 procentního bodu vyšší úrok, ale díky nižším
        celkovým nákladům vychází {period} levněji.
      </p>
    </div>
  );
}

export function RpsnEducationBlock() {
  const comparison = buildRpsnEducationComparison();
  const assumptions = comparison.assumptions;

  return (
    <section
      aria-labelledby="rpsn-edu-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Celková cena
          </p>
          <h2
            id="rpsn-edu-heading"
            className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl"
          >
            Nižší úrok nemusí znamenat levnější hypotéku
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Rozdíl několika desetin procenta v úroku může klamat. Důležitější
            je, kolik za hypotéku skutečně zaplatíte.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-text-dark">
            Modelový příklad
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            <AssumptionChip
              label="Výše hypotéky"
              value={formatMoney(assumptions.principalCzk)}
            />
            <AssumptionChip
              label="Splatnost"
              value={yearCountLabel(assumptions.termYears)}
            />
            <AssumptionChip
              label="Porovnání"
              value={fixationLengthLabel(assumptions.fixationMonths)}
            />
          </ul>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {comparison.variants.map((variant) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              cheaper={variant.id === comparison.cheaperId}
              lowerRateId={comparison.lowerRateId}
            />
          ))}
        </div>

        <ComparisonVerdict comparison={comparison} />
        <CostBreakdown comparison={comparison} />

        <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-white p-5 sm:p-6">
          <h3 className="font-heading text-lg font-semibold text-text-dark">
            Úrok není všechno
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Úroková sazba říká, kolik platíte bance za půjčené peníze. RPSN
            zahrnuje i další povinné náklady spojené s úvěrem, a proto může
            lépe ukázat skutečnou cenu nabídky.
          </p>
          <p className="mt-4 rounded-xl bg-deep-teal/5 px-4 py-3 text-sm font-medium leading-relaxed text-text-dark">
            Při porovnávání hypoték nesledujte pouze úrok. Porovnávejte také
            RPSN, povinné produkty a skutečné náklady.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href={routes.sazby}
            className={CTA_PRIMARY_CLASS}
            aria-label="Porovnat nabídky hypoték"
          >
            Porovnat nabídky hypoték
          </Link>
          <p className="max-w-md text-sm text-muted-foreground">
            Pomůžeme vám porovnat nejen sazbu, ale i skutečné náklady.
          </p>
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Modelový příklad. Skutečné RPSN a celkové náklady se mohou lišit
          podle konkrétní banky, poplatků, povinných doplňkových služeb, délky
          fixace a individuálních podmínek klienta.
        </p>
      </div>
    </section>
  );
}
