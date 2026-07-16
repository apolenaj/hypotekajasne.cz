"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { getPredictionAnalysis } from "@/lib/prediction-analysis";
import {
  calculateProjection,
  getDefaultProjectionPrice,
  getPredictionConfig,
  PROJECTION_YEARS,
  scenarioKeys,
  type ScenarioKey,
} from "@/lib/prediction-configs";
import {
  countryConfigs,
  countryOrder,
  formatCurrency,
  type CountryId,
  type CurrencyCode,
} from "@/lib/calculators";

function ResultCards({
  summary,
  currency,
}: {
  summary: ReturnType<typeof calculateProjection>["summary"];
  currency: CurrencyCode;
}) {
  const { finalYear, inflationLoss } = summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
        <p className="text-emerald-800 font-bold mb-1">Hodnota za {PROJECTION_YEARS} let</p>
        <p className="text-3xl font-black text-emerald-900">
          {formatCurrency(finalYear.hodnotaNemovitosti, currency)}
        </p>
      </div>
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <p className="text-blue-800 font-bold mb-1">Vybráno na nájmu celkem</p>
        <p className="text-3xl font-black text-blue-900">
          {formatCurrency(finalYear.kumulativniNajem, currency)}
        </p>
      </div>
      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
        <p className="text-orange-800 font-bold mb-1">
          Sežráno inflací (ztráta kupní síly)
        </p>
        <p className="text-3xl font-black text-orange-900">
          − {formatCurrency(Math.round(inflationLoss), currency)}
        </p>
      </div>
    </div>
  );
}

function ProjectionCharts({
  projectionData,
  summary,
  price,
  currency,
}: {
  projectionData: ReturnType<typeof calculateProjection>["data"];
  summary: ReturnType<typeof calculateProjection>["summary"];
  price: number;
  currency: CurrencyCode;
}) {
  const wealthBarData = [
    { name: "Původní investice", value: price, fill: "#9ca3af" },
    {
      name: "Nominální bohatství",
      value: summary.totalNominalWealth,
      fill: "#10b981",
    },
    {
      name: "Reálné bohatství",
      value: Math.round(summary.totalRealWealth),
      fill: "#047857",
    },
  ];

  const formatTooltip = (value: number) =>
    formatCurrency(Math.round(value), currency);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 ring-1 ring-gray-900/5">
        <h3 className="font-bold text-gray-900 mb-6">
          Vývoj hodnoty a nájmu v čase
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="rok" fontSize={12} />
              <YAxis
                tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                fontSize={12}
              />
              <Tooltip formatter={(v) => formatTooltip(Number(v ?? 0))} />
              <Area
                type="monotone"
                dataKey="hodnotaNemovitosti"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.35}
                name="Hodnota nemovitosti"
              />
              <Area
                type="monotone"
                dataKey="kumulativniNajem"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.35}
                name="Kumulativní nájem"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 ring-1 ring-gray-900/5">
        <h3 className="font-bold text-gray-900 mb-6">
          Nominální vs. reálný zisk (očištěno o inflaci)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wealthBarData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} interval={0} angle={-12} textAnchor="end" height={60} />
              <YAxis
                tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                fontSize={12}
              />
              <Tooltip formatter={(v) => formatTooltip(Number(v ?? 0))} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                {wealthBarData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PredictionArticle({ countryId }: { countryId: CountryId }) {
  const data = getPredictionAnalysis(countryId);

  return (
    <article className="bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-200 max-w-4xl mx-auto">
      <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
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

export function FutureProjectionsView({
  countryId,
  embedded = false,
}: {
  countryId?: CountryId;
  embedded?: boolean;
} = {}) {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>(
    countryId ?? "cz"
  );
  const [price, setPrice] = useState(() =>
    getDefaultProjectionPrice(countryId ?? "cz")
  );
  const [activeScenario, setActiveScenario] =
    useState<ScenarioKey>("moderate");

  useEffect(() => {
    if (countryId) {
      setSelectedCountry(countryId);
      setPrice(getDefaultProjectionPrice(countryId));
    }
  }, [countryId]);

  const config = getPredictionConfig(selectedCountry);
  const scenario = config.scenarios[activeScenario];

  const { data: projectionData, summary } = useMemo(
    () => calculateProjection(price, config, scenario),
    [price, config, scenario]
  );

  const handleCountryChange = (id: CountryId) => {
    setSelectedCountry(id);
    setPrice(getDefaultProjectionPrice(id));
  };

  return (
    <section
      id={embedded ? undefined : "potencialni-vyvoj"}
      className={
        embedded
          ? "relative"
          : "relative py-20 lg:py-28 overflow-hidden scroll-mt-28"
      }
    >
      {!embedded && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/80" />
      )}

      <div
        className={
          embedded
            ? "relative"
            : "container relative mx-auto px-4 lg:px-8 max-w-7xl"
        }
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-deep-teal/10 px-4 py-1.5 text-sm font-semibold text-deep-teal mb-4">
            <TrendingUp className="h-4 w-4" />
            Prediktivní simulátor
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            Potenciální vývoj a simulace bohatství ({PROJECTION_YEARS} let)
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vyberte tržní scénář a zjistěte, jak bude pracovat váš majetek —
            růst hodnoty, kumulativní nájem a dopad inflace na reálnou kupní
            sílu.
          </p>
        </div>

        {!countryId && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {countryOrder.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleCountryChange(id)}
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

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="w-full lg:w-1/3">
            <label
              htmlFor="projection-price"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Současná hodnota nemovitosti ({config.currency})
            </label>
            <input
              id="projection-price"
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-lg font-bold"
            />
          </div>
          <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-2">
            {scenarioKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveScenario(key)}
                className={`flex-1 p-3 rounded-xl font-bold text-sm transition-all ${
                  activeScenario === key
                    ? "bg-emerald-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {config.scenarios[key].name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
          <span>
            Růst cen:{" "}
            <strong className="text-text-dark">
              {(scenario.propGrowth * 100).toFixed(1)} % p.a.
            </strong>
          </span>
          <span>
            Růst nájmu:{" "}
            <strong className="text-text-dark">
              {(scenario.rentGrowth * 100).toFixed(1)} % p.a.
            </strong>
          </span>
          <span>
            Inflace:{" "}
            <strong className="text-text-dark">
              {(scenario.inflation * 100).toFixed(1)} % p.a.
            </strong>
          </span>
          <span>
            Startovní yield:{" "}
            <strong className="text-text-dark">
              {(config.yield * 100).toFixed(1)} %
            </strong>
          </span>
        </div>

        <ResultCards summary={summary} currency={config.currency} />

        <ProjectionCharts
          projectionData={projectionData}
          summary={summary}
          price={price}
          currency={config.currency}
        />

        <PredictionArticle countryId={selectedCountry} />
      </div>
    </section>
  );
}
