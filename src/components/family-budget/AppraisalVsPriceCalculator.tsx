"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateAppraisalVsPrice } from "@/lib/family-budget/appraisal";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";

function parseCzk(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function AppraisalVsPriceCalculator() {
  const [purchase, setPurchase] = useState("5000000");
  const [appraisal, setAppraisal] = useState("4500000");
  const [cash, setCash] = useState("1000000");
  const [side, setSide] = useState("100000");
  const [ltvPct, setLtvPct] = useState("80");
  const [extra, setExtra] = useState("0");
  const [extraOk, setExtraOk] = useState(false);

  const result = useMemo(
    () =>
      calculateAppraisalVsPrice({
        purchasePriceCzk: parseCzk(purchase),
        bankRecognizedValueCzk: parseCzk(appraisal),
        ownCashCzk: parseCzk(cash),
        sideCostsCzk: parseCzk(side),
        modelLtvLimit: parseCzk(ltvPct) / 100,
        additionalCollateralValueCzk: parseCzk(extra),
        additionalCollateralUnencumberedAccepted: extraOk,
      }),
    [purchase, appraisal, cash, side, ltvPct, extra, extraOk]
  );

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h2 className="font-heading text-xl font-bold text-text-dark">
        Odhad versus kupní cena
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Model potřeby vlastních peněz při rozdílu odhadu a kupní ceny. LTV strop
        není schválená hypotéka.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Kupní cena (Kč)" value={purchase} onChange={setPurchase} />
        <Field
          label="Bankou uznatelná hodnota (Kč)"
          value={appraisal}
          onChange={setAppraisal}
        />
        <Field label="Vlastní hotovost (Kč)" value={cash} onChange={setCash} />
        <Field label="Vedlejší náklady (Kč)" value={side} onChange={setSide} />
        <Field
          label="Modelový limit LTV (%)"
          value={ltvPct}
          onChange={setLtvPct}
        />
        <Field
          label="Další zástava — hodnota (Kč)"
          value={extra}
          onChange={setExtra}
        />
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="mt-1"
          checked={extraOk}
          onChange={(e) => setExtraOk(e.target.checked)}
        />
        <span>
          Další zástava je nezatížená a bankou akceptovatelná (jinak se do modelu
          nezapočítá).
        </span>
      </label>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Potřeba financování" value={formatMoney(result.financingNeedCzk)} />
        <Metric label="Strop podle LTV" value={formatMoney(result.ltvCapCzk)} />
        <Metric
          label="Potřebné vlastní peníze"
          value={formatMoney(result.ownFundsNeededCzk)}
        />
        <Metric
          label="Chybějící kapitál"
          value={formatMoney(result.missingCapitalCzk)}
        />
        <Metric
          label="Dopad nižšího odhadu"
          value={formatMoney(result.gapFromLowerAppraisalCzk)}
        />
        <Metric
          label="Zajišťovací základ"
          value={formatMoney(result.effectiveCollateralBaseCzk)}
        />
      </dl>

      {result.warnings.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-amber-900">
          {result.warnings.map((w) => (
            <li key={w}>• {w}</li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
        {result.assumptions.map((a) => (
          <li key={a}>• {a}</li>
        ))}
      </ul>

      <p className="mt-4 text-sm">
        <Link
          href={`${routes.temata}/bankovni-odhad-versus-kupni-cena`}
          className="font-medium text-deep-teal hover:underline"
        >
          Průvodce: bankovní odhad versus kupní cena
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-text-dark">{label}</span>
      <input
        className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 tabular-nums outline-none focus:border-deep-teal focus:ring-2 focus:ring-deep-teal/20"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-[#f7f8f7] px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-heading text-lg font-semibold tabular-nums text-text-dark">
        {value}
      </dd>
    </div>
  );
}
