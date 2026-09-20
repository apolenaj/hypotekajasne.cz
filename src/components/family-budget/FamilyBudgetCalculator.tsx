"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import {
  applyScenarioPreset,
  simulateFamilyBudget,
  type ScenarioPresetId,
} from "@/lib/family-budget";
import type { FamilyBudgetInput } from "@/lib/family-budget/types";
import { formatMoney } from "@/lib/money";
import { routes } from "@/lib/routes";
import { LEAD_FORM_FRICTION_SHORT } from "@/lib/leads-form-copy";
import { cn } from "@/lib/utils";

const OFFICIAL_LINKS = [
  {
    label: "ČSSZ — peněžitá pomoc v mateřství",
    href: "https://www.cssz.gov.cz/penezita-pomoc-v-materstvi",
  },
  {
    label: "MPSV / ÚP — rodičovský příspěvek",
    href: "https://mpsv.gov.cz/up-cz/rodicovsky-prispevek",
  },
] as const;

function num(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function readMortgageFromUrl(): Partial<{
  payment: number;
  principal: number;
  rate: number;
  termYears: number;
}> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const payment = num(sp.get("splatka") ?? sp.get("payment") ?? "");
  const principal = num(sp.get("jistina") ?? sp.get("principal") ?? "");
  const rate = num(sp.get("sazba") ?? sp.get("rate") ?? "");
  const termYears = num(sp.get("splatnost") ?? sp.get("term") ?? "");
  return {
    payment: payment > 0 ? payment : undefined,
    principal: principal > 0 ? principal : undefined,
    rate: rate > 0 ? rate : undefined,
    termYears: termYears > 0 ? termYears : undefined,
  };
}

const PRESETS: Array<{ id: ScenarioPresetId; label: string }> = [
  { id: "current", label: "Současný plán" },
  { id: "parenthood", label: "Rodičovství" },
  { id: "income_gap_3", label: "Výpadek 3 měsíce" },
  { id: "income_gap_6", label: "Výpadek 6 měsíců" },
  { id: "refix_plus_2", label: "Refixace +2 p. b." },
  { id: "expenses_plus_10", label: "Výdaje +10 %" },
  { id: "combo", label: "Kombinace (vaše volby)" },
];

