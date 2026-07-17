"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  Building2,
  Calculator,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { CalculatorDisclaimer } from "@/components/calculators/CalculatorDisclaimer";
import { InfoTooltip } from "@/components/calculators/InfoTooltip";
import { InsuranceRateCards } from "@/components/calculators/InsuranceRateCards";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { RpsnDisplay } from "@/components/calculators/RpsnDisplay";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
  findBankRate,
  pickBankRate,
  pickAmericanBankRate,
  useBankRates,
} from "@/lib/bank-rates";
import {
  checkDTI,
  DOMESTIC_BANKS,
  formatRatesUpdatedAt,
  getBankCategoriesForMarket,
  getBankOfferSourceLabel,
  getTripleBankOffers,
  sourceOfIncomeOptions,
  taxResidencyOptions,
  type BankOffer,
  type CategorizedBankOffers,
  type IncomeSource,
  type ScrapedBankRateInput,
  type TaxResidency,
} from "@/lib/banking";
import {
  calculateAnnuityPayment,
  calculateMortgage,
  countryConfigs,
  countryOrder,
  getEffectiveCurrency,
  tooltips,
  type CountryId,
  type CurrencyCode,
  type FinancingType,
  formatCurrency,
} from "@/lib/calculators";
import { formatNumber, parseFormattedNumber } from "@/lib/format";
import {
  getCnbPurposeNotice,
  getRecommendedMaxLtv,
  MORTGAGE_PURPOSE_OPTIONS,
  type MortgagePurpose,
} from "@/lib/cnb-limits";
import { pickRate, pickRpsn, formatRateLabel, useCurrentRates } from "@/lib/rates";
import { cn } from "@/lib/utils";

const chartConfig = {
  payment: { label: "Splátka", color: "#c5a059" },
} satisfies ChartConfig;

const defaultIncome: Record<CountryId, number> = {
  cz: 80_000,
  dubai: 45_000,
  spain: 4_500,
  italy: 4_000,
  croatia: 3_500,
  bali: 4_000,
  saudi: 18_000,
  slovakia: 2_500,
};

