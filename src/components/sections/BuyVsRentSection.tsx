"use client";

import { useEffect, useState } from "react";
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
import { Check, Scale, X } from "lucide-react";
import { ExpertAnalysisArticle } from "@/components/sections/ExpertAnalysisArticle";
import {
  generateBreakEvenChartData,
  getBuyVsRentCountryName,
  getBuyVsRentCurrency,
  getBuyVsRentData,
  verdictStyles,
  type BreakEvenChartPoint,
} from "@/lib/buy-vs-rent-data";
import {
  countryConfigs,
  countryOrder,
  formatCurrency,
  type CountryId,
  type CurrencyCode,
} from "@/lib/calculators";

function ProsConsTable({ countryId }: { countryId: CountryId }) {
  const data = getBuyVsRentData(countryId);

  const columns = [
    {
      title: "Koupě — výhody",
      items: data.buyPros,
      icon: Check,
      headerClass: "bg-emerald-50 text-emerald-800",
      iconClass: "text-emerald-600",
    },
    {
      title: "Koupě — nevýhody",
      items: data.buyCons,
      icon: X,
      headerClass: "bg-emerald-50/60 text-emerald-700",
      iconClass: "text-rose-500",
    },
    {
      title: "Nájem — výhody",
      items: data.rentPros,
      icon: Check,
      headerClass: "bg-rose-50 text-rose-800",
      iconClass: "text-emerald-600",
    },
    {
      title: "Nájem — nevýhody",
      items: data.rentCons,
      icon: X,
      headerClass: "bg-rose-50/60 text-rose-700",
      iconClass: "text-rose-500",
    },
  ];

  return (
    <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-gray-900/5 shadow-lg shadow-gray-900/5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {columns.map((col) => (
          <div key={col.title} className="bg-white">
            <div
              className={`px-4 py-3 text-sm font-bold border-b border-gray-100 ${col.headerClass}`}
            >
              {col.title}
            </div>
            <ul className="p-4 space-y-3">
              {col.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                >
                  <col.icon
                    className={`h-4 w-4 mt-0.5 shrink-0 ${col.iconClass}`}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakEvenChart({
  data,
  currency,
  breakEvenYears,
}: {
  data: BreakEvenChartPoint[];
  currency: CurrencyCode;
  breakEvenYears: number;
}) {
  return (
    <div className="mt-10 rounded-2xl bg-white/80 backdrop-blur-md p-6 ring-1 ring-gray-900/5 shadow-lg shadow-gray-900/5">
      <h3 className="text-lg font-semibold text-text-dark mb-1">
        Break-even analýza
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Kumulativní náklady koupě vs. nájmu v čase. Zlomový bod pro tuto zemi
        je přibližně{" "}
        <span className="font-semibold text-deep-teal">
          {breakEvenYears} let
        </span>
        .
      </p>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="rok"
              stroke="#9ca3af"
              fontSize={12}
              label={{
                value: "Čas (roky)",
                position: "insideBottom",
                offset: -5,
                fill: "#6b7280",
                fontSize: 12,
              }}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(val) => `${(Number(val) / 1000).toFixed(0)}k`}
              label={{
                value: "Kumulativní náklady",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
                fontSize: 12,
              }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0), currency),
                String(name),
              ]}
            />
            <Legend />
            <ReferenceLine
              x={`Rok ${breakEvenYears}`}
              stroke="#0d9488"
              strokeDasharray="4 4"
              label={{
                value: "Break-even",
                position: "top",
                fill: "#0d9488",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="koupě"
              stroke="#065f46"
              strokeWidth={2}
              dot={false}
              name="Náklady koupě"
            />
            <Line
              type="monotone"
              dataKey="nájem"
              stroke="#b91c1c"
              strokeWidth={2}
              dot={false}
              name="Náklady nájmu"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FinancialVerdict({ countryId }: { countryId: CountryId }) {
  const countryName = getBuyVsRentCountryName(countryId);
  const data = getBuyVsRentData(countryId);
  const styles = verdictStyles[data.winnerTone];

  return (
    <div className={`mt-8 p-6 ${styles.card} text-white rounded-2xl`}>
      <h3 className="text-xl font-bold mb-2">
        Finanční verdikt pro {countryName}
      </h3>
      <p className={`${styles.text} leading-relaxed`}>{data.analysis}</p>
      <div
        className={`mt-4 inline-block ${styles.badge} px-4 py-2 rounded-full font-bold`}
      >
        Vítěz: {data.winner}
      </div>
    </div>
  );
}

export function BuyVsRentSection({
  countryId,
  sectionId = "koupe-vs-najem",
  embedded = false,
}: {
  countryId?: CountryId;
  sectionId?: string;
  embedded?: boolean;
} = {}) {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>(
    countryId ?? "cz"
  );

  useEffect(() => {
    if (countryId) {
      setSelectedCountry(countryId);
    }
  }, [countryId]);

  const chartData = generateBreakEvenChartData(selectedCountry);
  const currency = getBuyVsRentCurrency(selectedCountry);
  const countryData = getBuyVsRentData(selectedCountry);
  const config = countryConfigs[selectedCountry];

  return (
    <section
      id={sectionId}
      className={
        embedded
          ? "relative scroll-mt-32"
          : "relative py-20 lg:py-28 overflow-hidden scroll-mt-28"
      }
    >
      {!embedded && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/80" />
      )}

      <div className={embedded ? "relative" : "container relative mx-auto px-4 lg:px-8"}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-deep-teal/10 px-4 py-1.5 text-sm font-semibold text-deep-teal mb-4">
            <Scale className="h-4 w-4" />
            Expertní srovnávač
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark mb-3">
            ROI kalkulačka: Koupě vs. Nájem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Porovnejte ekonomiku vlastnictví a nájmu pro vybranou zemi.
            Model vychází z referenční ceny{" "}
            {formatCurrency(config.defaultPrice, currency)} a výnosu z nájmu{" "}
            {(config.defaultRentalYield * 100).toFixed(1)} % p.a.
          </p>
        </div>

        {!countryId && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {countryOrder.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCountry(id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCountry === id
                    ? "bg-deep-teal text-white shadow-md shadow-deep-teal/20"
                    : "bg-white text-muted-foreground ring-1 ring-gray-200 hover:ring-deep-teal/30 hover:text-deep-teal"
                }`}
              >
                {countryConfigs[id].label}
              </button>
            ))}
          </div>
        )}

        <BreakEvenChart
          data={chartData}
          currency={currency}
          breakEvenYears={countryData.breakEvenYears}
        />

        <ProsConsTable countryId={selectedCountry} />

        <ExpertAnalysisArticle countryId={selectedCountry} />

        <FinancialVerdict countryId={selectedCountry} />
      </div>
    </section>
  );
}
