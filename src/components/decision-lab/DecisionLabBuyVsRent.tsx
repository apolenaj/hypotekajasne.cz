"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DecisionLabChartFrame } from "@/components/decision-lab/DecisionLabChartFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  countryConfigs,
  formatCurrency,
  type CountryId,
} from "@/lib/calculators";
import { simulateBuyVsRent } from "@/lib/decision-lab";

type Props = { countryId: CountryId };

export function DecisionLabBuyVsRent({ countryId }: Props) {
  const config = countryConfigs[countryId];
  const [price, setPrice] = useState(config.defaultPrice);
  const [rent, setRent] = useState(
    Math.round((config.defaultPrice * config.defaultRentalYield) / 12)
  );
  const [rate, setRate] = useState(4.5);
  const [down, setDown] = useState(config.defaultSavings);
  const [maintenance, setMaintenance] = useState(1.5);
  const [tx, setTx] = useState(4.5);
  const [propGrowth, setPropGrowth] = useState(2);
  const [rentGrowth, setRentGrowth] = useState(2);
  const [altReturn, setAltReturn] = useState(4);
  const [horizon, setHorizon] = useState(15);
  const [term, setTerm] = useState(config.defaultTerm);

  const result = useMemo(
    () =>
      simulateBuyVsRent({
        purchasePrice: price,
        monthlyRent: rent,
        mortgageRate: rate > 0 ? rate : null,
        downPayment: down,
        maintenanceRate: maintenance / 100,
        transactionCostRate: tx / 100,
        annualPropertyGrowth: propGrowth / 100,
        annualRentGrowth: rentGrowth / 100,
        alternativeEquityReturn: altReturn / 100,
        horizonYears: horizon,
        termYears: term,
      }),
    [
      price,
      rent,
      rate,
      down,
      maintenance,
      tx,
      propGrowth,
      rentGrowth,
      altReturn,
      horizon,
      term,
    ]
  );

  const exportRows = [
    ["year", "buy_net_worth", "rent_net_worth"],
    ...result.series.map((p) => [
      String(p.year),
      String(p.buyNetWorth),
      String(p.rentNetWorth),
    ]),
  ];

  const field = (
    id: string,
    label: string,
    value: number,
    onChange: (n: number) => void,
    step = 1
  ) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-10"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-deep-teal/20 bg-deep-teal/5 p-4">
        <p className="text-sm font-semibold text-deep-teal">Decision Lab · Koupě vs. nájem</p>
        <p className="mt-2 text-base font-medium text-text-dark leading-relaxed">
          {result.verdictSentence}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Verdikt platí jen pro zadané předpoklady — není univerzální vítěz.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {field("bvr-price", "Cena", price, setPrice)}
        {field("bvr-rent", "Nájem / měs.", rent, setRent)}
        {field("bvr-rate", "Sazba %", rate, setRate, 0.1)}
        {field("bvr-down", "Akontace", down, setDown)}
        {field("bvr-maint", "Maintenance %", maintenance, setMaintenance, 0.1)}
        {field("bvr-tx", "Transaction costs %", tx, setTx, 0.1)}
        {field("bvr-pg", "Růst ceny %", propGrowth, setPropGrowth, 0.1)}
        {field("bvr-rg", "Růst nájmu %", rentGrowth, setRentGrowth, 0.1)}
        {field("bvr-alt", "Alt. výnos kapitálu %", altReturn, setAltReturn, 0.1)}
        {field("bvr-h", "Horizont (roky)", horizon, setHorizon)}
      </div>

      <DecisionLabChartFrame
        meta={result.chartMeta}
        assumptions={result.assumptions}
        exportRows={exportRows}
        exportFilename={`buy-vs-rent-${countryId}.csv`}
      >
        <div className="h-[320px] w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={result.series}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  formatCurrency(Number(v), config.currency).replace(/\s/g, " ")
                }
                width={90}
              />
              <Tooltip
                formatter={(v) =>
                  formatCurrency(Number(v), config.currency)
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="buyNetWorth"
                name="Koupě — čisté jmění"
                stroke="#1b4d3e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="rentNetWorth"
                name="Nájem — portfolio"
                stroke="#c5a059"
                strokeWidth={2}
                dot={false}
              />
              {result.buyAdvantageFromYear != null && (
                <ReferenceLine
                  x={`Rok ${result.buyAdvantageFromYear}`}
                  stroke="#1b4d3e"
                  strokeDasharray="4 4"
                  label={{
                    value: `Koupě od r. ${result.buyAdvantageFromYear}`,
                    fontSize: 11,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DecisionLabChartFrame>
    </div>
  );
}
