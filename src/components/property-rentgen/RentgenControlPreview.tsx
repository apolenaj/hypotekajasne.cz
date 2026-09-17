"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import {
  formatModelCzk,
  formatModelPct,
  runControlModel,
  runControlScenarios,
} from "@/lib/property-rentgen/control-model";
import { routes } from "@/lib/routes";

/**
 * Landing preview — four metrics + one chart + short conclusion
 * from the binding control model (no marketing numbers).
 */
export function RentgenControlPreview() {
  const model = useMemo(() => runControlModel(), []);
  const scenarios = useMemo(() => runControlScenarios(), []);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const chartData = scenarios.map((s) => ({
    name: s.label,
    cashFlow: Math.round(s.monthlyCashFlowCzk * 100) / 100,
  }));

  return (
    <section
      id="ukazka-nahled"
      className="scroll-mt-24 border-b border-border bg-[#f4f6f5] py-10 sm:py-12"
      aria-labelledby="preview-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Modelový příklad
            </p>
            <h2
              id="preview-heading"
              className="mt-1 font-heading text-2xl font-bold text-text-dark sm:text-3xl"
            >
              Co uvidíte ve výstupu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Smyšlená nemovitost, přesně spočtené vstupy. Čísla pocházejí z
              jednotného výpočetního modelu — ne z marketingového textu.
            </p>
          </div>
          <Link
            href={routes.investicniRentgenUkazka}
            className="inline-flex rounded-xl bg-deep-teal px-5 py-3 text-sm font-bold text-white"
          >
            Prohlédnout modelový rozbor
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Potřebná vlastní hotovost",
              value: formatModelCzk(model.totalOwnCashIncludingReserveCzk),
              hint: "Včetně rezervy 150 000 Kč",
            },
            {
              label: "Měsíční peněžní tok",
              value: formatModelCzk(model.monthlyCashFlowCzk, 2),
              hint: "Po rezervě, před daní z příjmů",
            },
            {
              label: "Hrubý výnos",
              value: formatModelPct(model.grossYieldOnPurchase, 2),
              hint: "Potenciální nájem / kupní cena",
            },
            {
              label: "Cena / m²",
              value: formatModelCzk(model.pricePerM2Czk),
              hint: "Z kupní ceny a plochy",
            },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-border bg-white px-4 py-4 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1 font-heading text-xl font-bold tabular-nums text-text-dark">
                {k.value}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{k.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <h3 className="font-semibold text-text-dark">
            Tři modelové situace — měsíční peněžní tok
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Srovnání počátečních podmínek, nikoli predikce budoucnosti. Záporné
            hodnoty jsou záměrně viditelné.
          </p>
          <div className="mt-4 h-[220px] w-full min-h-0 sm:h-[260px]">
            {chartsReady ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(v: number) =>
                    `${Math.round(v / 1000)}k`
                  }
                  width={40}
                />
                <ReferenceLine y={0} stroke="#1a1a1a" />
                <Tooltip
                  formatter={(v) =>
                    formatModelCzk(typeof v === "number" ? v : Number(v), 2)
                  }
                />
                <Bar dataKey="cashFlow" name="Peněžní tok / měs." radius={[6, 6, 0, 0]}>
                  {chartData.map((row) => (
                    <Cell
                      key={row.name}
                      fill={row.cashFlow >= 0 ? "#047857" : "#dc2626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Načítám graf…
              </div>
            )}
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-xs">
              <caption className="sr-only">
                Měsíční peněžní tok ve třech scénářích
              </caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Scénář</th>
                  <th className="py-2 pr-3 font-semibold">Tok / měs.</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} className="border-b border-border/70">
                    <td className="py-2 pr-3 text-text-dark">{s.label}</td>
                    <td className="py-2 tabular-nums text-text-dark">
                      {formatModelCzk(s.monthlyCashFlowCzk, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed text-text-dark">
          {model.baseConclusionCs}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Model verze {model.version}. Záporný tok a splácení jistiny mohou
          existovat současně — jistina není příjem na účet.
        </p>
      </div>
    </section>
  );
}
