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
import { InfoTooltip } from "@/components/calculators/InfoTooltip";
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
  checkDTI,
  getTripleBankOffers,
  sourceOfIncomeOptions,
  taxResidencyOptions,
  type BankOffer,
  type IncomeSource,
  type TaxResidency,
} from "@/lib/banking";
import {
  calculateMortgage,
  countryConfigs,
  countryOrder,
  dubaiFinancingOptions,
  getEffectiveCurrency,
  shouldShowInterestRate,
  standardFinancingOptions,
  tooltips,
  type CountryId,
  type CurrencyCode,
  type FinancingType,
  formatCurrency,
} from "@/lib/calculators";
import { formatNumber, parseFormattedNumber } from "@/lib/format";
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
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-deep-teal/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-deep-teal" />
      </div>
      <div>
        <h3 className="font-semibold text-text-dark">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
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
  const [financingType, setFinancingType] = useState<FinancingType>(
    country === "dubai" ? "developer-plan" : "annuity"
  );
  const [netIncome, setNetIncome] = useState(defaultIncome[country]);
  const [incomeSource, setIncomeSource] = useState<IncomeSource>("employee");
  const [taxResidency, setTaxResidency] = useState<TaxResidency>("cz");

  const currency = getEffectiveCurrency(country, financingType);
  const showInterestRate = shouldShowInterestRate(country, financingType);
  const financingOptions =
    country === "dubai" ? dubaiFinancingOptions : standardFinancingOptions;

  const result = useMemo(
    () =>
      calculateMortgage({
        country,
        price,
        savings,
        interestRate: config.defaultRate,
        termYears,
        financingType,
        bank: "",
      }),
    [country, price, savings, termYears, financingType, config.defaultRate]
  );

  const tripleBankOffers = useMemo(() => {
    if (!showInterestRate || result.loanAmount <= 0) {
      return { international: [], local: [], czech: [] };
    }
    return getTripleBankOffers(
      country,
      config.defaultRate,
      result.loanAmount,
      termYears,
      {
        incomeSource,
        taxResidency,
        ltv: result.ltv,
      }
    );
  }, [
    showInterestRate,
    country,
    config.defaultRate,
    result.loanAmount,
    result.ltv,
    termYears,
    incomeSource,
    taxResidency,
  ]);

  const bestOffer =
    tripleBankOffers.local.find((offer) => offer.best) ??
    tripleBankOffers.local[0] ??
    tripleBankOffers.international.find((offer) => offer.best) ??
    tripleBankOffers.international[0] ??
    tripleBankOffers.czech.find((offer) => offer.best) ??
    tripleBankOffers.czech[0];

  const displayPayment = bestOffer?.monthlyPayment ?? result.monthlyPayment;

  const dti = useMemo(
    () => checkDTI(displayPayment, netIncome, country),
    [displayPayment, netIncome, country]
  );

  const riskPremium =
    tripleBankOffers.local[0]?.riskPremium ??
    tripleBankOffers.international[0]?.riskPremium ??
    tripleBankOffers.czech[0]?.riskPremium ??
    0;

  const renderOfferGrid = (title: string, items: BankOffer[]) => (
    <div className="mb-10 last:mb-0">
      <h3 className="text-md font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map((offer, index) => (
          <div
            key={`${offer.bankName}-${index}`}
            className={cn(
              "p-4 rounded-xl border flex flex-col justify-between",
              offer.best
                ? "border-emerald-600 bg-emerald-50"
                : "border-gray-200 bg-white/70"
            )}
          >
            <h4 className="font-bold text-sm text-gray-900 leading-tight mb-2">
              {offer.bankName}
            </h4>
            <div>
              <div className="text-lg font-bold text-emerald-900 whitespace-nowrap">
                od {offer.adjustedRate.toFixed(2)} %
              </div>
              <div className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
                {formatCurrency(offer.monthlyPayment, currency)}/měs.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const hasBankOffers =
    tripleBankOffers.international.length > 0 ||
    tripleBankOffers.local.length > 0 ||
    tripleBankOffers.czech.length > 0;

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-teal to-deep-teal-light flex items-center justify-center shadow-lg shadow-deep-teal/30">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-dark">
                Bankovní scoring kalkulačka
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {config.label} · {currency} · personalizované nabídky
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-muted-gold ml-auto hidden sm:block" />
          </div>
        </div>

        <div className="p-6 lg:p-10 space-y-10">
          <section>
            <SectionHeader
              icon={User}
              title="Osobní profil"
              subtitle="Ovlivňuje rizikovou přirážku a schvalitelnost"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <CurrencyInput
                id="income"
                label="Čistý měsíční příjem"
                value={netIncome}
                onChange={setNetIncome}
                currency={currency}
                tooltip="Čistý příjem po zdanění. Banka z něj odvozuje maximální výši splátky (DSTI)."
              />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-dark">
                  Zdroj příjmu
                </Label>
                <Select
                  value={incomeSource}
                  onValueChange={(v) => v && setIncomeSource(v as IncomeSource)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-dark">
                  Daňová rezidence
                </Label>
                <Select
                  value={taxResidency}
                  onValueChange={(v) => v && setTaxResidency(v as TaxResidency)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80">
                    <SelectValue />
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
              subtitle="Základ pro výpočet úvěru a LTV"
            />
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
                label="Vlastní úspory (LTV)"
                value={savings}
                onChange={setSavings}
                currency={currency}
                tooltip={tooltips.savings}
              />
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-medium text-text-dark">
                    Typ financování
                  </Label>
                  <InfoTooltip content={tooltips.financingType} />
                </div>
                <Select
                  value={financingType}
                  onValueChange={(v) => v && setFinancingType(v as FinancingType)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {financingOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {financingType === "american-cz-collateral" && (
                  <p className="text-xs text-muted-gold mt-2 flex items-center gap-1.5">
                    <InfoTooltip content={tooltips.americanMortgage} />
                    Měna přepnuta na CZK – úvěr z české banky se zástavou v ČR
                  </p>
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
                <div className="w-full rounded-xl bg-gradient-to-r from-deep-teal/5 to-muted-gold/5 p-4 ring-1 ring-gray-900/5">
                  <p className="text-xs text-muted-foreground">Aktuální LTV</p>
                  <p className="text-2xl font-bold text-deep-teal">{result.ltv} %</p>
                </div>
              </div>
            </div>
          </section>

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
                    ? "Překročení limitu DSTI"
                    : "Varování – vysoká zátěž příjmu"}
                </p>
                <p className="text-sm opacity-90 leading-relaxed">{dti.message}</p>
              </div>
            </div>
          )}

          {showInterestRate && hasBankOffers && (
            <section>
              <SectionHeader
                icon={Building2}
                title="Odhadované nabídky bank"
                subtitle={
                  riskPremium > 0
                    ? `Zahrnuje rizikovou přirážku +${riskPremium.toFixed(1)} % (profil / LTV)`
                    : "Srovnání mezinárodních a místních poskytovatelů"
                }
              />
              {renderOfferGrid(
                "Mezinárodní financování (Expat/Global)",
                tripleBankOffers.international
              )}
              {renderOfferGrid(
                "Vnitrostátní banky (lokální)",
                tripleBankOffers.local
              )}
              {renderOfferGrid(
                "České banky (financování zahraničních nemovitostí)",
                tripleBankOffers.czech
              )}
            </section>
          )}

          <section className="rounded-2xl bg-gradient-to-br from-deep-teal/5 via-white to-muted-gold/5 p-6 lg:p-8 ring-1 ring-gray-900/5 space-y-6">
            <h3 className="font-semibold text-text-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-deep-teal" />
              Shrnutí výsledků
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Měsíční splátka",
                  value: formatCurrency(displayPayment, currency),
                  accent: true,
                },
                {
                  label: "Výše úvěru",
                  value: formatCurrency(result.loanAmount, currency),
                },
                { label: "LTV", value: `${result.ltv} %` },
                {
                  label: "Celkem zaplatíte",
                  value: formatCurrency(
                    bestOffer
                      ? bestOffer.monthlyPayment * termYears * 12
                      : result.totalPayment,
                    currency
                  ),
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
