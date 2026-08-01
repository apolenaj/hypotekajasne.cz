"use client";

import { useMemo, useState } from "react";
import { FormattedMoneyInput } from "@/components/ui/FormattedMoneyInput";
import { formatNumber } from "@/lib/format";
import type { AcademyCalculatorKind } from "@/lib/academy/types";

function LtvCalc() {
  const [price, setPrice] = useState(5_000_000);
  const [loan, setLoan] = useState(4_000_000);
  const ltv = useMemo(() => {
    if (price <= 0) return null;
    return Math.round((loan / price) * 1000) / 10;
  }, [price, loan]);

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Odhadní / kupní hodnota (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={price}
          onChange={setPrice}
          suffix="Kč"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Úvěr (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={loan}
          onChange={setLoan}
          suffix="Kč"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        LTV: {ltv != null ? `${ltv} %` : "—"}
      </p>
    </div>
  );
}

function DstiCalc() {
  const [income, setIncome] = useState(50_000);
  const [payments, setPayments] = useState(20_000);
  const dsti = useMemo(() => {
    if (income <= 0) return null;
    return Math.round((payments / income) * 1000) / 10;
  }, [income, payments]);

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Čistý příjem / měs. (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={income}
          onChange={setIncome}
          suffix="Kč"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Splátky celkem / měs. (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={payments}
          onChange={setPayments}
          suffix="Kč"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        DSTI: {dsti != null ? `${dsti} %` : "—"}
      </p>
    </div>
  );
}

function DtiCalc() {
  const [annual, setAnnual] = useState(600_000);
  const [debt, setDebt] = useState(3_600_000);
  const dti = useMemo(() => {
    if (annual <= 0) return null;
    return Math.round((debt / annual) * 100) / 100;
  }, [annual, debt]);

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Roční čistý příjem (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={annual}
          onChange={setAnnual}
          suffix="Kč"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Celkové dluhy (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={debt}
          onChange={setDebt}
          suffix="Kč"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        DTI: {dti != null ? dti : "—"}
      </p>
    </div>
  );
}

function CashFlowCalc() {
  const [rent, setRent] = useState(20_000);
  const [payment, setPayment] = useState(15_000);
  const [costs, setCosts] = useState(2_000);
  const cf = useMemo(
    () => rent - payment - costs,
    [rent, payment, costs]
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium">Nájem / měs. (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={rent}
          onChange={setRent}
          suffix="Kč"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Splátka / měs. (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={payment}
          onChange={setPayment}
          suffix="Kč"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Provoz + rezerva / měs. (Kč)</span>
        <FormattedMoneyInput
          className="mt-1 rounded-lg border-border"
          value={costs}
          onChange={setCosts}
          suffix="Kč"
        />
      </label>
      <p className="text-lg font-bold tabular-nums text-deep-teal">
        CF: {formatNumber(cf, { emptyZero: false })} Kč / měs.
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
