"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Area,
  AreaChart,
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
import {
  Activity,
  Building2,
  LineChart as LineChartIcon,
  MapPin,
  Radar,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  analyzeInvestmentModel,
  defaultModelerForm,
  formatCzk,
  generateModelerSwot,
  MODELER_SCENARIOS,
  type ChartProjectionPoint,
  type ModelerFormInput,
  type ScenarioKey,
  type SwotSection,
} from "@/lib/investment-modeler";
import {
  computeMarketPrice,
  computeMarketRent,
  getAdjustedMetrics,
} from "@/lib/market-metrics";
import { formatNumber, parseNumber } from "@/lib/utils";

const LOCATIONS_DATA: Record<string, string[]> = {
  "Česká republika": ["Praha", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc"],
  Slovensko: ["Bratislava", "Košice", "Žilina", "Banská Bystrica", "Nitra"],
  Chorvatsko: ["Záhřeb", "Split", "Dubrovník", "Zadar", "Rijeka"],
  Španělsko: [
    "Madrid",
    "Barcelona",
    "Valencie",
    "Sevilla",
    "Málaga",
    "Alicante",
  ],
  Itálie: ["Řím", "Milán", "Neapol", "Turín", "Florencie", "Bologna"],
  "SAE (Dubaj)": ["Dubaj", "Abú Dhabí", "Šardžá"],
  "Saúdská Arábie": ["Rijád", "Džidda", "Dammám"],
  "Bali (Indonésie)": ["Denpasar", "Ubud", "Canggu", "Seminyak"],
};

const PROPERTY_TYPES = ["Byt", "Dům", "Komerce"] as const;
const PURPOSES = [
  "Vlastní bydlení",
  "Dlouhodobý nájem",
  "Krátkodobý nájem",
  "Flipping",
] as const;

const swotColorMap: Record<SwotSection["color"], string> = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-900",
  orange: "bg-orange-50 border-orange-100 text-orange-900",
  blue: "bg-blue-50 border-blue-100 text-blue-900",
  red: "bg-red-50 border-red-100 text-red-900",
};

function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

