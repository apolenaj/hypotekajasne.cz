"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";
import {
  computeConstructionFinance,
  CONSTRUCTION_FINANCE_MODEL_VERSION,
  type ConstructionVariant,
} from "@/lib/scenarios/construction-finance";

const field =
  "mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm tabular-nums outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20";

const VARIANT_LABELS: Record<ConstructionVariant, string> = {
  buy_land_and_build: "Kupuji pozemek a budu stavět",
  own_land_and_build: "Pozemek už vlastním",
  developer_shell: "Kupuji rozestavěnou novostavbu od developera",
  finished_new_build: "Kupuji dokončenou novostavbu",
};

export function ConstructionFinanceCalculator({
  onSummary,
}: {
  onSummary?: (summary: Record<string, unknown>) => void;
} = {}) {
  const [variant, setVariant] =
    useState<ConstructionVariant>("own_land_and_build");
  const [landPurchase, setLandPurchase] = useState(0);
  const [design, setDesign] = useState(180_000);
  const [permits, setPermits] = useState(40_000);
  const [utilities, setUtilities] = useState(250_000);
  const [construction, setConstruction] = useState(4_200_000);
  const [finishing, setFinishing] = useState(800_000);
  const [furniture, setFurniture] = useState(300_000);
  const [other, setOther] = useState(100_000);
  const [ownedLand, setOwnedLand] = useState(2_000_000);
  const [cash, setCash] = useState(1_000_000);
  const [completedValue, setCompletedValue] = useState(8_500_000);
  const [ltvLimit, setLtvLimit] = useState(80);
  const [rate, setRate] = useState(5);
  const [drawdownMonths, setDrawdownMonths] = useState(18);
  const [amortYears, setAmortYears] = useState(25);
  const [reservePct, setReservePct] = useState(10);
  const [housing, setHousing] = useState(18_000);
  const [advanced, setAdvanced] = useState(false);

  const result = useMemo(
    () =>
      computeConstructionFinance({
        variant,
        budget: {
          landPurchaseCzk:
            variant === "own_land_and_build"
              ? 0
              : variant === "finished_new_build"
                ? construction
                : landPurchase,
          designAndSurveysCzk:
            variant === "finished_new_build" ? 0 : design,
          permitsCzk: variant === "finished_new_build" ? 0 : permits,
          utilitiesCzk: variant === "finished_new_build" ? 0 : utilities,
          constructionCzk:
            variant === "finished_new_build" ? 0 : construction,
          finishingAndExteriorCzk:
            variant === "finished_new_build" ? 0 : finishing,
          furnitureCzk: furniture,
          otherCzk: other,
        },
        ownedLandValueCzk:
          variant === "own_land_and_build" ? ownedLand : 0,
        availableCashCzk: cash,
        completedPropertyValueCzk: completedValue,
        modelLtvLimitPercent: ltvLimit,
        annualRatePercent: rate,
        drawdownMonths:
          variant === "finished_new_build" ? 1 : drawdownMonths,
        amortisationYears: amortYears,
        reservePercentOfBase: reservePct,
        concurrentHousingMonthlyCzk: housing,
      }),
    [
      variant,
      landPurchase,
      design,
      permits,
      utilities,
      construction,
      finishing,
      furniture,
      other,
      ownedLand,
      cash,
      completedValue,
      ltvLimit,
      rate,
      drawdownMonths,
      amortYears,
      reservePct,
      housing,
    ]
  );

  useEffect(() => {
    onSummary?.({
      modelVersion: CONSTRUCTION_FINANCE_MODEL_VERSION,
      variant,
      loanNeedCzk: result.loanNeedCzk,
      interestDuringDrawdownCzk: result.interestDuringDrawdownCzk,
      monthlyPaymentAfterDrawdownCzk: result.monthlyPaymentAfterDrawdownCzk,
      cashShortfallCzk: result.cashShortfallCzk,
      ownedLandValueCzk: result.ownedLandValueCzk,
    });
  }, [onSummary, result, variant]);

  const maxDrawn = Math.max(
    ...result.schedule.map((r) => r.cumulativeDrawnCzk),
    1
  );

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h3 className="font-heading text-xl font-semibold text-text-dark">
        Kalkulačka výstavby a novostavby
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Oddělujeme hodnotu majetku (např. vlastní pozemek) od hotovosti na
        faktury. Modelový LTV limit není schválená výše úvěru.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">Varianta</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(VARIANT_LABELS) as ConstructionVariant[]).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-start gap-2 rounded-xl border border-border px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name="build-variant"
                checked={variant === key}
                onChange={() => setVariant(key)}
                className="mt-1"
              />
              <span>{VARIANT_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {variant === "buy_land_and_build" ||
        variant === "developer_shell" ||
        variant === "finished_new_build" ? (
          <label className="text-sm">
            {variant === "finished_new_build"
              ? "Kupní cena novostavby"
              : variant === "developer_shell"
                ? "Cena / splátky developerovi"
                : "Nákup pozemku"}
            <input
              className={field}
              type="number"
              min={0}
              value={
                variant === "finished_new_build" ? construction : landPurchase
              }
              onChange={(e) => {
                const v = Number(e.target.value);
                if (variant === "finished_new_build") setConstruction(v);
                else setLandPurchase(v);
              }}
            />
          </label>
        ) : null}
        {variant === "own_land_and_build" ? (
          <label className="text-sm">
            Hodnota vlastněného pozemku
            <input
              className={field}
              type="number"
              min={0}
              value={ownedLand}
              onChange={(e) => setOwnedLand(Number(e.target.value))}
            />
          </label>
        ) : null}
        {variant !== "finished_new_build" ? (
          <>
            <label className="text-sm">
              Projekt a průzkumy
              <input
                className={field}
                type="number"
                min={0}
                value={design}
                onChange={(e) => setDesign(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              Povolení a služby
              <input
                className={field}
                type="number"
                min={0}
                value={permits}
                onChange={(e) => setPermits(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              Přípojky
              <input
                className={field}
                type="number"
                min={0}
                value={utilities}
                onChange={(e) => setUtilities(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              Stavba a technologie
              <input
                className={field}
                type="number"
                min={0}
                value={construction}
                onChange={(e) => setConstruction(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              Dokončení a venkovní úpravy
              <input
                className={field}
                type="number"
                min={0}
                value={finishing}
                onChange={(e) => setFinishing(Number(e.target.value))}
              />
            </label>
          </>
        ) : null}
        <label className="text-sm">
          Vybavení domácnosti
          <input
            className={field}
            type="number"
            min={0}
            value={furniture}
            onChange={(e) => setFurniture(Number(e.target.value))}
          />
        </label>
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          Vybavení nemusí být celé financovatelné účelovou hypotékou.
        </p>
        <label className="text-sm">
          Ostatní výdaje
          <input
            className={field}
            type="number"
            min={0}
            value={other}
            onChange={(e) => setOther(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Hotovost k dispozici
          <input
            className={field}
            type="number"
            min={0}
            value={cash}
            onChange={(e) => setCash(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Předpokládaná hodnota dokončené nemovitosti
          <input
            className={field}
            type="number"
            min={0}
            value={completedValue}
            onChange={(e) => setCompletedValue(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Modelový limit LTV (%)
          <input
            className={field}
            type="number"
            min={1}
            max={100}
            value={ltvLimit}
            onChange={(e) => setLtvLimit(Number(e.target.value))}
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
        {variant !== "finished_new_build" ? (
          <label className="text-sm">
            Doba čerpání (měsíce)
            <input
              className={field}
              type="number"
              min={1}
              value={drawdownMonths}
              onChange={(e) => setDrawdownMonths(Number(e.target.value))}
            />
          </label>
        ) : null}
        <label className="text-sm">
          Anuitní splácení (roky)
          <input
            className={field}
            type="number"
            min={1}
            value={amortYears}
            onChange={(e) => setAmortYears(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Rezerva (% z nových výdajů)
          <input
            className={field}
            type="number"
            min={0}
            value={reservePct}
            onChange={(e) => setReservePct(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Souběžné bydlení / měsíc
          <input
            className={field}
            type="number"
            min={0}
            value={housing}
            onChange={(e) => setHousing(Number(e.target.value))}
          />
        </label>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={advanced}
          onChange={(e) => setAdvanced(e.target.checked)}
        />
        Zobrazit pokročilý harmonogram čerpání
      </label>

      <div className="mt-6 rounded-2xl bg-[#f7f8f7] p-4">
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Nové projektové výdaje</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.newProjectExpensesBeforeReserveCzk)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Rezerva</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.reserveCzk)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Potřeba úvěru</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.loanNeedCzk)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              Modelový limit podle LTV
            </dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.modelMaxLoanByLtvCzk)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Chybějící hotovost / mezera</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.cashShortfallCzk)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Úroky během čerpání</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.interestDuringDrawdownCzk)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Splátka po dočerpání</dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.monthlyPaymentAfterDrawdownCzk)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              Souběžné bydlení za dobu čerpání
            </dt>
            <dd className="font-semibold tabular-nums">
              {formatMoney(result.concurrentHousingDuringDrawdownCzk)}
            </dd>
          </div>
        </dl>
        {result.firstShortfallMonth != null ? (
          <p className="mt-3 text-sm text-deep-teal">
            První měsíc nedostatku peněz v modelu: měsíc{" "}
            {result.firstShortfallMonth}.
          </p>
        ) : null}
      </div>

      {advanced && result.schedule.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <p className="text-xs text-muted-foreground">
            Ilustrativní harmonogram — lze později nahradit vlastními tranšemi.
            Tranše na začátku měsíce; úrok z kumulativně vyčerpané jistiny.
          </p>
          <table className="mt-2 w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="py-1 pr-2">Měsíc</th>
                <th className="py-1 pr-2">Tranše</th>
                <th className="py-1 pr-2">Vyčerpáno</th>
                <th className="py-1 pr-2">Úrok</th>
                <th className="py-1">Hotovost</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row) => (
                <tr key={row.month} className="border-t border-border">
                  <td className="py-1.5 pr-2 tabular-nums">{row.month}</td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {formatMoney(row.trancheCzk)}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {formatMoney(row.cumulativeDrawnCzk)}
                  </td>
                  <td className="py-1.5 pr-2 tabular-nums">
                    {formatMoney(row.interestCzk)}
                  </td>
                  <td className="py-1.5 tabular-nums">
                    {formatMoney(row.cashRemainingCzk)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">Kumulativní čerpání jistiny</p>
            {result.schedule.map((row) => (
              <div key={`bar-${row.month}`} className="flex items-center gap-2 text-xs">
                <span className="w-8 tabular-nums">{row.month}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-light-gray">
                  <div
                    className="h-full bg-deep-teal"
                    style={{
                      width: `${(row.cumulativeDrawnCzk / maxDrawn) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Object.values(result.scenarios).map((scene) => (
          <article
            key={scene.label}
            className="rounded-xl border border-border p-3 text-sm"
          >
            <h5 className="font-semibold">{scene.label}</h5>
            <p className="mt-2 text-muted-foreground">
              Úvěr {formatMoney(scene.loanNeedCzk)}
            </p>
            <p className="text-muted-foreground">
              Úroky čerpání {formatMoney(scene.interestDuringDrawdownCzk)}
            </p>
            <p className="text-muted-foreground">
              Mezera {formatMoney(scene.cashShortfallCzk)}
            </p>
          </article>
        ))}
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        {result.assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  );
}
