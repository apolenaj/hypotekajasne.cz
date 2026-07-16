"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, LineChart as LineChartIcon } from "lucide-react";
import {
  calculateTimeMachine,
  getDefaultTimeMachineCash,
  getHistoricalChartData,
  getHistoricalSnapshots,
  getPurchasableYears,
  HISTORICAL_END_YEAR,
} from "@/lib/historical-data";
import { getHistoricalAnalysis } from "@/lib/historical-analysis";
import {
  countryConfigs,
  countryOrder,
  formatCurrency,
  type CountryId,
  type CurrencyCode,
} from "@/lib/calculators";

function MacroChart({
  countryId,
  currency,
}: {
  countryId: CountryId;
  currency: CurrencyCode;
}) {
  const data = getHistoricalChartData(countryId);

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md p-6 ring-1 ring-gray-900/5 shadow-lg shadow-gray-900/5">
      <h3 className="text-lg font-semibold text-text-dark mb-1">
        Makroekonomický vývoj 1996–{HISTORICAL_END_YEAR}
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Ceny nemovitostí ({currency}), měsíční nájmy a úrokové sazby hypoték v
        čase.
      </p>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
            <YAxis
              yAxisId="left"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(val) => `${(Number(val) / 1_000_000).toFixed(1)}M`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#dc2626"
              fontSize={12}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              formatter={(value, name) => {
                const num = Number(value ?? 0);
                if (name === "Úroková sazba") {
                  return [`${num}%`, String(name)];
                }
                return [formatCurrency(num, currency), String(name)];
              }}
              labelFormatter={(label) => `Rok ${label}`}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="villa"
              fill="#10b981"
              stroke="#059669"
              name="Rodinný dům / Vila"
              fillOpacity={0.2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="apt70m"
              stroke="#0f766e"
              strokeWidth={3}
              dot={false}
              name="Byt 70m²"
            />
            <Line
              yAxisId="right"
              type="stepAfter"
              dataKey="rate"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Úroková sazba"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Vývoj nájemného (měsíčně)
        </p>
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} />
              <YAxis
                stroke="#9ca3af"
                fontSize={11}
                tickFormatter={(val) => `${(Number(val) / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0), currency),
                  "Nájem (měsíc)",
                ]}
                labelFormatter={(label) => `Rok ${label}`}
              />
              <Line
                type="monotone"
                dataKey="rent"
                stroke="#c5a059"
                strokeWidth={2}
                dot={false}
                name="Nájem (měsíc)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function TimeMachine({
  countryId,
  currency,
}: {
  countryId: CountryId;
  currency: CurrencyCode;
}) {
  const purchasableYears = getPurchasableYears(countryId);
  const [startYear, setStartYear] = useState(2006);
  const [initialCash, setInitialCash] = useState(() =>
    getDefaultTimeMachineCash(countryId)
  );

  const result = useMemo(
    () => calculateTimeMachine(countryId, startYear, initialCash),
    [countryId, startYear, initialCash]
  );

  const barData = result
    ? [
        {
          name: "Reálná kupní síla",
          value: result.cashRealValueEnd,
          fill: "#ef4444",
        },
        {
          name: "Hodnota nemovitosti",
          value: result.propertyValueEnd,
          fill: "#10b981",
        },
      ]
    : [];

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-gray-900">
          Investiční stroj času
        </h2>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        Vyberte rok fiktivního nákupu a částku. Porovnáme, jak by vaše peníze
        vydržely na účtu (inflace) vs. v nemovitosti (růst trhu do roku{" "}
        {HISTORICAL_END_YEAR}).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <label
            htmlFor="time-machine-year"
            className="block text-sm font-bold text-gray-700 mb-2"
          >
            Rok fiktivního nákupu
          </label>
          <select
            id="time-machine-year"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 text-lg font-bold"
          >
            {purchasableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="time-machine-cash"
            className="block text-sm font-bold text-gray-700 mb-2"
          >
            Investovaná částka ({currency})
          </label>
          <input
            id="time-machine-cash"
            type="number"
            min={1}
            value={initialCash}
            onChange={(e) => setInitialCash(Number(e.target.value) || 0)}
            className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 text-lg font-bold"
          />
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="p-5 border-l-4 border-red-500 bg-red-50 rounded-r-xl">
              <p className="text-sm text-red-800 font-bold mb-1">
                Hotovost na běžném účtu (vlivem inflace)
              </p>
              <p className="text-3xl font-black text-red-900">
                {formatCurrency(Math.round(result.cashRealValueEnd), currency)}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Reálná kupní síla vašich{" "}
                {formatCurrency(initialCash, currency)} z roku {startYear} v
                dnešních cenách.
              </p>
            </div>
            <div className="p-5 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-xl">
              <p className="text-sm text-emerald-800 font-bold mb-1">
                Hodnota v nemovitosti (růst trhu)
              </p>
              <p className="text-3xl font-black text-emerald-900">
                {formatCurrency(Math.round(result.propertyValueEnd), currency)}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Hrubý zisk: +
                {formatCurrency(Math.round(result.propertyGain), currency)} (bez
                započtení zisku z nájmu).
              </p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) =>
                    `${(Number(val) / 1_000_000).toFixed(1)}M`
                  }
                  fontSize={11}
                />
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(Math.round(Number(value ?? 0)), currency)
                  }
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoricalArticle({ countryId }: { countryId: CountryId }) {
  const data = getHistoricalAnalysis(countryId);

  return (
    <article className="mt-16 max-w-4xl mx-auto">
      <h3 className="font-heading text-3xl font-extrabold text-gray-900 mb-6">
        {data.title}
      </h3>
      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="leading-relaxed">{data.intro}</p>
        {data.sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              {section.title}
            </h4>
            <p className="leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function HistoricalTrendsView({
  countryId,
  embedded = false,
}: {
  countryId?: CountryId;
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

  const config = countryConfigs[selectedCountry];
  const snapshots = getHistoricalSnapshots(selectedCountry);

  return (
    <section
      id={embedded ? undefined : "historicky-vyvoj"}
      className={
        embedded
          ? "relative"
          : "relative py-20 lg:py-28 overflow-hidden scroll-mt-28"
      }
    >
      {!embedded && (
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-white" />
      )}

      <div className={embedded ? "relative" : "container relative mx-auto px-4 lg:px-8"}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-deep-teal/10 px-4 py-1.5 text-sm font-semibold text-deep-teal mb-4">
            <LineChartIcon className="h-4 w-4" />
            Expertní analýza trhu
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark mb-3">
            Historický vývoj
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            30 let vývoje cen, nájmů a úrokových sazeb. Investiční stroj času
            ukáže rozdíl mezi držení hotovosti a vlastnictvím nemovitosti.
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

        <div className="mb-4 flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
          <span>
            Byt 70m² ({HISTORICAL_END_YEAR}):{" "}
            <strong className="text-text-dark">
              {formatCurrency(
                snapshots.find((d) => d.year === HISTORICAL_END_YEAR)?.apt70m ??
                  0,
                config.currency
              )}
            </strong>
          </span>
          <span>
            Úrok ({HISTORICAL_END_YEAR}):{" "}
            <strong className="text-text-dark">
              {snapshots.find((d) => d.year === HISTORICAL_END_YEAR)?.rate}%
            </strong>
          </span>
          <span>
            Nájem ({HISTORICAL_END_YEAR}):{" "}
            <strong className="text-text-dark">
              {formatCurrency(
                snapshots.find((d) => d.year === HISTORICAL_END_YEAR)?.rent ?? 0,
                config.currency
              )}
              /měs.
            </strong>
          </span>
        </div>

        <MacroChart countryId={selectedCountry} currency={config.currency} />

        <TimeMachine
          key={selectedCountry}
          countryId={selectedCountry}
          currency={config.currency}
        />

        <HistoricalArticle countryId={selectedCountry} />
      </div>
    </section>
  );
}
