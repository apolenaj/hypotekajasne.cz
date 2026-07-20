"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  Home,
  Shield,
  Users,
} from "lucide-react";
import { InsuranceRateCards } from "@/components/calculators/InsuranceRateCards";
import { CalculatorDisclaimer } from "@/components/calculators/CalculatorDisclaimer";
import { MortgageProductCard } from "@/components/trust/MortgageProductCard";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { LastUpdated } from "@/components/trust/LastUpdated";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sourceOfIncomeOptions,
  type IncomeSource,
  formatRatesUpdatedAt,
  getBankOfferSourceLabel,
} from "@/lib/banking";
import {
  findBankRate,
  pickBankRate,
  useBankRates,
} from "@/lib/bank-rates";
import { formatCurrency, calculateAnnuityPayment } from "@/lib/calculators";
import { formatNumber, parseFormattedNumber } from "@/lib/format";
import { missingDataLabel } from "@/lib/data/display";
import {
  calculateMortgageDecision,
  type DecisionViewId,
} from "@/lib/mortgage-decision";
import {
  MORTGAGE_PURPOSE_OPTIONS,
  type MortgagePurpose,
} from "@/lib/cnb-limits";
import { pickRate, pickRpsn, useCurrentRates } from "@/lib/rates";
import { useMortgageProducts } from "@/lib/mortgage-products";
import { routes } from "@/lib/routes";
import { DOMESTIC_BANKS } from "@/lib/banking";
import { cn } from "@/lib/utils";

function MoneyInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-text-dark">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={(e) => onChange(parseFormattedNumber(e.target.value))}
          className="h-11 pr-12 rounded-lg bg-white border-border tabular-nums"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
          Kč
        </span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-heading text-xl font-bold tabular-nums sm:text-2xl",
          accent ? "text-deep-teal" : "text-text-dark"
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-muted-foreground leading-snug">{hint}</p>
      )}
    </div>
  );
}

