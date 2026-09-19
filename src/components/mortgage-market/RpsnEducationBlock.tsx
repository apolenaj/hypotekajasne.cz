/**
 * Total-cost education. Numbers come from the verified representative
 * example — the section does not invent insurance prices or bank fees.
 */

import { CostInfoTip } from "@/components/mortgage-market/CostInfoTip";
import { formatCheckedDateCs } from "@/lib/mortgage-market/public-labels";
import {
  afterFixationLabel,
  buildMonetaRepresentativeComparison,
  firstFixationPeriodLabel,
  fixationLengthLabel,
  fixationVerdictHeadline,
  yearCountLabel,
  type FixationComparison,
  type FixationVariantSnapshot,
} from "@/lib/mortgage-market/fixation-cost-comparison";
import { formatMoney, formatRate } from "@/lib/money";

const TIPS = {
  rate: "Cena, kterou banka účtuje za vypůjčené peníze. Sama o sobě nezahrnuje všechny další náklady.",
  apr: "Ukazatel, který do ročních nákladů úvěru zahrnuje úrok a vybrané další náklady spojené s úvěrem. Zde je to hodnota z příkladu banky, ne náš přepočet.",
  totalCost:
    "V tomto porovnání zahrnujeme úroky, relevantní poplatky a doplňkové služby. Splacená jistina je zobrazena samostatně.",
  fixationCost:
    "Součet úroků, pojištění a poplatků za dobu fixace. Jistina se do nich nepočítá, protože jejím splácením vzniká vlastní kapitál.",
  balance:
    "Kolik jistiny zbývá splatit po skončení fixace. Není to náklad — je to dluh, který se dál splácí.",
} as const;

function percentPoints(value: number): string {
  return `${value.toLocaleString("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}\u00a0p.\u00a0b.`;
}

