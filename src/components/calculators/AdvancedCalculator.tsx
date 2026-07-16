"use client";

import { useMemo, useState } from "react";
import { AmortizationChart } from "@/components/calculators/AmortizationChart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateAnnuityPayment,
  countryConfigs,
  formatCurrency,
  generateAmortizationData,
  type CountryId,
} from "@/lib/calculators";

interface AdvancedCalculatorProps {
  country: CountryId;
}

export function AdvancedCalculator({ country }: AdvancedCalculatorProps) {
  const config = countryConfigs[country];

  const [price, setPrice] = useState(config.defaultPrice);
  const [capital, setCapital] = useState(config.defaultSavings);
  const [rate, setRate] = useState(config.defaultRate);
  const [years, setYears] = useState(config.defaultTerm);

  const calculations = useMemo(() => {
    const loanAmount = Math.max(0, price - capital);
    const monthlyPayment = calculateAnnuityPayment(loanAmount, rate, years);
    const annualRentalIncome = price * config.defaultRentalYield;
    const annualMortgageCost = monthlyPayment * 12;
    const netAnnualCashFlow = annualRentalIncome - annualMortgageCost;
    const roi = capital > 0 ? (netAnnualCashFlow / capital) * 100 : 0;

    return {
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      annualRentalIncome: Math.round(annualRentalIncome),
      roi: roi.toFixed(1),
    };
  }, [price, capital, rate, years, config.defaultRentalYield]);

  const chartData = useMemo(
    () => generateAmortizationData(price, capital, rate, years),
    [price, capital, rate, years]
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
        <div>
          <Label htmlFor={`rate-${country}`} className="mb-2 block">
            Úroková sazba (% p.a.)
          </Label>
          <Input
            id={`rate-${country}`}
            type="number"
            min={0}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            className="rounded-lg"
          />
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
        <div className="bg-emerald-50 p-6 rounded-2xl">
          <p className="text-emerald-800 text-sm font-semibold mb-1">
            Měsíční splátka
          </p>
          <p className="text-2xl font-bold text-emerald-900 whitespace-nowrap">
            {formatCurrency(calculations.monthlyPayment, currency)}
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

      <AmortizationChart data={chartData} currency={currency} />
    </div>
  );
}