export function CzMortgageDecisionTool() {
  const [stepOpen, setStepOpen] = useState(false);
  const [purpose, setPurpose] =
    useState<MortgagePurpose>("owner_occupied");
  const [age, setAge] = useState(35);
  const [netIncome, setNetIncome] = useState(60_000);
  const [incomeSource, setIncomeSource] = useState<IncomeSource>("employee");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [price, setPrice] = useState(5_000_000);
  const [savings, setSavings] = useState(1_000_000);
  const [otherLiabilities, setOtherLiabilities] = useState(0);
  const [creditLimitPayments, setCreditLimitPayments] = useState(0);
  const [termYears, setTermYears] = useState(30);
  const [fixationYears, setFixationYears] = useState(5);
  const [hasInsurance, setHasInsurance] = useState(true);
  const [extraCollateral, setExtraCollateral] = useState(0);
  const [activeView, setActiveView] =
    useState<DecisionViewId>("recommended");

  const { rates, loading: ratesLoading } = useCurrentRates();
  const { bankRates, loading: bankRatesLoading } = useBankRates();
  const { products, loading: productsLoading } = useMortgageProducts();

  const rateWith = rates.rateWithInsurance;
  const rateWithout = rates.rateWithoutInsurance;
  const nominalRate = pickRate(rates, hasInsurance);
  const rpsn = pickRpsn(rates, hasInsurance);

  const decision = useMemo(
    () =>
      calculateMortgageDecision({
        purpose,
        age,
        netIncome,
        incomeSource,
        household: { adults, children },
        propertyPrice: price,
        ownFunds: savings,
        otherLiabilities,
        creditLimitPayments,
        termYears,
        fixationYears,
        hasInsurance,
        extraCollateral,
        nominalRate,
        rateWithInsurance: rateWith,
        rateWithoutInsurance: rateWithout,
        representativeApr: rpsn,
        hasValidAprExample: rpsn != null,
      }),
    [
      purpose,
      age,
      netIncome,
      incomeSource,
      adults,
      children,
      price,
      savings,
      otherLiabilities,
      creditLimitPayments,
      termYears,
      fixationYears,
      hasInsurance,
      extraCollateral,
      nominalRate,
      rateWithout,
      rpsn,
    ]
  );

  const active = decision.scenarios.find((s) => s.view === activeView)!;

  const fmt = (n: number | null | undefined) =>
    n == null || !Number.isFinite(n)
      ? missingDataLabel(null)
      : formatCurrency(n, "CZK");

  const comparisonBanks = useMemo(() => {
    return DOMESTIC_BANKS.map((bank) => {
      const row = findBankRate(bankRates, bank.name);
      const picked = row ? pickBankRate(row, hasInsurance) : null;
      const loan = active.loanAmount;
      const payment =
        picked?.rate != null && loan > 0
          ? Math.round(calculateAnnuityPayment(loan, picked.rate, termYears))
          : null;
      const total =
        payment != null ? Math.round(payment * termYears * 12) : null;
      const interest =
        total != null ? Math.max(0, total - loan) : null;
      return {
        bankName: bank.name,
        rate: picked?.rate ?? null,
        rpsn: picked?.rpsn ?? null,
        payment,
        total,
        interest,
        updatedAt: row?.updatedAt ?? null,
        sourceUrl: row?.sourceUrl ?? null,
      };
    }).filter((b) => b.rate != null);
  }, [bankRates, hasInsurance, active.loanAmount, termYears]);

  const filteredProducts = products
    .filter((p) =>
      hasInsurance
        ? p.requiredInsurance !== false
        : p.requiredInsurance !== true
    )
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Decision tool · ČR
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold text-text-dark sm:text-3xl">
          Hypoteční rozhodovací kalkulačka
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Orientační model pro srovnání scénářů.{" "}
          <strong className="font-medium text-text-dark">
            Neříkáme, že úvěr „dostanete“
          </strong>{" "}
          — schválení vždy závisí na bance a individuálním posouzení.
        </p>
      </header>

      {/* Step 1 — simple */}
      <section className="rounded-2xl border border-border bg-[#f7f8f7] p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 text-deep-teal">
          <Home className="h-5 w-5" />
          <h3 className="font-semibold text-text-dark">1. Základní vstup</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-medium">Účel</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {MORTGAGE_PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPurpose(opt.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    purpose === opt.value
                      ? "border-deep-teal bg-deep-teal/5 font-semibold text-deep-teal"
                      : "border-border bg-white text-text-dark hover:border-deep-teal/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <MoneyInput
            id="cz-price"
            label="Cena nemovitosti"
            value={price}
            onChange={setPrice}
          />
          <MoneyInput
            id="cz-savings"
            label="Vlastní zdroje"
            value={savings}
            onChange={setSavings}
          />
          <MoneyInput
            id="cz-income"
            label="Čistý měsíční příjem domácnosti"
            value={netIncome}
            onChange={setNetIncome}
          />
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Typ příjmu</Label>
            <Select
              value={incomeSource}
              onValueChange={(v) => setIncomeSource(v as IncomeSource)}
            >
              <SelectTrigger className="h-11 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourceOfIncomeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <InsuranceRateCards
          hasInsurance={hasInsurance}
          onSelect={setHasInsurance}
          rateWithInsurance={rateWith}
          rateWithoutInsurance={rateWithout}
          rpsnWithInsurance={rates.rpsnWithInsurance}
          rpsnWithoutInsurance={rates.rpsnWithoutInsurance}
          withoutRateOrientational={rates.withoutInsuranceOrientational}
          loading={ratesLoading}
        />

        <button
          type="button"
          onClick={() => setStepOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
          aria-expanded={stepOpen}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              stepOpen && "rotate-180"
            )}
          />
          {stepOpen
            ? "Skrýt podrobné vstupy"
            : "Upravit podrobnosti (věk, domácnost, závazky, splatnost…)"}
        </button>

        {stepOpen && (
          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="cz-age">Věk žadatele</Label>
              <Input
                id="cz-age"
                type="number"
                min={18}
                max={75}
                value={age}
                onChange={(e) => setAge(Number(e.target.value) || 0)}
                className="h-11 bg-white"
              />
              <p className="text-xs text-muted-foreground">
                Do 36 let model počítá s vyšším orientačním LTV (až 90 %).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Domácnost — dospělí
              </Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value) || 1)}
                className="h-11 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Domácnost — děti</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value) || 0)}
                className="h-11 bg-white"
              />
            </div>
            <MoneyInput
              id="cz-liab"
              label="Další měsíční závazky"
              value={otherLiabilities}
              onChange={setOtherLiabilities}
            />
            <MoneyInput
              id="cz-credit"
              label="Splátky kreditních limitů"
              value={creditLimitPayments}
              onChange={setCreditLimitPayments}
            />
            <MoneyInput
              id="cz-extra"
              label="Další zajištění (orientačně)"
              value={extraCollateral}
              onChange={setExtraCollateral}
            />
            <div className="space-y-1.5">
              <Label htmlFor="cz-term">Splatnost (roky)</Label>
              <Input
                id="cz-term"
                type="number"
                min={5}
                max={40}
                value={termYears}
                onChange={(e) =>
                  setTermYears(Math.min(40, Math.max(5, Number(e.target.value) || 30)))
                }
                className="h-11 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cz-fix">Fixace (roky)</Label>
              <Input
                id="cz-fix"
                type="number"
                min={1}
                max={20}
                value={fixationYears}
                onChange={(e) =>
                  setFixationYears(
                    Math.min(20, Math.max(1, Number(e.target.value) || 5))
                  )
                }
                className="h-11 bg-white"
              />
            </div>
          </div>
        )}
      </section>

      {/* 3 views */}
      <section className="space-y-4">
        <h3 className="font-heading text-xl font-bold text-text-dark">
          Tři pohledy na rozpočet
        </h3>
        <div className="grid gap-3 lg:grid-cols-3">
          {decision.scenarios.map((s) => (
            <button
              key={s.view}
              type="button"
              onClick={() => setActiveView(s.view)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                activeView === s.view
                  ? "border-deep-teal bg-deep-teal/5 ring-1 ring-deep-teal/30"
                  : "border-border bg-white hover:border-deep-teal/40"
              )}
            >
              <p className="font-semibold text-text-dark">{s.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {s.description}
              </p>
              <p className="mt-3 font-heading text-2xl font-bold tabular-nums text-deep-teal">
                {fmt(s.loanAmount)}
              </p>
              <p className="text-xs text-muted-foreground">orientační výše úvěru</p>
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="font-heading text-xl font-bold text-text-dark">
            Výsledky — {active.label}
          </h3>
          {decision.rateUsed != null ? (
            <p className="text-xs text-muted-foreground">
              Modelová sazba {decision.rateUsed.toFixed(2)} % · fixace{" "}
              {fixationYears} let
            </p>
          ) : (
            <p className="text-xs text-amber-800">
              Chybí živá sazba — splátky nelze spočítat.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="1. Výše úvěru" value={fmt(active.loanAmount)} accent />
          <Metric
            label="2. LTV"
            value={`${active.ltv} %`}
            hint={`Orientační strop ČNB v modelu: ${decision.maxLtvPercent} %`}
          />
          <Metric
            label="3. Orientační splátka"
            value={fmt(active.monthlyPayment)}
          />
          <Metric label="4. Celkem zaplaceno" value={fmt(active.totalPaid)} />
          <Metric label="5. Celkové úroky" value={fmt(active.totalInterest)} />
          <Metric
            label="6. Náklady pojištění / měs."
            value={fmt(active.insuranceMonthly)}
            hint="Jen pokud je sazba s pojištěním vyšší; jinak pojistné na vyžádání"
          />
          <Metric
            label="7. RPSN"
            value={
              decision.rpsn != null
                ? `${decision.rpsn.toFixed(2)} %`
                : missingDataLabel(null)
            }
            hint="Jen reprezentativní RPSN ze zdroje — ne univerzální"
          />
          <Metric
            label="9. Bezpečná rezerva domácnosti"
            value={fmt(active.householdReserve)}
            hint="Příjem − splátka − závazky − orientační životní náklady"
            accent
          />
        </div>

        {/* Stress */}
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h4 className="font-semibold text-text-dark">
            8. Stres test sazby (+1 / +2 / +3 p.b.)
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Orientační splátka při růstu sazby po fixaci — na doporučeném úvěru.
          </p>
          {decision.stressTests.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {missingDataLabel(null)}
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {decision.stressTests.map((t) => (
                <div
                  key={t.rateBumpPp}
                  className="rounded-lg border border-border bg-[#f7f8f7] px-3 py-3"
                >
                  <p className="text-xs text-muted-foreground">
                    +{t.rateBumpPp} p.b. → {t.rate.toFixed(2)} %
                  </p>
                  <p className="mt-1 font-heading text-lg font-bold tabular-nums text-text-dark">
                    {fmt(t.monthlyPayment)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {active.dstiRatio != null && active.dstiRatio >= 0.4 && (
          <div
            role="status"
            className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Orientační DSTI {(active.dstiRatio * 100).toFixed(0)} % — banky
              často interně sledují zátěž kolem 40–45 %. Neznamená to automatické
              zamítnutí ani schválení.
            </p>
          </div>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          {decision.disclaimer}
        </p>
      </section>

      {/* Bank comparison */}
      <section className="space-y-3">
        <h3 className="font-heading text-xl font-bold text-text-dark">
          Srovnání produktů bank
        </h3>
        <p className="text-sm text-muted-foreground">
          Orientační splátka a celkové náklady při výši úvěru z aktivního pohledu
          ({fmt(active.loanAmount)}). Nejde o závaznou nabídku.
        </p>

        {bankRatesLoading ? (
          <p className="text-sm text-muted-foreground">Načítám sazby…</p>
        ) : comparisonBanks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Živé sazby bank zatím nejsou k dispozici.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {comparisonBanks.map((b) => (
              <li
                key={b.bankName}
                className="rounded-xl border border-border bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-text-dark">{b.bankName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getBankOfferSourceLabel(b.bankName)}
                    </p>
                  </div>
                  <DataStatusBadge status="LIVE" />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Sazba</dt>
                    <dd className="font-bold tabular-nums text-deep-teal">
                      {b.rate != null
                        ? `${b.rate.toFixed(2)} %`
                        : missingDataLabel(null)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">RPSN</dt>
                    <dd className="font-semibold tabular-nums">
                      {b.rpsn != null
                        ? `${b.rpsn.toFixed(2)} %`
                        : missingDataLabel(null)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Splátka</dt>
                    <dd className="font-semibold tabular-nums">{fmt(b.payment)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Celkové náklady
                    </dt>
                    <dd className="font-semibold tabular-nums">{fmt(b.total)}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted-foreground">
                  Podmínky: {hasInsurance ? "s pojištěním" : "bez pojištění"} ·
                  splatnost {termYears} let · fixace v modelu {fixationYears}{" "}
                  let
                </p>
                <div className="mt-2">
                  <LastUpdated at={b.updatedAt} status="LIVE" />
                </div>
                {b.sourceUrl && (
                  <a
                    href={b.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-deep-teal underline-offset-2 hover:underline"
                  >
                    Zdroj banky →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {!productsLoading && filteredProducts.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredProducts.map((p) => (
              <MortgageProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-deep-teal/20 bg-deep-teal px-5 py-6 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-muted-gold">
              <BadgeCheck className="h-4 w-4" />
              Další krok
            </p>
            <h3 className="mt-1 font-heading text-xl font-bold sm:text-2xl">
              Nechat výsledek ověřit licencovaným specialistou
            </h3>
            <p className="mt-2 text-sm text-white/80">
              Model vám ukáže orientační rámec. Specialista ověří bonitu,
              dokumenty a reálné nabídky bank — bez příslibu schválení z této
              kalkulačky.
            </p>
          </div>
          <Link
            href={routes.navrhNaMiru}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-muted-gold px-6 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ověřit výsledek →
          </Link>
        </div>
      </section>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <CalculatorDisclaimer />
          <p className="mt-1">{formatRatesUpdatedAt(rates.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