function variantName(variant: string): string {
  return variant.charAt(0).toLocaleLowerCase("cs") + variant.slice(1);
}

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
}: {
  variant: FixationVariantSnapshot;
  cheaper: boolean;
}) {
  const period = firstFixationPeriodLabel(variant.fixationMonths);
  const monthlyParts = [
    `splátka ${formatMoney(variant.monthlyMortgagePayment)}`,
    `pojištění ${formatMoney(variant.monthlyInsurance)}`,
  ];
  if (variant.monthlyAdditionalCosts > 0) {
    monthlyParts.push(
      `další náklady ${formatMoney(variant.monthlyAdditionalCosts)}`
    );
  }

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-white p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {variant.bank}
      </p>
      <h3 className="mt-1 font-heading text-xl font-semibold text-text-dark">
        {variant.variant}
      </h3>
      {cheaper ? (
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-deep-teal">
          Nižší náklady v tomto příkladu
        </p>
      ) : null}

      <div className="mt-5">
        <p className="text-xs text-muted-foreground">Celkový měsíční výdaj</p>
        <p className="mt-1 font-heading text-3xl font-bold tabular-nums tracking-tight text-text-dark">
          {formatMoney(variant.totalMonthlyOutflow)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {monthlyParts.join(" + ")}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4">
        <div>
          <dt className="text-xs text-muted-foreground">
            <LabelWithTip
              label="Úroková sazba"
              tip={TIPS.rate}
              tipLabel="Vysvětlení úrokové sazby"
            />
          </dt>
          <dd className="mt-0.5 font-heading text-lg font-semibold tabular-nums text-text-dark">
            {formatRate(variant.rate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            <LabelWithTip
              label="RPSN"
              tip={TIPS.apr}
              tipLabel="Vysvětlení RPSN"
            />
          </dt>
          <dd className="mt-0.5 font-heading text-lg font-semibold tabular-nums text-text-dark">
            {formatRate(variant.apr)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            Měsíční splátka hypotéky
          </dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-text-dark">
            {formatMoney(variant.monthlyMortgagePayment)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Pojištění</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-text-dark">
            {formatMoney(variant.monthlyInsurance)} / měsíc
          </dd>
        </div>
        {variant.monthlyAdditionalCosts > 0 ? (
          <div>
            <dt className="text-xs text-muted-foreground">
              Další povinné náklady
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-text-dark">
              {formatMoney(variant.monthlyAdditionalCosts)} / měsíc
            </dd>
          </div>
        ) : null}
        {variant.oneOffCosts > 0 ? (
          <div>
            <dt className="text-xs text-muted-foreground">
              Jednorázové náklady
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-text-dark">
              {formatMoney(variant.oneOffCosts)}
            </dd>
          </div>
        ) : null}
      </dl>

      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="min-w-0 text-muted-foreground">Zaplacené úroky {period}</dt>
          <dd className="shrink-0 font-medium tabular-nums text-text-dark">
            {formatMoney(variant.interestDuringFixation)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="min-w-0 text-muted-foreground">
            Zaplacené pojištění {period}
          </dt>
          <dd className="shrink-0 font-medium tabular-nums text-text-dark">
            {formatMoney(variant.insuranceDuringFixation)}
          </dd>
        </div>
        {variant.feesDuringFixation > 0 ? (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="min-w-0 text-muted-foreground">Poplatky {period}</dt>
            <dd className="shrink-0 font-medium tabular-nums text-text-dark">
              {formatMoney(variant.feesDuringFixation)}
            </dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-4">
          <dt className="min-w-0 text-muted-foreground">
            <LabelWithTip
              label={`Zůstatek hypotéky ${afterFixationLabel(variant.fixationMonths)}`}
              tip={TIPS.balance}
              tipLabel="Vysvětlení zůstatku hypotéky"
            />
          </dt>
          <dd className="shrink-0 font-medium tabular-nums text-text-dark">
            {formatMoney(variant.remainingPrincipalAfterFixation)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl bg-[#f7f8f7] px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <LabelWithTip
            label={`Celkové náklady ${period}`}
            tip={TIPS.totalCost}
            tipLabel="Vysvětlení celkových nákladů"
          />
        </p>
        <p className="mt-1 font-heading text-2xl font-bold tabular-nums tracking-tight text-text-dark">
          {formatMoney(variant.totalCostDuringFixation)}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Úroky + pojištění + poplatky. Jistina se nepočítá.
        </p>
      </div>
    </article>
  );
}

function CostBreakdown({ comparison }: { comparison: FixationComparison }) {
  const maxCost = Math.max(
    ...comparison.variants.map((variant) => variant.totalCostDuringFixation)
  );
  const showFees = comparison.variants.some(
    (variant) => variant.feesDuringFixation > 0
  );
  const showInsurance = comparison.variants.some(
    (variant) => variant.insuranceDuringFixation > 0
  );
  const period = firstFixationPeriodLabel(
    comparison.assumptions.fixationMonths
  );

  return (
    <div className="mt-4 rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h3 className="font-heading text-lg font-semibold text-text-dark">
        <LabelWithTip
          label={`Náklady ${period}`}
          tip={TIPS.fixationCost}
          tipLabel="Vysvětlení grafu nákladů"
        />
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Každý pruh je složený z úroků, pojištění a poplatků. Jistina v grafu
        není.
      </p>
      <div className="mt-5 space-y-4">
        {comparison.variants.map((variant) => (
          <CostBar key={variant.id} variant={variant} maxCost={maxCost} />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-deep-teal" aria-hidden />
          Úroky
        </li>
        {showInsurance ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-muted-gold" aria-hidden />
            Pojištění
          </li>
        ) : null}
        {showFees ? (
          <li className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-sm bg-deep-teal-light"
              aria-hidden
            />
            Poplatky
          </li>
        ) : null}
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
    {
      key: "fees",
      label: "Poplatky",
      amount: variant.feesDuringFixation,
      className: "bg-deep-teal-light",
    },
  ].filter((part) => part.amount > 0);

  const summary = parts
    .map((part) => `${part.label} ${formatMoney(part.amount)}`)
    .join(", ");

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-text-dark">{variant.variant}</p>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-text-dark">
          {formatMoney(total)}
        </p>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-light-gray"
        role="img"
        aria-label={`${variant.variant}: ${summary}. Součet ${formatMoney(total)}.`}
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
    </div>
  );
}

function ComparisonVerdict({
  comparison,
}: {
  comparison: FixationComparison;
}) {
  const cheaper = comparison.variants.find(
    (variant) => variant.id === comparison.cheaperId
  );
  const period = firstFixationPeriodLabel(
    comparison.assumptions.fixationMonths
  );

  return (
    <div className="mt-4 rounded-2xl border border-deep-teal/20 bg-white p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
        Porovnání
      </p>
      <h3 className="mt-2 font-heading text-xl font-bold tracking-tight text-text-dark sm:text-2xl">
        {fixationVerdictHeadline(comparison)}
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {comparison.variants.map((variant) => (
          <li key={variant.id} className="text-sm text-text-dark">
            <span className="text-muted-foreground">
              Varianta {variantName(variant.variant)}
            </span>
            <span className="mt-0.5 block font-semibold tabular-nums">
              {formatRate(variant.rate)} úrok
            </span>
          </li>
        ))}
      </ul>
      {cheaper ? (
        <p className="mt-4 text-base leading-relaxed text-text-dark sm:text-lg">
          Po započtení pojištění a dalších nákladů je varianta{" "}
          {variantName(cheaper.variant)} v tomto modelovém příkladu{" "}
          <span className="font-heading font-bold text-deep-teal">
            o {formatMoney(comparison.fixationCostDeltaCzk)} levnější
          </span>{" "}
          {period}.
        </p>
      ) : (
        <p className="mt-4 text-base leading-relaxed text-text-dark">
          Po započtení pojištění a dalších nákladů vycházejí obě varianty v
          tomto modelovém příkladu stejně.
        </p>
      )}
      <dl className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Rozdíl měsíčně</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-text-dark">
            {formatMoney(comparison.monthlyOutflowDeltaCzk)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            Rozdíl za dobu fixace
          </dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-text-dark">
            {formatMoney(comparison.fixationCostDeltaCzk)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Rozdíl RPSN</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-text-dark">
            {percentPoints(comparison.rpsnDeltaPercentagePoints)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function RpsnEducationBlock() {
  const comparison = buildMonetaRepresentativeComparison();
  const assumptions = comparison?.assumptions;

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
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Nejnižší úrok nemusí znamenat nejnižší náklady
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sazba je pouze část příběhu. Porovnávejte splátku, RPSN, pojištění,
            poplatky a náklady za celé fixační období.
          </p>
        </div>

        {comparison && assumptions ? (
          <>
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
                  label="Fixace"
                  value={fixationLengthLabel(assumptions.fixationMonths)}
                />
                <AssumptionChip
                  label="LTV"
                  value={
                    assumptions.ltvPercent == null
                      ? "neuvedeno"
                      : `${assumptions.ltvPercent.toLocaleString("cs-CZ")}\u00a0%`
                  }
                />
              </ul>
              <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                Reprezentativní příklad {comparison.bank === "MONETA" ? "MONETA Money Bank" : comparison.bank}, ověřeno{" "}
                {formatCheckedDateCs(comparison.checkedAt)}. Sazba, RPSN,
                splátka a pojištění jsou hodnoty z tohoto příkladu — ne
                individuální nabídka a ne samostatný ceník.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {comparison.variants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  cheaper={variant.id === comparison.cheaperId}
                />
              ))}
            </div>

            <ComparisonVerdict comparison={comparison} />
            <CostBreakdown comparison={comparison} />
          </>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Reprezentativní příklad se nepodařilo načíst.
          </p>
        )}

        <div className="mt-6 max-w-3xl">
          <h3 className="font-heading text-lg font-semibold text-text-dark">
            Proč může být vyšší úrok levnější?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Banka může za sjednání doplňkové služby nabídnout nižší úrokovou
            sazbu. Cena této služby ale může být vyšší než úspora na úrocích.
            Proto u HypotékaJasně.cz porovnáváme nejen sazbu, ale také RPSN a
            skutečné náklady.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Jde o modelový reprezentativní příklad sloužící k vysvětlení vlivu
            úrokové sazby, RPSN, pojištění a dalších nákladů. Konkrétní nabídka
            a náklady se mohou lišit podle banky, bonity klienta, LTV, délky
            fixace, sjednaných služeb a aktuálních podmínek.
          </p>
        </div>
      </div>
    </section>
  );
}