export function FamilyBudgetCalculator() {
  const [step, setStep] = useState(1);
  const [advanced, setAdvanced] = useState(false);
  const [preset, setPreset] = useState<ScenarioPresetId>("combo");
  const [horizon, setHorizon] = useState<60 | 120>(60);

  const [adultCount, setAdultCount] = useState(2);
  const [income1, setIncome1] = useState("45000");
  const [income2, setIncome2] = useState("35000");
  const [irregular1, setIrregular1] = useState("0");
  const [irregular2, setIrregular2] = useState("0");
  const [otherIncome, setOtherIncome] = useState("0");
  const [rental, setRental] = useState("0");
  const [rentalNet, setRentalNet] = useState(true);

  const [lifeQuick, setLifeQuick] = useState("35000");
  const [food, setFood] = useState("12000");
  const [utilities, setUtilities] = useState("6000");
  const [transport, setTransport] = useState("4000");
  const [childrenExp, setChildrenExp] = useState("0");
  const [insurance, setInsurance] = useState("2000");
  const [otherLoans, setOtherLoans] = useState("0");
  const [maintenance, setMaintenance] = useState("1500");
  const [leisure, setLeisure] = useState("3000");
  const [pets, setPets] = useState("0");
  const [otherExp, setOtherExp] = useState("2000");
  const [optional, setOptional] = useState("2000");
  const [saving, setSaving] = useState("0");
  const [rent, setRent] = useState("0");
  const [rentEnds, setRentEnds] = useState("");
  const [ownOps, setOwnOps] = useState("4000");

  const [principal, setPrincipal] = useState("4000000");
  const [rate, setRate] = useState("5");
  const [term, setTerm] = useState("30");
  const [payment, setPayment] = useState("25000");
  const [reserve, setReserve] = useState("300000");

  useEffect(() => {
    const fromUrl = readMortgageFromUrl();
    if (fromUrl.payment) setPayment(String(Math.round(fromUrl.payment)));
    if (fromUrl.principal) setPrincipal(String(Math.round(fromUrl.principal)));
    if (fromUrl.rate) setRate(String(fromUrl.rate));
    if (fromUrl.termYears) setTerm(String(fromUrl.termYears));
  }, []);
  const [minReserveMode, setMinReserveMode] = useState<"czk" | "months_essential">(
    "czk"
  );
  const [minReserveCzk, setMinReserveCzk] = useState("150000");
  const [minReserveMonths, setMinReserveMonths] = useState("3");

  const [parenthoodOn, setParenthoodOn] = useState(false);
  const [whoReduces, setWhoReduces] = useState<"a1" | "a2">("a2");
  const [parentStartIn, setParentStartIn] = useState("12");
  const [maternityAmt, setMaternityAmt] = useState("12000");
  const [maternityMonths, setMaternityMonths] = useState("6");
  const [rpBalance, setRpBalance] = useState("350000");
  const [rpDraw, setRpDraw] = useState("12000");
  const [gapBeforeReturn, setGapBeforeReturn] = useState("0");
  const [returnIncome, setReturnIncome] = useState("25000");
  const [returnPartial, setReturnPartial] = useState(true);
  const [childOneTime, setChildOneTime] = useState("30000");
  const [childMonthly, setChildMonthly] = useState("3000");
  const [childcare, setChildcare] = useState("8000");

  const [gapOn, setGapOn] = useState(false);
  const [gapAdult, setGapAdult] = useState<"a1" | "a2">("a1");
  const [gapMonths, setGapMonths] = useState<3 | 6>(3);
  const [gapReplace, setGapReplace] = useState("0");
  const [gapStartIn, setGapStartIn] = useState("6");

  const [refixOn, setRefixOn] = useState(false);
  const [refixMonth, setRefixMonth] = useState("36");
  const [refixBump, setRefixBump] = useState("2");
  const [expPlus10, setExpPlus10] = useState(false);

  const [leadSummaryOpen, setLeadSummaryOpen] = useState(false);
  const [leadNotes, setLeadNotes] = useState("");

  const baseInput: FamilyBudgetInput = useMemo(() => {
    const adults =
      adultCount === 1
        ? [
            {
              id: "a1",
              label: "Dospělý 1",
              regularNetMonthlyCzk: num(income1),
              irregularIncludedMonthlyCzk: num(irregular1),
              phases: [],
            },
          ]
        : [
            {
              id: "a1",
              label: "Dospělý 1",
              regularNetMonthlyCzk: num(income1),
              irregularIncludedMonthlyCzk: num(irregular1),
              phases: [],
            },
            {
              id: "a2",
              label: "Dospělý 2",
              regularNetMonthlyCzk: num(income2),
              irregularIncludedMonthlyCzk: num(irregular2),
              phases: [],
            },
          ];

    const expenses = advanced
      ? [
          { id: "food", category: "food" as const, kind: "essential" as const, label: "Potraviny a drogerie", amountCzk: num(food), cadence: "monthly" as const },
          { id: "util", category: "utilities" as const, kind: "essential" as const, label: "Energie a služby", amountCzk: num(utilities), cadence: "monthly" as const },
          { id: "trans", category: "transport" as const, kind: "essential" as const, label: "Doprava", amountCzk: num(transport), cadence: "monthly" as const },
          { id: "kids", category: "children" as const, kind: "essential" as const, label: "Děti, školka, škola", amountCzk: num(childrenExp), cadence: "monthly" as const },
          { id: "ins", category: "insurance_health" as const, kind: "essential" as const, label: "Pojištění a zdraví", amountCzk: num(insurance), cadence: "monthly" as const },
          { id: "loans", category: "other_loans" as const, kind: "essential" as const, label: "Další úvěry", amountCzk: num(otherLoans), cadence: "monthly" as const },
          { id: "maint", category: "property_maintenance" as const, kind: "essential" as const, label: "Údržba nemovitosti", amountCzk: num(maintenance), cadence: "monthly" as const },
          { id: "lei", category: "leisure" as const, kind: "optional" as const, label: "Volný čas", amountCzk: num(leisure), cadence: "monthly" as const },
          { id: "pets", category: "pets" as const, kind: "optional" as const, label: "Domácí zvířata", amountCzk: num(pets), cadence: "monthly" as const },
          { id: "oth", category: "other" as const, kind: "essential" as const, label: "Ostatní", amountCzk: num(otherExp), cadence: "monthly" as const },
          { id: "opt", category: "other" as const, kind: "optional" as const, label: "Volitelné navíc", amountCzk: num(optional), cadence: "monthly" as const },
          { id: "sav", category: "other" as const, kind: "planned_saving" as const, label: "Plánované spoření", amountCzk: num(saving), cadence: "monthly" as const },
          { id: "rent", category: "rent" as const, kind: "essential" as const, label: "Nájem", amountCzk: num(rent), cadence: "monthly" as const },
          { id: "ops", category: "own_housing_ops" as const, kind: "essential" as const, label: "Provoz vlastního bydlení", amountCzk: num(ownOps), cadence: "monthly" as const, startMonth: num(rentEnds) > 0 ? num(rentEnds) + 1 : 1 },
        ]
      : [
          { id: "life", category: "other" as const, kind: "essential" as const, label: "Životní výdaje", amountCzk: num(lifeQuick), cadence: "monthly" as const },
          { id: "rent", category: "rent" as const, kind: "essential" as const, label: "Nájem", amountCzk: num(rent), cadence: "monthly" as const },
          { id: "ops", category: "own_housing_ops" as const, kind: "essential" as const, label: "Provoz vlastního bydlení", amountCzk: num(ownOps), cadence: "monthly" as const, startMonth: num(rentEnds) > 0 ? num(rentEnds) + 1 : 1 },
          { id: "sav", category: "other" as const, kind: "planned_saving" as const, label: "Plánované spoření", amountCzk: num(saving), cadence: "monthly" as const },
        ];

    return {
      horizonMonths: horizon,
      initialLiquidReserveCzk: num(reserve),
      adults,
      otherMonthlyIncomeCzk: num(otherIncome),
      rentalCashflowMonthlyCzk: num(rental),
      rentalAlreadyNetOfCostsAndLoans: rentalNet,
      expenses,
      mortgage: {
        principalCzk: num(principal),
        annualRatePercent: num(rate),
        termYears: Math.max(1, num(term)),
        monthlyPaymentCzk: num(payment),
      },
      rentEndsMonth: num(rentEnds) > 0 ? num(rentEnds) : null,
      parenthood: {
        enabled: parenthoodOn,
        adultId: whoReduces,
        startMonth: Math.max(1, num(parentStartIn)),
        maternityMonthlyCzk: num(maternityAmt),
        maternityMonths: Math.max(0, num(maternityMonths)),
        parentalAllowanceBalanceCzk: num(rpBalance),
        parentalAllowanceMonthlyDrawCzk: num(rpDraw),
        gapMonthsBeforeReturn: Math.max(0, num(gapBeforeReturn)),
        returnMonthlyCzk: num(returnIncome),
        returnIsPartial: returnPartial,
        oneTimeChildCostsCzk: num(childOneTime),
        extraMonthlyChildCostsCzk: num(childMonthly),
        childcareAfterReturnMonthlyCzk: num(childcare),
      },
      incomeGap: {
        enabled: gapOn,
        adultId: gapAdult,
        startMonth: Math.max(1, num(gapStartIn)),
        durationMonths: gapMonths,
        replacementMonthlyCzk: num(gapReplace),
      },
      refixation: {
        enabled: refixOn,
        month: Math.max(1, num(refixMonth)),
        rateIncreasePp: num(refixBump),
      },
      livingExpenseMultiplier: expPlus10 ? 1.1 : 1,
      minReserveMode,
      minReserveCzk: num(minReserveCzk),
      minReserveMonths: num(minReserveMonths),
      applyParenthood: parenthoodOn,
    };
  }, [
    adultCount, income1, income2, irregular1, irregular2, otherIncome, rental, rentalNet,
    advanced, lifeQuick, food, utilities, transport, childrenExp, insurance, otherLoans,
    maintenance, leisure, pets, otherExp, optional, saving, rent, rentEnds, ownOps,
    principal, rate, term, payment, reserve, horizon, parenthoodOn, whoReduces,
    parentStartIn, maternityAmt, maternityMonths, rpBalance, rpDraw, gapBeforeReturn,
    returnIncome, returnPartial, childOneTime, childMonthly, childcare, gapOn, gapAdult,
    gapMonths, gapReplace, gapStartIn, refixOn, refixMonth, refixBump, expPlus10,
    minReserveMode, minReserveCzk, minReserveMonths,
  ]);

  const scenarioInput = useMemo(
    () => applyScenarioPreset(baseInput, preset),
    [baseInput, preset]
  );

  const result = useMemo(
    () => simulateFamilyBudget(scenarioInput),
    [scenarioInput]
  );

  const comparison = useMemo(() => {
    return PRESETS.filter((p) => p.id !== "combo").map((p) => {
      const r = simulateFamilyBudget(applyScenarioPreset(baseInput, p.id));
      return {
        id: p.id,
        label: p.label,
        typical: r.typicalMonthlySurplusCzk,
        lowest: r.lowestReserveCzk,
        deficits: r.deficitMonthCount,
        extraCapital: r.additionalCapitalForMinReserveCzk,
        verdict: r.verdictText,
      };
    });
  }, [baseInput]);

  const chartData = result.months.map((m) => ({
    month: m.month,
    prijmy: m.incomeTotalCzk,
    vydaje: m.expenseTotalCzk,
    rezerva: m.reserveEndCzk,
    minRezerva: result.minReserveTargetCzk,
  }));

  const safeLeadMeta = {
    page_intent: "family_budget",
    calculatorType: "family_budget",
    sourcePage: routes.kalkulacky.rodinnyRozpocet,
    horizon_months: horizon,
    scenario_preset: preset,
    verdict: result.verdict,
    // No incomes/expenses in analytics — only coarse outcome flags.
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kroky">
          {[
            "Domácnost a příjmy",
            "Výdaje a hypotéka",
            "Budoucí změny",
            "Výsledek a rezerva",
          ].map((label, i) => {
            const n = i + 1;
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={step === n}
                onClick={() => setStep(n)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm",
                  step === n
                    ? "border-deep-teal bg-deep-teal text-white"
                    : "border-border bg-white text-muted-foreground hover:border-deep-teal/40"
                )}
              >
                {n}. {label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-deep-teal hover:underline"
          aria-expanded={advanced}
          onClick={() => setAdvanced((v) => !v)}
        >
          {advanced ? "Rychlý výpočet" : "Rozšířený režim"}
        </button>
      </div>

      {step === 1 ? (
        <section className="rounded-2xl border border-border p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold">Domácnost a příjmy</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Počet přispívajících dospělých
              <select
                className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3"
                value={adultCount}
                onChange={(e) => setAdultCount(Number(e.target.value) as 1 | 2)}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
            <Field label="Čistý příjem dospělý 1 (Kč/měs)" value={income1} onChange={setIncome1} />
            {adultCount > 1 ? (
              <Field label="Čistý příjem dospělý 2 (Kč/měs)" value={income2} onChange={setIncome2} />
            ) : null}
            {advanced ? (
              <>
                <Field label="Nepravidelný příjem 1 zahrnutý do modelu" value={irregular1} onChange={setIrregular1} />
                {adultCount > 1 ? (
                  <Field label="Nepravidelný příjem 2 zahrnutý do modelu" value={irregular2} onChange={setIrregular2} />
                ) : null}
                <Field label="Výživné a další pravidelné (Kč)" value={otherIncome} onChange={setOtherIncome} />
                <Field label="Nájemní tok po nákladech (Kč)" value={rental} onChange={setRental} />
                <label className="flex items-start gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" className="mt-1" checked={rentalNet} onChange={(e) => setRentalNet(e.target.checked)} />
                  Nájemní tok už má odečtené úvěry a náklady (neodečítat znovu).
                </label>
              </>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Bonusy a nepravidelné příjmy nezapočítáváme automaticky jako jistý pravidelný příjem — uveďte jen částku, kterou chcete do modelu zahrnout. Daňové zvýhodnění už v čisté mzdě nepřičítejte podruhé.
          </p>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="rounded-2xl border border-border p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold">Výdaje a hypotéka</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {!advanced ? (
              <Field label="Souhrnné životní výdaje (Kč/měs)" value={lifeQuick} onChange={setLifeQuick} />
            ) : (
              <>
                <Field label="Potraviny a drogerie" value={food} onChange={setFood} />
                <Field label="Energie, voda, služby, internet" value={utilities} onChange={setUtilities} />
                <Field label="Doprava a automobil" value={transport} onChange={setTransport} />
                <Field label="Děti, školka, škola" value={childrenExp} onChange={setChildrenExp} />
                <Field label="Pojištění a zdraví" value={insurance} onChange={setInsurance} />
                <Field label="Další úvěry a závazky" value={otherLoans} onChange={setOtherLoans} />
                <Field label="Údržba nemovitosti" value={maintenance} onChange={setMaintenance} />
                <Field label="Oblečení, volný čas, dovolené" value={leisure} onChange={setLeisure} />
                <Field label="Domácí zvířata" value={pets} onChange={setPets} />
                <Field label="Ostatní výdaje" value={otherExp} onChange={setOtherExp} />
                <Field label="Volitelné výdaje navíc" value={optional} onChange={setOptional} />
              </>
            )}
            <Field label="Plánované spoření / investice (snižuje likviditu)" value={saving} onChange={setSaving} />
            <Field label="Stávající nájem (Kč)" value={rent} onChange={setRent} />
            <Field label="Nájem skončí v měsíci č. (prázdné = nekončí)" value={rentEnds} onChange={setRentEnds} />
            <Field label="Provoz vlastního bydlení po nastěhování" value={ownOps} onChange={setOwnOps} />
            <Field label="Jistina hypotéky (Kč)" value={principal} onChange={setPrincipal} />
            <Field label="Sazba (% p. a.)" value={rate} onChange={setRate} />
            <Field label="Splatnost (roky)" value={term} onChange={setTerm} />
            <Field label="Měsíční splátka (Kč)" value={payment} onChange={setPayment} />
            <Field label="Počáteční likvidní rezerva po koupi (Kč)" value={reserve} onChange={setReserve} />
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="rounded-2xl border border-border p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold">Budoucí změny</h2>
          <div className="mt-4 space-y-4">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={parenthoodOn} onChange={(e) => setParenthoodOn(e.target.checked)} />
              Modelovat rodičovství / omezení práce
            </label>
            {parenthoodOn ? (
              <div className="grid gap-4 rounded-xl bg-[#f7f8f7] p-4 sm:grid-cols-2">
                <label className="text-sm">
                  Který člen domácnosti omezí práci?
                  <select className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3" value={whoReduces} onChange={(e) => setWhoReduces(e.target.value as "a1" | "a2")}>
                    <option value="a1">Dospělý 1</option>
                    {adultCount > 1 ? <option value="a2">Dospělý 2</option> : null}
                  </select>
                </label>
                <Field label="Začátek změny za X měsíců (měsíc č.)" value={parentStartIn} onChange={setParentStartIn} />
                <Field label="Příjem v období mateřství (Kč, předpoklad)" value={maternityAmt} onChange={setMaternityAmt} />
                <Field label="Počet měsíců tohoto období" value={maternityMonths} onChange={setMaternityMonths} />
                <Field label="Zůstatek rodičovského příspěvku (Kč)" value={rpBalance} onChange={setRpBalance} />
                <Field label="Měsíční čerpání příspěvku (Kč)" value={rpDraw} onChange={setRpDraw} />
                <Field label="Měsíce bez dávky před návratem" value={gapBeforeReturn} onChange={setGapBeforeReturn} />
                <Field label="Čistý příjem po návratu" value={returnIncome} onChange={setReturnIncome} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={returnPartial} onChange={(e) => setReturnPartial(e.target.checked)} />
                  Návrat na částečný úvazek
                </label>
                <Field label="Jednorázové výdaje na dítě" value={childOneTime} onChange={setChildOneTime} />
                <Field label="Další pravidelné výdaje na dítě" value={childMonthly} onChange={setChildMonthly} />
                <Field label="Péče o dítě po návratu do práce" value={childcare} onChange={setChildcare} />
                <p className="sm:col-span-2 text-xs text-muted-foreground">
                  Částky PPM a rodičovského příspěvku jsou uživatelský předpoklad, nikoli potvrzení nároku. Příspěvek v modelu končí po vyčerpání zůstatku. Oficiální informace:{" "}
                  {OFFICIAL_LINKS.map((l, i) => (
                    <span key={l.href}>
                      {i > 0 ? " · " : null}
                      <a href={l.href} className="text-deep-teal hover:underline" target="_blank" rel="noopener noreferrer">{l.label}</a>
                    </span>
                  ))}
                  . PPM nepočítáme procentem z čisté mzdy.
                </p>
              </div>
            ) : null}

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={gapOn} onChange={(e) => setGapOn(e.target.checked)} />
              Výpadek příjmu vybraného dospělého
            </label>
            {gapOn ? (
              <div className="grid gap-4 rounded-xl bg-[#f7f8f7] p-4 sm:grid-cols-2">
                <label className="text-sm">
                  Kdo má výpadek
                  <select className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3" value={gapAdult} onChange={(e) => setGapAdult(e.target.value as "a1" | "a2")}>
                    <option value="a1">Dospělý 1</option>
                    {adultCount > 1 ? <option value="a2">Dospělý 2</option> : null}
                  </select>
                </label>
                <label className="text-sm">
                  Délka
                  <select className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3" value={gapMonths} onChange={(e) => setGapMonths(Number(e.target.value) as 3 | 6)}>
                    <option value={3}>3 měsíce</option>
                    <option value={6}>6 měsíců</option>
                  </select>
                </label>
                <Field label="Začátek v měsíci č." value={gapStartIn} onChange={setGapStartIn} />
                <Field label="Náhradní příjem (Kč) — bez auto dávek" value={gapReplace} onChange={setGapReplace} />
              </div>
            ) : null}

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={refixOn} onChange={(e) => setRefixOn(e.target.checked)} />
              Refixace se zvýšením sazby
            </label>
            {refixOn ? (
              <div className="grid gap-4 rounded-xl bg-[#f7f8f7] p-4 sm:grid-cols-2">
                <Field label="Měsíc refixace" value={refixMonth} onChange={setRefixMonth} />
                <Field label="Zvýšení sazby (p. b.)" value={refixBump} onChange={setRefixBump} />
              </div>
            ) : null}

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={expPlus10} onChange={(e) => setExpPlus10(e.target.checked)} />
              Životní výdaje vyšší o 10 %
            </label>

            <label className="text-sm">
              Horizont modelu
              <select className="mt-1 h-11 w-full max-w-xs rounded-xl border border-gray-200 px-3" value={horizon} onChange={(e) => setHorizon(Number(e.target.value) as 60 | 120)}>
                <option value={60}>60 měsíců</option>
                <option value={120}>120 měsíců</option>
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm",
                  preset === p.id
                    ? "border-deep-teal bg-deep-teal text-white"
                    : "border-border bg-white hover:border-deep-teal/40"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-deep-teal/25 bg-[#f3f8f6] p-5 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">Verdikt podle zadaného scénáře</p>
            <p className="mt-2 font-heading text-2xl font-bold text-deep-teal">{result.verdictText}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Typické měsíční saldo" value={formatMoney(result.typicalMonthlySurplusCzk)} />
              <Metric label="Po spoření" value={formatMoney(result.typicalMonthlyAfterSavingCzk)} />
              <Metric label="Nejnižší rezerva" value={formatMoney(result.lowestReserveCzk)} />
              <Metric label="Dodatečný kapitál pro min. rezervu" value={formatMoney(result.additionalCapitalForMinReserveCzk)} />
              <Metric label="Nejhorší měsíc" value={result.worstMonth != null ? `Měsíc ${result.worstMonth}` : "—"} />
              <Metric label="Deficitní měsíce" value={String(result.deficitMonthCount)} />
              <Metric label="První vyčerpání rezervy" value={result.firstReserveExhaustionMonth != null ? `Měsíc ${result.firstReserveExhaustionMonth}` : "Nenastalo"} />
              <Metric label="Cíl min. rezervy" value={formatMoney(result.minReserveTargetCzk)} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">{result.minReserveBasisLabel}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                Min. rezerva — režim
                <select className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3" value={minReserveMode} onChange={(e) => setMinReserveMode(e.target.value as "czk" | "months_essential")}>
                  <option value="czk">Částka v Kč</option>
                  <option value="months_essential">Počet měsíců nezbytných výdajů + splátka</option>
                </select>
              </label>
              {minReserveMode === "czk" ? (
                <Field label="Minimální rezerva (Kč)" value={minReserveCzk} onChange={setMinReserveCzk} />
              ) : (
                <Field label="Počet měsíců" value={minReserveMonths} onChange={setMinReserveMonths} />
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <h3 className="font-heading text-lg font-semibold">Příjmy a výdaje (Kč / měsíc)</h3>
              <p className="sr-only">
                Graf měsíčních příjmů a výdajů. Typické saldo {formatMoney(result.typicalMonthlySurplusCzk)}.
              </p>
              <div className="mt-3 h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Měsíc", position: "insideBottom", offset: -2 }} />
                    <YAxis tick={{ fontSize: 11 }} width={56} />
                    <Tooltip formatter={(v) => formatMoney(Number(v))} />
                    <Legend />
                    <Line type="monotone" dataKey="prijmy" name="Příjmy" stroke="#1b4d3e" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="vydaje" name="Výdaje" stroke="#b45309" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <h3 className="font-heading text-lg font-semibold">Likvidní rezerva (Kč)</h3>
              <p className="sr-only">
                Vývoj rezervy. Nejnižší stav {formatMoney(result.lowestReserveCzk)}.
              </p>
              <div className="mt-3 h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={56} />
                    <Tooltip formatter={(v) => formatMoney(Number(v))} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#991b1b" />
                    <ReferenceLine y={result.minReserveTargetCzk} stroke="#1b4d3e" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="rezerva" name="Rezerva" stroke="#1b4d3e" fill="#1b4d3e22" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-sm">
              <caption className="bg-[#f7f8f7] px-4 py-3 text-left font-heading text-lg font-semibold">
                Srovnání scénářů
              </caption>
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-2">Scénář</th>
                  <th className="px-4 py-2">Typické saldo</th>
                  <th className="px-4 py-2">Nejnižší rezerva</th>
                  <th className="px-4 py-2">Deficity</th>
                  <th className="px-4 py-2">Dodatečný kapitál</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-4 py-2 font-medium">{row.label}</td>
                    <td className="px-4 py-2 tabular-nums">{formatMoney(row.typical)}</td>
                    <td className="px-4 py-2 tabular-nums">{formatMoney(row.lowest)}</td>
                    <td className="px-4 py-2 tabular-nums">{row.deficits}</td>
                    <td className="px-4 py-2 tabular-nums">{formatMoney(row.extraCapital)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="rounded-2xl border border-border p-4">
            <summary className="cursor-pointer font-heading text-lg font-semibold">Měsíční přehled</summary>
            <div className="mt-3 max-h-80 overflow-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="px-2 py-1">Měsíc</th>
                    <th className="px-2 py-1">Příjmy</th>
                    <th className="px-2 py-1">Výdaje</th>
                    <th className="px-2 py-1">Saldo</th>
                    <th className="px-2 py-1">Rezerva</th>
                    <th className="px-2 py-1">Značky</th>
                  </tr>
                </thead>
                <tbody>
                  {result.months.map((m) => (
                    <tr key={m.month} className="border-t border-border/50">
                      <td className="px-2 py-1">{m.month}</td>
                      <td className="px-2 py-1 tabular-nums">{formatMoney(m.incomeTotalCzk)}</td>
                      <td className="px-2 py-1 tabular-nums">{formatMoney(m.expenseTotalCzk)}</td>
                      <td className="px-2 py-1 tabular-nums">{formatMoney(m.operatingBalanceCzk)}</td>
                      <td className="px-2 py-1 tabular-nums">{formatMoney(m.reserveEndCzk)}</td>
                      <td className="px-2 py-1">{m.markers.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <details className="rounded-2xl border border-border p-4">
            <summary className="cursor-pointer font-heading text-lg font-semibold">Rozpad výdajů (1. měsíc)</summary>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>Nezbytné: {formatMoney(result.months[0]?.essentialExpenseCzk ?? 0)}</li>
              <li>Volitelné: {formatMoney(result.months[0]?.optionalExpenseCzk ?? 0)}</li>
              <li>Splátka: {formatMoney(result.months[0]?.mortgagePaymentCzk ?? 0)}</li>
              <li>Spoření: {formatMoney(result.months[0]?.plannedSavingCzk ?? 0)}</li>
              <li>Jednorázové: {formatMoney(result.months[0]?.oneTimeExpenseCzk ?? 0)}</li>
            </ul>
          </details>

          <ul className="space-y-1 text-xs text-muted-foreground">
            {result.assumptions.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>

          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-heading text-lg font-semibold">Probrat hypotéku podle našeho rozpočtu</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Výpočet funguje bez registrace. Citlivé příjmy a výdaje neukládáme do URL ani do analytiky.
              Před odesláním poptávky upravte souhrn předávaných údajů.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{LEAD_FORM_FRICTION_SHORT}</p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-deep-teal hover:underline"
              onClick={() => {
                setLeadNotes(
                  `Verdikt: ${result.verdictText}. Horizont ${horizon} měsíců. Scénář: ${preset}. Typické saldo ${result.typicalMonthlySurplusCzk} Kč. Nejnižší rezerva ${result.lowestReserveCzk} Kč. Splátka ${payment} Kč. (Příjmy a detailní výdaje záměrně neodesílány — doplňte dle potřeby.)`
                );
                setLeadSummaryOpen(true);
              }}
            >
              Upravit souhrn před odesláním
            </button>
            {leadSummaryOpen ? (
              <label className="mt-3 block text-sm">
                Souhrn předávaný s poptávkou
                <textarea
                  className="mt-1 min-h-24 w-full rounded-xl border border-gray-200 p-3 text-sm"
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                />
              </label>
            ) : null}
            <div className="mt-4">
              <LeadCaptureForm
                source="mortgage_calculator"
                title="Probrat hypotéku podle našeho rozpočtu"
                notes={leadNotes || `Rodinný rozpočet — verdikt: ${result.verdictText}`}
                metadata={safeLeadMeta}
              />
            </div>
          </div>

          <p className="text-sm">
            Související průvodce:{" "}
            <Link href={`${routes.temata}/hypoteka-a-rodina`} className="font-medium text-deep-teal hover:underline">
              Hypotéka a plánování rodiny
            </Link>
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {step > 1 ? (
          <button type="button" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold" onClick={() => setStep((s) => s - 1)}>
            Zpět
          </button>
        ) : null}
        {step < 4 ? (
          <button type="button" className="rounded-xl bg-deep-teal px-4 py-2 text-sm font-semibold text-white" onClick={() => setStep((s) => s + 1)}>
            Pokračovat
          </button>
        ) : null}
      </div>
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
    <div className="rounded-xl border border-border/60 bg-white/70 px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums text-text-dark">{value}</dd>
    </div>
  );
}
