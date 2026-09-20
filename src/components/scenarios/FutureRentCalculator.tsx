"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";
import {
  computeFutureRent,
  FUTURE_RENT_MODEL_VERSION,
} from "@/lib/scenarios/future-rent-finance";

const field =
  "mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm tabular-nums outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20";

export function FutureRentCalculator({
  onSummary,
}: {
  onSummary?: (summary: Record<string, unknown>) => void;
} = {}) {
  const [rent, setRent] = useState(20_000);
  const [timing, setTiming] = useState<"existing" | "future">("future");
  const [otherIncome, setOtherIncome] = useState(50_000);
  const [share, setShare] = useState(70);
  const [loan, setLoan] = useState(4_000_000);
  const [rate, setRate] = useState(5);
  const [termYears, setTermYears] = useState(30);
  const [vacancy, setVacancy] = useState(1);
  const [fixedCosts, setFixedCosts] = useState(24_000);
  const [management, setManagement] = useState(0);
  const [reserve, setReserve] = useState(12_000);

  const result = useMemo(
    () =>
      computeFutureRent({
        monthlyRentExServicesCzk: rent,
        rentTiming: timing,
        otherNetMonthlyIncomeCzk: otherIncome,
        recognitionSharePercent: share,
        loanAmountCzk: loan,
        annualRatePercent: rate,
        termYears,
        vacancyMonthsPerYear: vacancy,
        fixedAnnualOwnerCostsCzk: fixedCosts,
        managementPercentOfCollected: management,
        annualRepairReserveCzk: reserve,
      }),
    [
      rent,
      timing,
      otherIncome,
      share,
      loan,
      rate,
      termYears,
      vacancy,
      fixedCosts,
      management,
      reserve,
    ]
  );

  useEffect(() => {
    onSummary?.({
      modelVersion: FUTURE_RENT_MODEL_VERSION,
      timing,
      recognizedMonthlyRentCzk: result.recognizedMonthlyRentCzk,
      totalModelMonthlyIncomeCzk: result.totalModelMonthlyIncomeCzk,
      monthlyPaymentCzk: result.monthlyPaymentCzk,
      averageMonthlyCashAfterDebtAndReserveCzk:
        result.averageMonthlyCashAfterDebtAndReserveCzk,
      recognitionSharePercent: share,
    });
  }, [onSummary, result, share, timing]);

  const maxIncome = Math.max(
    ...result.sensitivityByShare.map((s) => s.totalModelMonthlyIncomeCzk),
    1
  );

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h3 className="font-heading text-xl font-semibold text-text-dark">
        Kalkulačka budoucího / existujícího nájmu
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Oddělujeme modelový příspěvek nájmu k příjmům a reálný tok po nákladech.
        Podíl uznání je{" "}
        <strong className="font-semibold text-text-dark">
          modelový předpoklad, nikoli metodika konkrétní banky
        </strong>
        .
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold">Typ nájmu</legend>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={timing === "future"}
                onChange={() => setTiming("future")}
              />
              Budoucí pronájem
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={timing === "existing"}
                onChange={() => setTiming("existing")}
              />
              Již existující nájem
            </label>
          </div>
        </fieldset>
        <label className="text-sm">
          Měsíční nájemné bez služeb
          <input
            className={field}
            type="number"
            min={0}
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Ostatní čisté měsíční příjmy
          <input
            className={field}
            type="number"
            min={0}
            value={otherIncome}
            onChange={(e) => setOtherIncome(Number(e.target.value))}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Modelový podíl uznání nájemného: {share} %
          <input
            className="mt-2 w-full"
            type="range"
            min={0}
            max={100}
            step={5}
            value={share}
            onChange={(e) => setShare(Number(e.target.value))}
          />
          <span className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {[0, 50, 70, 80].map((p) => (
              <button
                key={p}
                type="button"
                className="rounded-full border border-border px-2 py-1 hover:border-deep-teal"
                onClick={() => setShare(p)}
              >
                {p} %
              </button>
            ))}
          </span>
        </label>
        <label className="text-sm">
          Výše úvěru
          <input
            className={field}
            type="number"
            min={0}
            value={loan}
            onChange={(e) => setLoan(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Modelová sazba p.a.
          <input
            className={field}
            type="number"
            min={0}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Splatnost (roky)
          <input
            className={field}
            type="number"
            min={1}
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Neobsazenost (měsíce / rok)
          <input
            className={field}
            type="number"
            min={0}
            max={12}
            value={vacancy}
            onChange={(e) => setVacancy(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Fixní roční náklady vlastníka
          <input
            className={field}
            type="number"
            min={0}
            value={fixedCosts}
            onChange={(e) => setFixedCosts(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Správa (% z vybraného nájemného)
          <input
            className={field}
            type="number"
            min={0}
            max={100}
            value={management}
            onChange={(e) => setManagement(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Roční rezerva na opravy
          <input
            className={field}
            type="number"
            min={0}
            value={reserve}
            onChange={(e) => setReserve(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-[#f7f8f7] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
            A · Modelový příspěvek k příjmům
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Uznaný měsíční nájem</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(result.recognizedMonthlyRentCzk)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Součet modelových příjmů</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(result.totalModelMonthlyIncomeCzk)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Neodečítáme zde neobsazenost ani provozní náklady — to patří do
            pohledu B.
          </p>
        </div>
        <div className="rounded-2xl bg-[#f7f8f7] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
            B · Peníze z pronájmu po nákladech
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Splátka</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(result.monthlyPaymentCzk)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Průměrný měsíční tok</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(result.averageMonthlyCashAfterDebtAndReserveCzk, "CZK", {
                  fractionDigits: 2,
                })}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Roční rezerva</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(result.cashBreakdownAnnual.repairReserveCzk)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Před daní z příjmů, po splátkách a zadané rezervě na opravy.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-text-dark">
          Citlivost uznaného příjmu na podíl
        </h4>
        <ul className="mt-3 space-y-2">
          {result.sensitivityByShare.map((row) => (
            <li key={row.sharePercent} className="text-sm">
              <div className="mb-1 flex justify-between gap-2">
                <span>{row.sharePercent} %</span>
                <span className="tabular-nums">
                  {formatMoney(row.recognizedMonthlyRentCzk)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-light-gray">
                <div
                  className="h-full bg-deep-teal"
                  style={{
                    width: `${(row.totalModelMonthlyIncomeCzk / maxIncome) * 100}%`,
                  }}
                  role="img"
                  aria-label={`Modelové příjmy ${formatMoney(row.totalModelMonthlyIncomeCzk)}`}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 overflow-x-auto">
        <h4 className="text-sm font-semibold text-text-dark">
          Roční rozpad toku
        </h4>
        <table className="mt-2 w-full min-w-[320px] text-left text-sm">
          <tbody>
            {(
              [
                ["Vybrané nájemné", result.cashBreakdownAnnual.collectedRentCzk],
                ["Fixní náklady", -result.cashBreakdownAnnual.fixedCostsCzk],
                ["Správa", -result.cashBreakdownAnnual.managementCzk],
                ["Splátky", -result.cashBreakdownAnnual.debtServiceCzk],
                ["Rezerva", -result.cashBreakdownAnnual.repairReserveCzk],
                ["Zbývající tok", result.cashBreakdownAnnual.remainderCzk],
              ] as const
            ).map(([label, amount]) => (
              <tr key={label} className="border-t border-border">
                <td className="py-1.5 pr-3">{label}</td>
                <td className="py-1.5 tabular-nums">{formatMoney(amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Object.values(result.scenarios).map((scene) => (
          <article
            key={scene.label}
            className="rounded-xl border border-border p-3 text-sm"
          >
            <h5 className="font-semibold text-text-dark">{scene.label}</h5>
            <p className="mt-2 text-muted-foreground">
              Měsíční tok{" "}
              <span className="font-semibold tabular-nums text-text-dark">
                {formatMoney(scene.averageMonthlyCashAfterDebtAndReserveCzk, "CZK", {
                  fractionDigits: 2,
                })}
              </span>
            </p>
          </article>
        ))}
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        {result.assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
        <li>
          Kalkulačka neříká „banka vám půjčí X“ ani pravděpodobnost schválení.
        </li>
      </ul>
    </div>
  );
}
