"use client";

import { useMemo, useState } from "react";
import { AmortizationChart } from "@/components/calculators/AmortizationChart";
import { CalculatorDisclaimer } from "@/components/calculators/CalculatorDisclaimer";
import { InsuranceRateCards } from "@/components/calculators/InsuranceRateCards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateAnnuityPayment,
  countryConfigs,
  formatCurrency,
  generateAmortizationData,
  type CountryId,
} from "@/lib/calculators";
import { missingDataLabel } from "@/lib/data/display";
import {
  calculateFinancing,
  defaultFinancingOption,
  LOCAL_FINANCING_UNVERIFIED_MESSAGE,
} from "@/lib/financing";
import { formatRateOrOnRequest } from "@/lib/format-rate";
import { pickRate, useCurrentRates } from "@/lib/rates";

interface AdvancedCalculatorProps {
  country: CountryId;
}

export function AdvancedCalculator({ country }: AdvancedCalculatorProps) {
  const config = countryConfigs[country];
  const isCzechMarket = country === "cz";
  const { rates, loading: ratesLoading } = useCurrentRates();

  const [price, setPrice] = useState(config.defaultPrice);
  const [capital, setCapital] = useState(config.defaultSavings);
  const [years, setYears] = useState(config.defaultTerm);
  const [hasInsurance, setHasInsurance] = useState(true);

  const czechRate = pickRate(rates, hasInsurance);
  const loanAmount = Math.max(0, price - capital);

  const paymentWithInsurance = useMemo(() => {
    if (rates.rateWithInsurance == null) return null;
    return Math.round(
      calculateAnnuityPayment(loanAmount, rates.rateWithInsurance, years)
    );
  }, [loanAmount, rates.rateWithInsurance, years]);

  const paymentWithoutInsurance = useMemo(() => {
    if (rates.rateWithoutInsurance == null) return null;
    return Math.round(
      calculateAnnuityPayment(loanAmount, rates.rateWithoutInsurance, years)
    );
  }, [loanAmount, rates.rateWithoutInsurance, years]);

  const foreignResult = useMemo(
    () =>
      calculateFinancing({
        country,
        option: defaultFinancingOption(country),
        propertyPrice: price,
        ownFunds: capital,
        termYears: years,
        czechEquityRatePercentPa: null,
      }),
    [country, price, capital, years]
  );

  const calcRate = isCzechMarket ? (czechRate ?? 0) : 0;

  const calculations = useMemo(() => {
    const monthlyPayment = isCzechMarket
      ? hasInsurance
        ? paymentWithInsurance
        : paymentWithoutInsurance
      : foreignResult.calculable
        ? foreignResult.monthlyPayment
        : null;
    const annualRentalIncome = price * config.defaultRentalYield;
    const annualMortgageCost =
      monthlyPayment == null ? null : monthlyPayment * 12;
    const netAnnualCashFlow =
      annualMortgageCost == null
        ? null
        : annualRentalIncome - annualMortgageCost;
    const roi =
      capital > 0 && netAnnualCashFlow != null
        ? (netAnnualCashFlow / capital) * 100
        : null;

    return {
      loanAmount: Math.round(loanAmount),
      monthlyPayment,
      annualRentalIncome: Math.round(annualRentalIncome),
      roi: roi == null ? "—" : roi.toFixed(1),
    };
  }, [
    isCzechMarket,
    hasInsurance,
    paymentWithInsurance,
    paymentWithoutInsurance,
    foreignResult,
    price,
    capital,
    loanAmount,
    config.defaultRentalYield,
  ]);

  const chartData = useMemo(
    () =>
      isCzechMarket && calcRate > 0
        ? generateAmortizationData(price, capital, calcRate, years)
        : [],
    [isCzechMarket, price, capital, calcRate, years]
  );

  const currency = config.currency;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor={`price-${country}`} className="mb-2 block">
            Cena nemovitosti ({currency})
          </Label>
          <Input
            id={`price-${country}`}
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor={`capital-${country}`} className="mb-2 block">
            Vlastní kapitál ({currency})
          </Label>
          <Input
            id={`capital-${country}`}
            type="number"
            min={0}
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value) || 0)}
            className="rounded-lg"
          />
        </div>

        {isCzechMarket ? (
          <div className="md:col-span-2">
            <InsuranceRateCards
              hasInsurance={hasInsurance}
              onSelect={setHasInsurance}
              rateWithInsurance={rates.rateWithInsurance}
              rateWithoutInsurance={rates.rateWithoutInsurance}
              rpsnWithInsurance={rates.rpsnWithInsurance}
              rpsnWithoutInsurance={rates.rpsnWithoutInsurance}
              withoutRateOrientational={rates.withoutInsuranceOrientational}
              paymentWithInsurance={
                paymentWithInsurance == null
                  ? "Individuálně"
                  : formatCurrency(paymentWithInsurance, currency)
              }
              paymentWithoutInsurance={
                paymentWithoutInsurance == null
                  ? "Individuálně"
                  : formatCurrency(paymentWithoutInsurance, currency)
              }
              loading={ratesLoading}
            />
          </div>
        ) : (
          <div className="md:col-span-2 rounded-2xl border border-deep-teal/20 bg-deep-teal/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
              {foreignResult.label}
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {foreignResult.calculable
                ? foreignResult.message ??
                  `Výchozí produkt pro ${config.label} — bez vymyšlené lokální sazby.`
                : LOCAL_FINANCING_UNVERIFIED_MESSAGE}
            </p>
            {foreignResult.calculable &&
              foreignResult.monthlyPayment != null && (
                <p className="mt-2 text-lg font-bold text-deep-teal tabular-nums">
                  {formatCurrency(foreignResult.monthlyPayment, foreignResult.currency)}
                  /měs.
                </p>
              )}
            {!foreignResult.calculable && (
              <p className="mt-2 text-lg font-bold text-text-dark">
                {missingDataLabel(null)}
              </p>
            )}
          </div>
        )}

        {isCzechMarket && (
          <div>
            <Label htmlFor={`years-${country}`} className="mb-2 block">
              Doba splácení (let)
            </Label>
            <Input
              id={`years-${country}`}
              type="number"
              min={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 1)}
              className="rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl bg-deep-teal/5 p-4">
          <p className="text-xs text-muted-foreground">Úvěr / financování</p>
          <p className="text-lg font-bold text-deep-teal tabular-nums">
            {isCzechMarket
              ? formatCurrency(calculations.loanAmount, currency)
              : formatCurrency(foreignResult.financedAmount, foreignResult.currency)}
          </p>
        </div>
        <div className="rounded-xl bg-deep-teal/5 p-4">
          <p className="text-xs text-muted-foreground">Splátka</p>
          <p className="text-lg font-bold text-deep-teal tabular-nums">
            {calculations.monthlyPayment == null
              ? missingDataLabel(null)
              : formatCurrency(
                  calculations.monthlyPayment,
                  isCzechMarket ? currency : foreignResult.currency
                )}
          </p>
        </div>
        <div className="rounded-xl bg-muted-gold/10 p-4">
          <p className="text-xs text-muted-foreground">Hrubý výnos / rok</p>
          <p className="text-lg font-bold text-text-dark tabular-nums">
            {formatCurrency(calculations.annualRentalIncome, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-muted-gold/10 p-4">
          <p className="text-xs text-muted-foreground">ROI (model)</p>
          <p className="text-lg font-bold text-text-dark">{calculations.roi} %</p>
        </div>
      </div>

      {isCzechMarket && (
        <p className="mb-4 text-sm text-muted-foreground">
          Sazba: {formatRateOrOnRequest(czechRate)}
        </p>
      )}

      {chartData.length > 0 && (
        <AmortizationChart data={chartData} currency={currency} />
      )}
      <CalculatorDisclaimer className="mt-4" />
    </div>
  );
}
