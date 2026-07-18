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
  const selectedRate = isCzechMarket ? czechRate : config.defaultRate;
  const loanAmount = Math.max(0, price - capital);
  const calcRate = selectedRate ?? 0;

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

  const foreignPayment = useMemo(
    () =>
      Math.round(
        calculateAnnuityPayment(loanAmount, config.defaultRate, years)
      ),
    [loanAmount, config.defaultRate, years]
  );

  const calculations = useMemo(() => {
    const monthlyPayment = isCzechMarket
      ? hasInsurance
        ? paymentWithInsurance
        : paymentWithoutInsurance
      : foreignPayment;
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
    foreignPayment,
    price,
    capital,
    loanAmount,
    config.defaultRentalYield,
  ]);

  const chartData = useMemo(
    () => generateAmortizationData(price, capital, calcRate, years),
    [price, capital, calcRate, years]
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
              Lokální sazba trhu {config.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-deep-teal">
              {config.defaultRate.toFixed(2)} % p.a.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Orientační splátka: {formatCurrency(foreignPayment, currency)}
              /měs. (nepoužívá české sazby ze Supabase)
            </p>
          </div>
        )}

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
        <div className="flex items-end">
          <div className="w-full rounded-xl bg-gradient-to-r from-deep-teal/5 to-muted-gold/5 p-4 ring-1 ring-gray-900/5">
            <p className="text-xs text-muted-foreground">Zvolená sazba</p>
            <p className="text-2xl font-bold text-deep-teal">
              {formatRateOrOnRequest(selectedRate)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
        <div className="bg-emerald-50 p-6 rounded-2xl">
          <p className="text-emerald-800 text-sm font-semibold mb-1">
            Měsíční splátka
          </p>
          <p className="text-2xl font-bold text-emerald-900 whitespace-nowrap">
            {calculations.monthlyPayment == null
              ? "Individuálně"
              : formatCurrency(calculations.monthlyPayment, currency)}
          </p>
          <p className="text-xs text-emerald-700/70 mt-1">
            {isCzechMarket
              ? hasInsurance
                ? "S pojištěním (Supabase)"
                : "Bez pojištění (Supabase)"
              : `Lokální sazba ${config.label}`}{" "}
            · {formatRateOrOnRequest(selectedRate)}
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl">
          <p className="text-blue-800 text-sm font-semibold mb-1">
            Roční příjem z nájmu
          </p>
          <p className="text-2xl font-bold text-blue-900 whitespace-nowrap">
            {formatCurrency(calculations.annualRentalIncome, currency)}
          </p>
          <p className="text-xs text-blue-700/70 mt-1">
            Odhad při výnosu {(config.defaultRentalYield * 100).toFixed(1)} % p.a.
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <p className="text-purple-800 text-sm font-semibold">
            Odhadované ROI (Cash-on-Cash)
          </p>
          <p className="text-2xl font-bold text-purple-900">{calculations.roi} %</p>
        </div>
      </div>

      <CalculatorDisclaimer className="mt-4" />

      {selectedRate != null && (
        <div className="mt-8">
          <AmortizationChart data={chartData} currency={currency} />
        </div>
      )}
    </div>
  );
}
