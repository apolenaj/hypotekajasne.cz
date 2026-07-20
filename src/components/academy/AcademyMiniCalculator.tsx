"use client";

import { useMemo, useState } from "react";
import type { AcademyCalculatorKind } from "@/lib/academy/types";

function num(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function LtvCalc() {
  const [price, setPrice] = useState("5000000");
  const [loan, setLoan] = useState("4000000");
  const ltv = useMemo(() => {
    const p = num(price);
    const l = num(loan);
    if (p <= 0) return null;
    return Math.round((l / p) * 1000) / 10;
  }, [price, loan]);

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Odhadní / kupní hodnota (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Úvěr (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={loan}
          onChange={(e) => setLoan(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        LTV: {ltv != null ? `${ltv} %` : "—"}
      </p>
    </div>
  );
}

function DstiCalc() {
  const [income, setIncome] = useState("50000");
  const [payments, setPayments] = useState("20000");
  const dsti = useMemo(() => {
    const i = num(income);
    const p = num(payments);
    if (i <= 0) return null;
    return Math.round((p / i) * 1000) / 10;
  }, [income, payments]);

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Čistý příjem / měs. (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Splátky celkem / měs. (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={payments}
          onChange={(e) => setPayments(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        DSTI: {dsti != null ? `${dsti} %` : "—"}
      </p>
    </div>
  );
}

function DtiCalc() {
  const [annual, setAnnual] = useState("600000");
  const [debt, setDebt] = useState("3600000");
  const dti = useMemo(() => {
    const a = num(annual);
    const d = num(debt);
    if (a <= 0) return null;
    return Math.round((d / a) * 100) / 100;
  }, [annual, debt]);

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Roční čistý příjem (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={annual}
          onChange={(e) => setAnnual(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Celkové dluhy (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={debt}
          onChange={(e) => setDebt(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        DTI: {dti != null ? dti : "—"}
      </p>
    </div>
  );
}

function CashFlowCalc() {
  const [rent, setRent] = useState("20000");
  const [payment, setPayment] = useState("15000");
  const [costs, setCosts] = useState("2000");
  const cf = useMemo(
    () => num(rent) - num(payment) - num(costs),
    [rent, payment, costs]
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Nájem / měs. (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Splátka / měs. (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Provoz + rezerva / měs. (Kč)</span>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          value={costs}
          onChange={(e) => setCosts(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        CF: {cf.toLocaleString("cs-CZ")} Kč / měs.
      </p>
    </div>
  );
}

export function AcademyMiniCalculator({
  kind,
}: {
  kind: AcademyCalculatorKind;
}) {
  if (kind === "none") {
    return (
      <p className="text-sm text-muted-foreground">
        U této lekce není numerická mini kalkulačka — použijte related tools.
      </p>
    );
  }

  return (
    <div>
      {kind === "ltv" && <LtvCalc />}
      {kind === "dsti" && <DstiCalc />}
      {kind === "dti" && <DtiCalc />}
      {kind === "cash_flow" && <CashFlowCalc />}
      <p className="mt-3 text-xs text-muted-foreground">
        Orientační model — ne nabídka banky.
      </p>
    </div>
  );
}