interface MortgageCalculatorProps {
  country: CountryId;
  onCountryChange: (country: CountryId) => void;
  hideCountryPicker?: boolean;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-deep-teal/10">
        <Icon className="h-5 w-5 text-deep-teal" />
      </div>
      <div className={cn(!subtitle && "flex items-center")}>
        <h3
          className={cn(
            "font-semibold text-text-dark",
            !subtitle && "leading-none"
          )}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function CurrencyInput({
  id,
  value,
  onChange,
  currency,
  label,
  tooltip,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  currency: CurrencyCode;
  label: string;
  tooltip?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium text-text-dark">
          {label}
        </Label>
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={(e) => onChange(parseFormattedNumber(e.target.value))}
          className="h-12 pr-16 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80 focus:ring-2 focus:ring-deep-teal/20 text-base font-medium"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-deep-teal bg-deep-teal/10 px-2.5 py-1 rounded-lg">
          {currency}
        </span>
      </div>
    </div>
  );
}

export function MortgageCalculator({
  country,
  onCountryChange,
  hideCountryPicker = false,
}: MortgageCalculatorProps) {
  const config = countryConfigs[country];

  const [price, setPrice] = useState(config.defaultPrice);
  const [savings, setSavings] = useState(config.defaultSavings);
  const [termYears, setTermYears] = useState(config.defaultTerm);
  // Fixní anuita (Dubaj: developer plán jako výchozí model bez UI volby)
  const financingType: FinancingType =
    country === "dubai" ? "developer-plan" : "annuity";
  const [netIncome, setNetIncome] = useState(defaultIncome[country]);
  const [incomeSource, setIncomeSource] = useState<IncomeSource>("employee");
  const [taxResidency, setTaxResidency] = useState<TaxResidency>("cz");
  const [mortgagePurpose, setMortgagePurpose] =
    useState<MortgagePurpose>("owner_occupied");
  const [hasInsurance, setHasInsurance] = useState(true);
  const { rates, loading: ratesLoading } = useCurrentRates();
  const { bankRates, loading: bankRatesLoading } = useBankRates();

  const isCzechMarket = country === "cz";
  /** České sazby ze Supabase — jen pro vnitrostátní + americké hypotéky */
  const czechRate = pickRate(rates, hasInsurance);
  const displayRpsn = pickRpsn(rates, hasInsurance);
  /** Lokální sazba vybraného trhu (Emiráty, Španělsko, …) */
  const foreignMarketRate = config.defaultRate;
  /** Primární sazba pro shrnutí / výpočet úvěru podle trhu */
  const primaryRate = isCzechMarket ? czechRate : foreignMarketRate;

  const scrapedCzechBanks = useMemo((): ScrapedBankRateInput[] => {
    const rows: ScrapedBankRateInput[] = [];
    for (const bank of DOMESTIC_BANKS) {
      const row = findBankRate(bankRates, bank.name);
      if (!row) continue;
      const picked = pickBankRate(row, hasInsurance);
      const american = pickAmericanBankRate(row, hasInsurance);
      if (!picked && !american) continue;
      rows.push({
        bankName: bank.name,
        rate: picked?.rate ?? null,
        rpsn: picked?.rpsn ?? null,
        americanRate: american?.rate ?? null,
        americanRpsn: american?.rpsn ?? null,
        americanSourceUrl: row.americanSourceUrl,
        updatedAt: row.updatedAt,
        sourceUrl: row.sourceUrl,
      });
    }
    return rows;
  }, [bankRates, hasInsurance]);

  const currency = getEffectiveCurrency(country, financingType);

  const result = useMemo(
    () =>
      calculateMortgage({
        country,
        price,
        savings,
        // Splátka se počítá jen při známé sazbě; jinak 0 a UI ukáže „Na vyžádání“
        interestRate: primaryRate ?? 0,
        termYears,
        financingType,
        bank: "",
      }),
    [country, price, savings, termYears, financingType, primaryRate]
  );

  const recommendedMaxLtv = getRecommendedMaxLtv(mortgagePurpose);
  const ltvExceedsCnb = isCzechMarket && result.ltv > recommendedMaxLtv;
  const cnbPurposeNotice = getCnbPurposeNotice(mortgagePurpose);

  const paymentWithInsurance = useMemo(
    () =>
      Math.round(
        calculateAnnuityPayment(
          result.loanAmount,
          rates.rateWithInsurance,
          termYears
        )
      ),
    [result.loanAmount, rates.rateWithInsurance, termYears]
  );

  const paymentWithoutInsurance = useMemo(() => {
    if (rates.rateWithoutInsurance == null) return null;
    return Math.round(
      calculateAnnuityPayment(
        result.loanAmount,
        rates.rateWithoutInsurance,
        termYears
      )
    );
  }, [result.loanAmount, rates.rateWithoutInsurance, termYears]);

  const foreignMarketPayment = useMemo(
    () =>
      Math.round(
        calculateAnnuityPayment(result.loanAmount, foreignMarketRate, termYears)
      ),
    [result.loanAmount, foreignMarketRate, termYears]
  );

  const tripleBankOffers = useMemo((): CategorizedBankOffers => {
    if (result.loanAmount <= 0) {
      return { domestic: [], american: [], local: [], international: [] };
    }
    return getTripleBankOffers(
      country,
      result.loanAmount,
      termYears,
      {
        incomeSource,
        taxResidency,
        ltv: result.ltv,
      },
      scrapedCzechBanks
    );
  }, [
    country,
    result.loanAmount,
    result.ltv,
    termYears,
    incomeSource,
    taxResidency,
    scrapedCzechBanks,
  ]);

  const displayPayment = isCzechMarket
    ? hasInsurance
      ? paymentWithInsurance
      : paymentWithoutInsurance
    : foreignMarketPayment;

  const dti = useMemo(
    () => checkDTI(displayPayment ?? 0, netIncome, country),
    [displayPayment, netIncome, country]
  );

  const visibleBankCategories = getBankCategoriesForMarket(country);

  const hasBankOffers = visibleBankCategories.some(
    (category) => tripleBankOffers[category.id].length > 0
  );

  const renderOfferGrid = (
    title: string,
    description: string,
    items: BankOffer[]
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8 last:mb-0 rounded-2xl border border-gray-200 bg-white/60 p-5 ring-1 ring-gray-900/5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {items.map((offer, index) => (
            <div
              key={`${offer.category}-${offer.bankName}-${index}`}
              className={cn(
                "min-w-0 p-4 rounded-xl border flex flex-col justify-between gap-2",
                offer.best
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 bg-white/70"
              )}
            >
              <h4 className="min-w-0 break-words font-bold text-sm text-gray-900 leading-tight">
                {offer.bankName}
              </h4>
              <div className="min-w-0">
                <div className="text-lg font-bold text-emerald-900 whitespace-nowrap">
                  od {offer.adjustedRate.toFixed(2)} %
                </div>
                <RpsnDisplay rpsn={offer.rpsn} compact className="mt-0.5" />
                <div className="mt-1 text-[11px] text-gray-600 font-medium whitespace-nowrap">
                  {formatCurrency(offer.monthlyPayment, currency)}/měs.
                </div>
                <div className="mt-2 space-y-0.5 text-[10px] leading-snug text-gray-400">
                  <p className="break-words">
                    {getBankOfferSourceLabel(offer.bankName)}
                  </p>
                  <p>{formatRatesUpdatedAt(offer.updatedAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <CalculatorDisclaimer className="mt-4 border-t border-gray-100 pt-3" />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!hideCountryPicker && (
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {countryOrder.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onCountryChange(id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                "ring-1 ring-gray-900/5 backdrop-blur-sm",
                country === id
                  ? "bg-deep-teal text-white shadow-lg shadow-deep-teal/25 scale-105"
                  : "bg-white/70 text-muted-foreground hover:text-deep-teal hover:ring-deep-teal/30 hover:shadow-md"
              )}
            >
              {countryConfigs[id].label}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-3xl overflow-hidden ring-1 ring-gray-900/5 shadow-2xl shadow-gray-900/10 bg-white/80 backdrop-blur-xl">
        <div className="relative px-6 lg:px-10 py-8 border-b border-gray-100 bg-gradient-to-r from-deep-teal/10 via-white to-muted-gold/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-deep-teal to-deep-teal-light flex items-center justify-center shadow-lg shadow-deep-teal/30">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-dark leading-none">
              Hypoteční kalkulačka
            </h2>
            <Sparkles className="w-5 h-5 text-muted-gold ml-auto hidden sm:block shrink-0" />
          </div>
        </div>

        <div className="p-6 lg:p-10 space-y-10">
          <section>
            <SectionHeader
              icon={User}
              title="Osobní profil"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <CurrencyInput
                id="income"
                label="Čistý měsíční příjem"
                value={netIncome}
                onChange={setNetIncome}
                currency={currency}
                tooltip="Čistý příjem po zdanění. Banky z něj často odvozují maximální výši splátky."
              />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-dark">
                  Zdroj příjmu
                </Label>
                <Select
                  value={incomeSource}
                  onValueChange={(v) => v && setIncomeSource(v as IncomeSource)}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80">
                    <SelectValue placeholder="Vyberte zdroj příjmu">
                      {sourceOfIncomeOptions.find((o) => o.value === incomeSource)
                        ?.label ?? "Vyberte zdroj příjmu"}
                    </SelectValue>
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-dark">
                  Daňová rezidence
                </Label>
                <Select
                  value={taxResidency}
                  onValueChange={(v) => v && setTaxResidency(v as TaxResidency)}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80">
                    <SelectValue placeholder="Vyberte zemi">
                      {taxResidencyOptions.find((o) => o.value === taxResidency)
                        ?.label ?? "Vyberte zemi"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {taxResidencyOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section>
            <SectionHeader
              icon={Wallet}
              title="Parametry nemovitosti"
              subtitle="Cena, vlastní zdroje a účel hypotéky"
            />
            {isCzechMarket && (
              <div className="mb-5 space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-text-dark">
                    Účel hypotéky
                  </Label>
                  <Select
                    value={mortgagePurpose}
                    onValueChange={(v) =>
                      v && setMortgagePurpose(v as MortgagePurpose)
                    }
                  >
                    <SelectTrigger className="h-12 w-full rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80">
                      <SelectValue placeholder="Vyberte účel">
                        {MORTGAGE_PURPOSE_OPTIONS.find(
                          (o) => o.value === mortgagePurpose
                        )?.label ?? "Vyberte účel"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {MORTGAGE_PURPOSE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {
                      MORTGAGE_PURPOSE_OPTIONS.find(
                        (o) => o.value === mortgagePurpose
                      )?.description
                    }
                  </p>
                </div>
                <div className="rounded-2xl border border-deep-teal/20 bg-deep-teal/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal mb-1">
                    Doporučení ČNB (od 4/2026)
                  </p>
                  <p className="text-sm text-text-dark leading-relaxed">
                    {cnbPurposeNotice}
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <CurrencyInput
                id="price"
                label="Cena nemovitosti"
                value={price}
                onChange={setPrice}
                currency={currency}
                tooltip={tooltips.price}
              />
              <CurrencyInput
                id="savings"
                label="Vlastní úspory"
                value={savings}
                onChange={setSavings}
                currency={currency}
                tooltip={tooltips.savings}
              />
              <div className="sm:col-span-2 space-y-3">
                <InsuranceRateCards
                  hasInsurance={hasInsurance}
                  onSelect={setHasInsurance}
                  rateWithInsurance={rates.rateWithInsurance}
                  rateWithoutInsurance={rates.rateWithoutInsurance}
                  rpsnWithInsurance={rates.rpsnWithInsurance}
                  rpsnWithoutInsurance={rates.rpsnWithoutInsurance}
                  paymentWithInsurance={formatCurrency(
                    paymentWithInsurance,
                    currency
                  )}
                  paymentWithoutInsurance={
                    paymentWithoutInsurance != null
                      ? formatCurrency(paymentWithoutInsurance, currency)
                      : null
                  }
                  loading={ratesLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {isCzechMarket ? (
                    <>
                      České sazby ze Supabase platí pro{" "}
                      <strong>Vnitrostátní banky</strong> a{" "}
                      <strong>Americké hypotéky</strong>.
                    </>
                  ) : (
                    <>
                      České sazby ze Supabase platí jen pro{" "}
                      <strong>Americké hypotéky (z ČR)</strong>. Lokální banky
                      trhu <strong>{config.label}</strong> používají sazbu{" "}
                      {foreignMarketRate.toFixed(2)} % p.a. — klasické české
                      vnitrostátní hypotéky se zde nezobrazují.
                    </>
                  )}
                </p>
                {!isCzechMarket && (
                  <div className="rounded-2xl border border-deep-teal/20 bg-deep-teal/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
                      Lokální sazba trhu {config.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-deep-teal">
                      {foreignMarketRate.toFixed(2)} %
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Orientační splátka u zahraničních bank:{" "}
                      {formatCurrency(foreignMarketPayment, currency)}/měs.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="term" className="text-sm font-medium text-text-dark">
                    Doba splatnosti
                  </Label>
                  <InfoTooltip content={tooltips.termYears} />
                </div>
                <div className="relative">
                  <Input
                    id="term"
                    type="text"
                    inputMode="numeric"
                    value={termYears || ""}
                    onChange={(e) => {
                      const v = parseFormattedNumber(e.target.value);
                      setTermYears(Math.min(40, Math.max(1, v || 1)));
                    }}
                    className="h-12 pr-12 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80 text-base font-medium"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    let
                  </span>
                </div>
              </div>
              <div className="flex items-end">
                <div
                  className={cn(
                    "w-full rounded-xl p-4 ring-1",
                    ltvExceedsCnb
                      ? "bg-amber-50/80 ring-amber-200/80"
                      : "bg-gradient-to-r from-deep-teal/5 to-muted-gold/5 ring-gray-900/5"
                  )}
                >
                  <p className="text-xs text-muted-foreground">Aktuální LTV</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      ltvExceedsCnb ? "text-amber-800" : "text-deep-teal"
                    )}
                  >
                    {result.ltv} %
                  </p>
                  {isCzechMarket && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Doporučení ČNB: max. {recommendedMaxLtv} %
                      {mortgagePurpose === "investment"
                        ? " (investiční)"
                        : " (vlastní bydlení)"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {ltvExceedsCnb && (
            <div className="flex gap-4 p-5 rounded-2xl ring-1 backdrop-blur-sm bg-amber-50/80 ring-amber-200/80 text-amber-900">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold text-sm mb-1">
                  {mortgagePurpose === "investment"
                    ? "LTV nad doporučením ČNB pro investiční hypotéky"
                    : "LTV nad standardním limitem ČNB"}
                </p>
                <p className="text-sm opacity-90 leading-relaxed">
                  {mortgagePurpose === "investment"
                    ? `Pro investiční hypotéky ČNB doporučuje LTV maximálně 70 % a limit DTI 7. Vaše LTV je ${result.ltv} %. Zvažte vyšší vlastní zdroje.`
                    : `Pro vlastní bydlení ČNB ponechává LTV obvykle do 80 % (do 36 let až 90 %). Vaše LTV je ${result.ltv} %.`}
                </p>
              </div>
            </div>
          )}

          {dti.warning && (
            <div
              className={cn(
                "flex gap-4 p-5 rounded-2xl ring-1 backdrop-blur-sm",
                dti.level === "danger"
                  ? "bg-red-50/80 ring-red-200/80 text-red-900"
                  : "bg-amber-50/80 ring-amber-200/80 text-amber-900"
              )}
            >
              <AlertTriangle
                className={cn(
                  "w-6 h-6 shrink-0 mt-0.5",
                  dti.level === "danger" ? "text-red-600" : "text-amber-600"
                )}
              />
              <div>
                <p className="font-semibold text-sm mb-1">
                  {dti.level === "danger"
                    ? "Vysoká zátěž příjmu"
                    : "Varování – vysoká zátěž příjmu"}
                </p>
                <p className="text-sm opacity-90 leading-relaxed">{dti.message}</p>
              </div>
            </div>
          )}

          <section>
            <SectionHeader
              icon={Building2}
              title="Nabídky bank"
              subtitle={
                bankRatesLoading
                  ? "Načítám aktuální sazby ze scrapingu…"
                  : hasBankOffers
                    ? "Úroky a RPSN z oficiálních webů bank (Supabase)"
                    : undefined
              }
            />
            {bankRatesLoading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-muted-foreground">
                Data se aktualizují…
              </div>
            ) : hasBankOffers ? (
              visibleBankCategories.map((category) =>
                renderOfferGrid(
                  category.id === "local"
                    ? `${category.title} — ${config.label}`
                    : category.title,
                  category.description,
                  tripleBankOffers[category.id]
                )
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-5 py-8 text-center text-sm text-amber-900">
                Data se aktualizují. Spusťte scraper{" "}
                <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">
                  /api/scrape-rates
                </code>{" "}
                (cron 4:00) nebo zkontrolujte tabulku{" "}
                <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">
                  bank_rates
                </code>
                .
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-gradient-to-br from-deep-teal/5 via-white to-muted-gold/5 p-6 lg:p-8 ring-1 ring-gray-900/5 space-y-6">
            <h3 className="font-semibold text-text-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-deep-teal" />
              Shrnutí výsledků
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  label: "Měsíční splátka",
                  value:
                    displayPayment != null && primaryRate != null
                      ? formatCurrency(displayPayment, currency)
                      : "Na vyžádání",
                  accent: true,
                },
                {
                  label: "Úroková sazba",
                  value: formatRateLabel(primaryRate),
                  rpsn: displayRpsn,
                },
                {
                  label: "Výše úvěru",
                  value: formatCurrency(result.loanAmount, currency),
                },
                { label: "LTV", value: `${result.ltv} %` },
                {
                  label: "Celkem zaplatíte",
                  value:
                    displayPayment != null && primaryRate != null
                      ? formatCurrency(displayPayment * termYears * 12, currency)
                      : "Na vyžádání",
                  gold: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white/80 backdrop-blur-sm p-4 ring-1 ring-gray-900/5"
                >
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p
                    className={cn(
                      "text-lg font-bold leading-tight",
                      item.accent && "text-deep-teal",
                      item.gold && "text-muted-gold",
                      !item.accent && !item.gold && "text-text-dark"
                    )}
                  >
                    {item.value}
                  </p>
                  {"rpsn" in item && (
                    <RpsnDisplay rpsn={item.rpsn} className="mt-1.5" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {result.collateral}
              </span>
              <span>·</span>
              <span>{result.financingLabel}</span>
              {!dti.warning && dti.message && (
                <>
                  <span>·</span>
                  <span className="text-deep-teal">{dti.message}</span>
                </>
              )}
            </div>

            <CalculatorDisclaimer className="rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-900/5" />

            <LeadCaptureForm
              source="mortgage_calculator"
              country={config.label}
              notes={[
                `Trh: ${config.label}`,
                `Cena: ${price.toLocaleString("cs-CZ")} ${currency}`,
                `Úspory: ${savings.toLocaleString("cs-CZ")} ${currency}`,
                `LTV: ${result.ltv} %`,
                `Úvěr: ${result.loanAmount.toLocaleString("cs-CZ")} ${currency}`,
                `Splátka: ${
                  displayPayment != null
                    ? `${displayPayment.toLocaleString("cs-CZ")} ${currency}`
                    : "Na vyžádání"
                }`,
                `Splatnost: ${termYears} let`,
                isCzechMarket
                  ? `Pojištění: ${hasInsurance ? "ano" : "ne"}`
                  : null,
                `Sazba: ${formatRateLabel(primaryRate)}`,
                isCzechMarket
                  ? `Účel: ${mortgagePurpose === "investment" ? "investiční" : "vlastní bydlení"}`
                  : null,
              ]
                .filter(Boolean)
                .join(" | ")}
              metadata={{
                country,
                price,
                savings,
                ltv: result.ltv,
                loan_amount: result.loanAmount,
                monthly_payment: displayPayment,
                term_years: termYears,
                rate: primaryRate,
                has_insurance: isCzechMarket ? hasInsurance : null,
                mortgage_purpose: isCzechMarket ? mortgagePurpose : null,
                currency,
              }}
              title="Líbí se vám výsledek? Nechte si ho ověřit"
              subtitle="Pošleme vám nezávaznou konzultaci k této kalkulaci do 24 hodin."
            />

            {result.showChart && result.chartData.length > 0 && (
              <div className="bg-white/80 rounded-xl p-5 ring-1 ring-gray-900/5">
                <p className="text-xs text-muted-foreground mb-3">
                  Projekce splácení (tisíce {currency})
                </p>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <AreaChart data={result.chartData}>
                    <defs>
                      <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c5a059" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1b4d3e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="payment"
                      stroke="#c5a059"
                      strokeWidth={2.5}
                      fill="url(#premiumGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