function ModelerForm({
  form,
  onChange,
}: {
  form: ModelerFormInput;
  onChange: (next: ModelerFormInput) => void;
}) {
  const updateForm = <K extends keyof ModelerFormInput>(
    key: K,
    value: ModelerFormInput[K]
  ) => onChange({ ...form, [key]: value });

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center gap-2 text-deep-teal">
          <MapPin className="h-5 w-5" />
          <h3 className="font-bold">Lokalita</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Země
            </label>
            <select
              value={form.country || ""}
              onChange={(e) => {
                onChange({
                  ...form,
                  country: e.target.value,
                  city: "",
                });
              }}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 font-bold outline-none focus:border-emerald-500"
            >
              <option value="">Vyberte zemi...</option>
              {Object.keys(LOCATIONS_DATA).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Město
            </label>
            <select
              value={form.city || ""}
              onChange={(e) => updateForm("city", e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 font-bold outline-none focus:border-emerald-500 disabled:opacity-50"
              disabled={!form.country}
            >
              <option value="">
                {form.country ? "Vyberte město..." : "Nejdříve vyberte zemi"}
              </option>
              {form.country &&
                LOCATIONS_DATA[form.country]?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2 text-deep-teal">
          <Building2 className="h-5 w-5" />
          <h3 className="font-bold">Parametry nemovitosti</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Typ">
            <select
              className={inputClass}
              value={form.propertyType}
              onChange={(e) => updateForm("propertyType", e.target.value)}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Plocha (m²)">
            <input
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={formatNumber(form.area || "")}
              onChange={(e) =>
                updateForm("area", Number(parseNumber(e.target.value)) || 0)
              }
            />
          </FormField>
          <FormField label="Účel">
            <select
              className={inputClass}
              value={form.purpose}
              onChange={(e) => updateForm("purpose", e.target.value)}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2 text-deep-teal">
          <Wallet className="h-5 w-5" />
          <h3 className="font-bold">Finance</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Kupní cena (CZK)">
            <input
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={formatNumber(form.price || "")}
              onChange={(e) =>
                updateForm("price", Number(parseNumber(e.target.value)) || 0)
              }
            />
          </FormField>
          <FormField
            label="Měsíční nájem (CZK)"
            hint={`Prázdné = odhad ${getAdjustedMetrics(
              form.city,
              form.propertyType || "Byt",
              form.purpose || "Dlouhodobý nájem"
            ).yield.toFixed(2)} % ročně z ceny (průměr lokality pro ${
              form.propertyType || "Byt"
            } / ${form.purpose || "Dlouhodobý nájem"})`}
          >
            <input
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={formatNumber(form.rent || "")}
              placeholder="Auto"
              onChange={(e) => updateForm("rent", parseNumber(e.target.value))}
            />
          </FormField>
          <FormField label="Výše hypotéky (CZK)">
            <input
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={formatNumber(form.mortgageAmount || "")}
              onChange={(e) =>
                updateForm(
                  "mortgageAmount",
                  Number(parseNumber(e.target.value)) || 0
                )
              }
            />
          </FormField>
          <FormField label="Vlastní kapitál / equity (CZK)">
            <input
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={formatNumber(form.equity || "")}
              onChange={(e) =>
                updateForm("equity", Number(parseNumber(e.target.value)) || 0)
              }
            />
          </FormField>
          <FormField label="Úroková sazba (%)">
            <input
              type="number"
              className={inputClass}
              value={form.interestRate}
              min={0}
              step={0.1}
              onChange={(e) =>
                updateForm("interestRate", Number(e.target.value))
              }
            />
          </FormField>
          <FormField
            label="Měsíční splátka (CZK)"
            hint="Prázdné = anuitní výpočet"
          >
            <input
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={formatNumber(form.monthlyPayment || "")}
              placeholder="Auto"
              onChange={(e) =>
                updateForm("monthlyPayment", parseNumber(e.target.value))
              }
            />
          </FormField>
          <FormField label="Doba splácení (roky)">
            <input
              type="number"
              className={inputClass}
              value={form.durationYears}
              min={1}
              max={40}
              onChange={(e) =>
                updateForm("durationYears", Number(e.target.value))
              }
            />
          </FormField>
          <FormField label="Datum koupě">
            <input
              type="date"
              className={inputClass}
              value={form.purchaseDate}
              onChange={(e) => updateForm("purchaseDate", e.target.value)}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

function KpiCards({
  netYield,
  cashFlow,
  propertyValue10y,
  paymentAuto,
  crossoverYear,
  realWealth30y,
  city,
  propertyType,
  purpose,
}: {
  netYield: number;
  cashFlow: number;
  propertyValue10y: number;
  paymentAuto: boolean;
  crossoverYear: number | null;
  realWealth30y: number;
  city: string;
  propertyType: string;
  purpose: string;
}) {
  const currentUIType = propertyType || "Byt";
  const currentUIPurpose = purpose || "Dlouhodobý nájem";
  const displayYield = getAdjustedMetrics(
    city,
    currentUIType,
    currentUIPurpose
  ).yield.toFixed(2);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm font-bold text-emerald-800">Čistý roční výnos</p>
        <p className="mt-1 text-2xl font-black text-emerald-900">
          {netYield.toFixed(2)} %
        </p>
      </div>
      <div
        className={`rounded-2xl border p-5 ${
          cashFlow >= 0
            ? "border-blue-100 bg-blue-50"
            : "border-orange-100 bg-orange-50"
        }`}
      >
        <p
          className={`text-sm font-bold ${
            cashFlow >= 0 ? "text-blue-800" : "text-orange-800"
          }`}
        >
          Měsíční Cash-Flow
        </p>
        <p
          className={`mt-1 text-2xl font-black ${
            cashFlow >= 0 ? "text-blue-900" : "text-orange-900"
          }`}
        >
          {cashFlow >= 0 ? "+" : ""}
          {formatCzk(cashFlow)}
        </p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <p className="text-sm font-bold text-violet-800">
          Predikovaná hodnota za 10 let
        </p>
        <p className="mt-1 text-2xl font-black text-violet-900">
          {formatCzk(propertyValue10y)}
        </p>
      </div>
      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
        <p className="text-sm font-bold text-teal-800">
          Reálné bohatství (30 let)
        </p>
        <p className="mt-1 text-2xl font-black text-teal-900">
          {formatCzk(realWealth30y)}
        </p>
        {crossoverYear && (
          <p className="mt-1 text-xs text-teal-700">
            S&P 500 překryje dluh v roce {crossoverYear}
          </p>
        )}
      </div>
      {(city || paymentAuto) && (
        <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Sparkles className="mr-2 inline h-4 w-4" />
          {city && (
            <span>
              Auto-dopočet: nájem ({displayYield} % p.a. — průměr lokality
              pro {currentUIType} / {currentUIPurpose})
            </span>
          )}
          {city && paymentAuto && " · "}
          {paymentAuto && "anuitní splátka"}
        </div>
      )}
    </div>
  );
}

function ScenarioTabs({
  active,
  onChange,
}: {
  active: ScenarioKey;
  onChange: (key: ScenarioKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MODELER_SCENARIOS.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
            active === s.key
              ? "bg-deep-teal text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function SnowballChart({
  data,
  acceleratedPayoffYear,
}: {
  data: ChartProjectionPoint[];
  acceleratedPayoffYear: number | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 ring-1 ring-gray-900/5">
      <div className="mb-4 flex items-center gap-2">
        <LineChartIcon className="h-5 w-5 text-deep-teal" />
        <h3 className="font-bold text-gray-900">
          Sněhová koule: hodnota nemovitosti vs. splácení
        </h3>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Celý nájem směřuje jako mimořádná splátka hypotéky.
        {acceleratedPayoffYear
          ? ` Hypotéka splacena v roce ${acceleratedPayoffYear}.`
          : " Hypotéka není splacena do 30 let."}
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="rok" fontSize={12} interval={4} />
            <YAxis
              tickFormatter={(val) => `${(Number(val) / 1_000_000).toFixed(1)}M`}
              fontSize={12}
            />
            <Tooltip formatter={(value) => formatCzk(Number(value ?? 0))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="hodnotaNemovitosti"
              name="Hodnota nemovitosti"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="zustatekHypoteky"
              name="Zůstatek hypotéky (standard)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="zustatekSnihovaKoule"
              name="Sněhová koule"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
            {acceleratedPayoffYear ? (
              <ReferenceLine
                x={`Rok ${acceleratedPayoffYear}`}
                stroke="#8b5cf6"
                strokeDasharray="4 4"
                label={{
                  value: "Splaceno",
                  position: "top",
                  fontSize: 11,
                  fill: "#7c3aed",
                }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CrossoverChart({
  data,
  crossoverYear,
}: {
  data: ChartProjectionPoint[];
  crossoverYear: number | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 ring-1 ring-gray-900/5">
      <h4 className="mb-2 font-bold text-gray-900">
        Bod zvratu: Kdy S&P 500 zaplatí hypotéku za vás?
      </h4>
      {crossoverYear ? (
        <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-600">
          Pokud přebytek z rostoucího nájmu investujete do indexu S&P 500, vaše
          portfolio dosáhne stejné výše jako zůstatek hypotéky v{" "}
          <strong>{crossoverYear}. roce</strong>. V ten moment můžete hypotéku
          jednorázově doplatit a nemovitost je vaše.
        </p>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          Při záporném cash-flow nebo nízkém přebytku portfolio nepřekryje
          hypotéku do 30 let.
        </p>
      )}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="rok" fontSize={12} interval={4} />
            <YAxis
              tickFormatter={(val) => `${(Number(val) / 1_000_000).toFixed(1)}M`}
              fontSize={12}
            />
            <Tooltip formatter={(value) => formatCzk(Number(value ?? 0))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="zustatekHypoteky"
              name="Zůstatek hypotéky"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="hodnotaSP500"
              name="Hodnota portfolia (S&P 500)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            {crossoverYear ? (
              <ReferenceLine
                x={`Rok ${crossoverYear}`}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                label={{
                  value: "Překrytí",
                  position: "top",
                  fontSize: 11,
                  fill: "#2563eb",
                }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RealWealthChart({ data }: { data: ChartProjectionPoint[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 ring-1 ring-gray-900/5">
      <h4 className="mb-2 font-bold text-gray-900">
        Tvorba bohatství a vliv inflace (2,5 % p.a.)
      </h4>
      <p className="mb-4 text-sm text-gray-600">
        Graf ukazuje růst čistého majetku (hodnota nemovitosti mínus dluh plus
        akcie) v nominální hodnotě oproti reálné kupní síle znehodnocené
        inflací.
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="rok" fontSize={12} interval={4} />
            <YAxis
              tickFormatter={(val) => `${(Number(val) / 1_000_000).toFixed(1)}M`}
              fontSize={12}
            />
            <Tooltip formatter={(value) => formatCzk(Number(value ?? 0))} />
            <Legend />
            <Area
              type="monotone"
              dataKey="nominalniBohatstvi"
              name="Nominální majetek (neočištěno)"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="realneBohatstvi"
              name="Reálná kupní síla (očištěno o inflaci)"
              stroke="#047857"
              fill="#047857"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SwotGrid({ sections }: { sections: SwotSection[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 ring-1 ring-gray-900/5">
      <div className="mb-6 flex items-center gap-2">
        <Radar className="h-5 w-5 text-deep-teal" />
        <h3 className="font-bold text-gray-900">SWOT analýza transakce</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`rounded-xl border p-4 ${swotColorMap[section.color]}`}
          >
            <h4 className="mb-3 font-bold">{section.title}</h4>
            <ul className="space-y-2 text-sm leading-relaxed">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
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

function InflationSummary({
  grossProfit,
  inflationAdjusted,
  cumulativeRent,
  nominalWealth,
  realWealth,
}: {
  grossProfit: number;
  inflationAdjusted: number;
  cumulativeRent: number;
  nominalWealth: number;
  realWealth: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Kumulativní nájem (30 let)
        </p>
        <p className="mt-1 text-lg font-black text-gray-900">
          {formatCzk(cumulativeRent)}
        </p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Hrubý zisk (30 let)
        </p>
        <p className="mt-1 text-lg font-black text-emerald-900">
          {formatCzk(grossProfit)}
        </p>
      </div>
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
          Po inflaci 2,5 % p.a.
        </p>
        <p className="mt-1 text-lg font-black text-orange-900">
          {formatCzk(inflationAdjusted)}
        </p>
      </div>
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700">
          Nominální majetek (rok 30)
        </p>
        <p className="mt-1 text-lg font-black text-green-900">
          {formatCzk(nominalWealth)}
        </p>
      </div>
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Reálná kupní síla (rok 30)
        </p>
        <p className="mt-1 text-lg font-black text-teal-900">
          {formatCzk(realWealth)}
        </p>
      </div>
    </div>
  );
}

export function InvestmentModelerView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-muted-foreground">
          Načítám Investiční rentgen…
        </div>
      }
    >
      <InvestmentModelerInner />
    </Suspense>
  );
}

function InvestmentModelerInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ModelerFormInput>(defaultModelerForm);
  const [scenario, setScenario] = useState<ScenarioKey>("moderate");
  const prefillsApplied = useRef(false);

  useEffect(() => {
    if (prefillsApplied.current) return;
    const country = searchParams.get("country");
    const cityParam = searchParams.get("city");
    if (!country || !(country in LOCATIONS_DATA)) return;

    const cities = LOCATIONS_DATA[country] ?? [];
    const city =
      cityParam && cities.includes(cityParam)
        ? cityParam
        : cities[0] ?? "";

    prefillsApplied.current = true;
    setForm((prev) => ({
      ...prev,
      country,
      city,
    }));
  }, [searchParams]);

  useEffect(() => {
    const propType = form.propertyType || "Byt";
    const purpose = form.purpose || "Dlouhodobý nájem";

    if (form.city && form.area) {
      const autoPrice = computeMarketPrice(
        form.area,
        form.city,
        propType,
        purpose
      );
      const autoRent = computeMarketRent(
        autoPrice,
        form.city,
        propType,
        purpose
      );

      setForm((prev) => ({
        ...prev,
        price: autoPrice,
        rent: String(autoRent),
      }));
    }
  }, [form.city, form.area, form.propertyType, form.purpose]);

  const analysis = useMemo(() => analyzeInvestmentModel(form), [form]);
  const active = analysis.scenarios[scenario];
  const swot = useMemo(
    () => generateModelerSwot(analysis.input, active),
    [analysis.input, active]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex items-center gap-3 text-emerald-200">
            <Activity className="h-6 w-6" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Investiční modelář
            </span>
          </div>
          <h1 className="mt-4 font-heading text-3xl font-black md:text-5xl">
            Investiční rentgen 360°
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-emerald-50/90 leading-relaxed">
            Cena peněz v čase, náklad obětované příležitosti a reálná ochrana
            před inflací. Měsíční simulace na 30 let a srovnání se S&P 500.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <TrendingUp className="h-5 w-5 text-deep-teal" />
                Vstupní parametry
              </h2>
              <ModelerForm form={form} onChange={setForm} />
            </div>
          </aside>

          <main className="space-y-8 lg:col-span-8">
            <KpiCards
              netYield={active.netYieldAnnual}
              cashFlow={analysis.input.cashFlow}
              propertyValue10y={active.propertyValue10y}
              paymentAuto={analysis.input.paymentAutoFilled}
              crossoverYear={active.crossoverYear}
              realWealth30y={active.realWealth30y}
              city={form.city}
              propertyType={form.propertyType}
              purpose={form.purpose}
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 ring-1 ring-gray-900/5">
              <p className="mb-4 text-sm font-semibold text-gray-700">
                Scénář růstu ceny a nájmu
              </p>
              <ScenarioTabs active={scenario} onChange={setScenario} />
              <p className="mt-3 text-xs text-muted-foreground">
                {active.scenario.label}: růst ceny{" "}
                {(active.scenario.priceGrowth * 100).toFixed(1)} % p.a., růst
                nájmu {(active.scenario.rentGrowth * 100).toFixed(1)} % p.a. ·
                S&P 500 {8.5} % p.a. · inflace {2.5} % p.a.
              </p>
            </div>

            <SnowballChart
              data={active.chartData}
              acceleratedPayoffYear={active.acceleratedPayoffYear}
            />

            <CrossoverChart
              data={active.chartData}
              crossoverYear={active.crossoverYear}
            />

            <RealWealthChart data={active.chartData} />

            <InflationSummary
              grossProfit={active.grossProfit30y}
              inflationAdjusted={active.inflationAdjustedProfit30y}
              cumulativeRent={active.cumulativeRent30y}
              nominalWealth={active.nominalWealth30y}
              realWealth={active.realWealth30y}
            />

            <SwotGrid sections={swot} />
          </main>
        </div>
      </div>
    </div>
  );
}
