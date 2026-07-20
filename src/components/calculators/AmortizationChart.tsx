"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, type CurrencyCode } from "@/lib/calculators";
import type { AmortizationDataPoint } from "@/lib/calculators";
import { formatMoneyCompact, type MoneyCurrency } from "@/lib/money";

interface AmortizationChartProps {
  data: AmortizationDataPoint[];
  currency: CurrencyCode;
}

export function AmortizationChart({ data, currency }: AmortizationChartProps) {
  const gradientId = useId().replace(/:/g, "");

  if (data.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-muted-foreground">
        Zadejte parametry úvěru pro zobrazení amortizačního grafu.
      </div>
    );
  }

  return (
    <div className="h-64 w-full mt-8">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        Projekce splácení (zůstatek jistiny)
      </h3>
      <p className="sr-only">
        Graf zobrazuje klesající zůstatek jistiny v průběhu splatnosti úvěru.
        Měna: {currency === "CZK" ? "koruna česká" : currency}.
      </p>
      <div className="h-48 w-full min-h-0 overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="rok" stroke="#9ca3af" fontSize={12} name="Rok" />
          <YAxis
            stroke="#9ca3af"
            fontSize={11}
            width={72}
            tickFormatter={(val) =>
              formatMoneyCompact(Number(val), currency as MoneyCurrency)
            }
          />
          <Tooltip
            formatter={(value) => [
              formatCurrency(Number(value), currency),
              "Zůstatek jistiny",
            ]}
            labelFormatter={(label) => `Rok ${label}`}
          />
          <Area
            type="monotone"
            dataKey="zůstatek"
            stroke="#10b981"
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
