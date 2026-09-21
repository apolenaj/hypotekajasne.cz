"use client";

import { useMemo, useState } from "react";
import {
  estimateGapModel,
  monthlyBudgetResidual,
  mortgageInterestDeductionModel,
  paymentSplitOverMonths,
  refinanceHorizonCompare,
  reserveRunwayMonths,
} from "@/lib/academy/practice/math";
import { calculateAnnuityPayment, roundMoney } from "@/lib/finance-math/core";
import { formatCurrency } from "@/lib/calculators";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  onChange,
  step = 1000,
  min = 0,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="block min-w-0 text-xs font-semibold text-text-dark">
      {label}
      <input
        type="number"
        className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-2.5 text-sm tabular-nums"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {suffix ? (
        <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </label>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "teal" | "gold" | "rose" | "slate";
}) {
  const width =
    max <= 0 ? 0 : Math.min(100, Math.max(0, (Math.abs(value) / max) * 100));
  const color =
    tone === "teal"
      ? "bg-deep-teal"
      : tone === "gold"
        ? "bg-muted-gold"
        : tone === "rose"
          ? "bg-rose-500"
          : "bg-slate-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-text-dark">
          {formatCurrency(value, "CZK")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-[width]", color)}
          style={{ width: `${width}%` }}
          role="presentation"
        />
      </div>
    </div>
  );
}

function Shell({
  title,
  assumptions,
  children,
  table,
}: {
  title: string;
  assumptions: string;
  children: React.ReactNode;
  table?: { headers: string[]; rows: string[][] };
}) {
  return (
    <div className="rounded-2xl border border-border bg-[#f7f8f7] p-4 sm:p-5">
      <h4 className="font-heading text-base font-bold text-text-dark">{title}</h4>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {assumptions}
      </p>
      <div className="mt-4 space-y-4">{children}</div>
      {table ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <caption className="sr-only">{title} — číselná tabulka</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                {table.headers.map((h) => (
                  <th key={h} className="px-2 py-1.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/60">
                  {row.map((cell, j) => (
                    <td key={j} className="px-2 py-1.5 tabular-nums text-text-dark">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function PurchaseFlowViz() {
  const steps = [
    { who: "Vy", title: "Rozpočet a příjmy", docs: "Výpisy, smlouvy, závazky" },
    { who: "Vy + banka", title: "Orientační posouzení", docs: "Modelová splátka" },
    { who: "Vy", title: "Rezervace nemovitosti", docs: "Podmínka financování" },
    { who: "Banka", title: "Odhad a schválení", docs: "Odhad, úvěrová smlouva" },
    { who: "Notář/advokát", title: "Úschova a smlouvy", docs: "Kupní, zástava" },
    { who: "Katastr", title: "Vklad a čerpání", docs: "Návrh na vklad" },
  ];
  return (
    <Shell
      title="Průběh koupě s hypotékou"
      assumptions="Kroky se mohou překrývat. Délka schválení není garantovaná — závisí na bance, podkladech a nemovitosti."
    >
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="rounded-xl border border-border bg-white p-3 text-sm"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
              {i + 1}. {s.who}
            </p>
            <p className="mt-1 font-semibold text-text-dark">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.docs}</p>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

function BudgetSplitViz() {
  const [income, setIncome] = useState(55_000);
  const [living, setLiving] = useState(25_000);
  const [other, setOther] = useState(3_000);
  const [loan, setLoan] = useState(4_000_000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(30);
  const [stressRate, setStressRate] = useState(7);
  const [incomeDrop, setIncomeDrop] = useState(0);

  const basePayment = useMemo(
    () => roundMoney(calculateAnnuityPayment(loan, rate, years)),
    [loan, rate, years]
  );
  const stressPayment = useMemo(
    () => roundMoney(calculateAnnuityPayment(loan, stressRate, years)),
    [loan, stressRate, years]
  );
  const base = monthlyBudgetResidual({
    netIncomeCzk: income * (1 - incomeDrop / 100),
    livingCostsCzk: living,
    otherDebtPaymentsCzk: other,
    mortgagePaymentCzk: basePayment,
  });
  const stress = monthlyBudgetResidual({
    netIncomeCzk: income * (1 - incomeDrop / 100),
    livingCostsCzk: living,
    otherDebtPaymentsCzk: other,
    mortgagePaymentCzk: stressPayment,
  });
  const maxBar = Math.max(income, living + other + basePayment, 1);

  return (
    <Shell
      title="Měsíční rozpočet a stress scénář"
      assumptions="Modelová splátka z anuity — není schválená výše hypotéky. Záporná rezerva zůstává viditelná."
      table={{
        headers: ["Scénář", "Splátka", "DSTI", "Rezerva"],
        rows: [
          [
            "Základ",
            formatCurrency(basePayment, "CZK"),
            `${base.dstiPercent} %`,
            formatCurrency(base.residualCzk, "CZK"),
          ],
          [
            "Vyšší sazba",
            formatCurrency(stressPayment, "CZK"),
            `${stress.dstiPercent} %`,
            formatCurrency(stress.residualCzk, "CZK"),
          ],
        ],
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Čistý příjem" value={income} onChange={setIncome} />
        <Field label="Běžné výdaje" value={living} onChange={setLiving} />
        <Field label="Jiné splátky" value={other} onChange={setOther} />
        <Field label="Modelový úvěr" value={loan} onChange={setLoan} step={50_000} />
        <Field label="Sazba % p.a." value={rate} onChange={setRate} step={0.1} />
        <Field label="Splatnost (roky)" value={years} onChange={setYears} step={1} max={40} />
        <Field label="Stress sazba %" value={stressRate} onChange={setStressRate} step={0.1} />
        <Field label="Pokles příjmu %" value={incomeDrop} onChange={setIncomeDrop} step={1} max={50} />
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-white p-3">
        <Bar label="Příjem (po poklesu)" value={income * (1 - incomeDrop / 100)} max={maxBar} tone="teal" />
        <Bar label="Životní náklady" value={living} max={maxBar} tone="slate" />
        <Bar label="Jiné splátky" value={other} max={maxBar} tone="gold" />
        <Bar label="Modelová hypotéka" value={basePayment} max={maxBar} tone="teal" />
        <p
          className={cn(
            "pt-1 text-sm font-semibold tabular-nums",
            base.residualCzk < 0 ? "text-rose-600" : "text-deep-teal"
          )}
        >
          Rezerva: {formatCurrency(base.residualCzk, "CZK")}
          {base.residualCzk < 0 ? " (schodek)" : ""}
        </p>
      </div>
    </Shell>
  );
}

function EstimateGapViz() {
  const [price, setPrice] = useState(5_000_000);
  const [ltv, setLtv] = useState(80);
  const estimates = [price, Math.round(price * 0.9), Math.round(price * 0.8)];

  const rows = estimates.map((est) => {
    const m = estimateGapModel({
      purchasePriceCzk: price,
      estimateCzk: est,
      targetLtvPercent: ltv,
    });
    return {
      est,
      ...m,
    };
  });

  return (
    <Shell
      title="Kupní cena, odhad a potřebná hotovost"
      assumptions={`Model LTV ${ltv} % z odhadu. Další zástava se sem nepočítá — je to oddělený nástroj zajištění.`}
      table={{
        headers: ["Odhad", "Max. úvěr", "Vlastní na cenu", "Efekt. LTV z kupní"],
        rows: rows.map((r) => [
          formatCurrency(r.est, "CZK"),
          formatCurrency(r.maxLoanFromEstimateCzk, "CZK"),
          formatCurrency(r.ownFundsForPriceCzk, "CZK"),
          `${r.effectiveLtvOnPurchase.toFixed(1)} %`,
        ]),
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kupní cena" value={price} onChange={setPrice} step={50_000} />
        <Field label="Cílové LTV %" value={ltv} onChange={setLtv} step={1} max={100} />
      </div>
    </Shell>
  );
}

function IncomeSwitcherViz() {
  const scenarios = [
    {
      id: "employee",
      title: "Zaměstnanec",
      assess: "Průměr čisté mzdy, délka poměru, zkušební doba",
      docs: "Smlouva, výplatní pásky, potvrzení o příjmu",
      risk: "Zkušební doba, krátká historie u nového zaměstnavatele",
    },
    {
      id: "osvc",
      title: "OSVČ",
      assess: "Daňové přiznání, základ daně / metodika banky",
      docs: "DP, přehledy OSSZ/ZP, výpisy",
      risk: "Výdajový paušál snižuje uznatelný příjem",
    },
    {
      id: "parental",
      title: "Mateřská / rodičovská",
      assess: "Stabilita druhého příjmu, návrat do práce",
      docs: "Rozhodnutí OSSZ, smlouva partnera",
      risk: "Samostatný příjem často nestačí bez spolužadatele",
    },
    {
      id: "foreign",
      title: "Zahraniční mzda",
      assess: "Přepočet měny, doložitelnost, daňový rezident",
      docs: "Contract, payslips, potvrzení převodů",
      risk: "Kurzové riziko a neuznání části příjmu",
    },
  ] as const;
  const [id, setId] = useState<(typeof scenarios)[number]["id"]>("employee");
  const active = scenarios.find((s) => s.id === id)!;

  return (
    <Shell
      title="Příjmová situace — co banka typicky řeší"
      assumptions="Nejde o procento schválení ani jednotnou metodiku trhu. Každá banka má vlastní pravidla uznání příjmu."
    >
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Typ příjmu">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={id === s.id}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold",
              id === s.id
                ? "bg-deep-teal text-white"
                : "border border-border bg-white text-text-dark hover:border-deep-teal/40"
            )}
            onClick={() => setId(s.id)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-3">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
            Co posuzuje
          </dt>
          <dd className="mt-1 text-sm text-text-dark">{active.assess}</dd>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
            Co připravit
          </dt>
          <dd className="mt-1 text-sm text-text-dark">{active.docs}</dd>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
            Co komplikuje
          </dt>
          <dd className="mt-1 text-sm text-text-dark">{active.risk}</dd>
        </div>
      </dl>
    </Shell>
  );
}

function RejectionFlowViz() {
  const steps = [
    "Zjistit dostupný důvod zamítnutí (pokud banka sdělí)",
    "Prověřit registry a správnost údajů",
    "Opravit chyby nebo upravit financování / spolužadatele",
    "Připravit další postup až po odstranění překážky",
  ];
  return (
    <Shell
      title="Postup po zamítnutí"
      assumptions="Registr neslibuje schválení po univerzální lhůtě. Lhůty uchování údajů se liší podle registru a typu záznamu."
    >
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li
            key={s}
            className="flex gap-3 rounded-xl border border-border bg-white p-3 text-sm"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-deep-teal text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="text-text-dark">{s}</span>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

function PaymentSplitViz() {
  const [principal, setPrincipal] = useState(4_000_000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(30);
  const [months, setMonths] = useState(36);
  const split = paymentSplitOverMonths({
    principalCzk: principal,
    annualRatePercent: rate,
    termYears: years,
    months,
  });
  const max = Math.max(split.totalCashOutCzk, 1);

  return (
    <Shell
      title="Složení splátek: jistina vs. úrok"
      assumptions="Anuitní model. Zaplacená jistina není úrokový náklad — snižuje zůstatek dluhu."
      table={{
        headers: ["Položka", "Částka"],
        rows: [
          ["Měsíční splátka", formatCurrency(split.monthlyPaymentCzk, "CZK")],
          [`Úroky za ${months} měs.`, formatCurrency(split.interestCzk, "CZK")],
          [`Jistina za ${months} měs.`, formatCurrency(split.principalPaidCzk, "CZK")],
          ["Celkový odtok", formatCurrency(split.totalCashOutCzk, "CZK")],
          ["Zůstatek dluhu", formatCurrency(split.remainingPrincipalCzk, "CZK")],
        ],
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Jistina" value={principal} onChange={setPrincipal} step={50_000} />
        <Field label="Sazba %" value={rate} onChange={setRate} step={0.1} />
        <Field label="Splatnost (roky)" value={years} onChange={setYears} step={1} />
        <Field label="Horizont (měs.)" value={months} onChange={setMonths} step={1} />
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-white p-3">
        <Bar label="Úroky (náklad)" value={split.interestCzk} max={max} tone="gold" />
        <Bar label="Splacená jistina" value={split.principalPaidCzk} max={max} tone="teal" />
      </div>
    </Shell>
  );
}

function OfferCompareViz() {
  const [principal, setPrincipal] = useState(4_000_000);
  const [years, setYears] = useState(30);
  const [rateA, setRateA] = useState(4.79);
  const [rateB, setRateB] = useState(5.09);
  const [insA, setInsA] = useState(800);
  const [insB, setInsB] = useState(0);
  const [horizon, setHorizon] = useState(36);

  const payA = roundMoney(calculateAnnuityPayment(principal, rateA, years));
  const payB = roundMoney(calculateAnnuityPayment(principal, rateB, years));
  const cashA = roundMoney((payA + insA) * horizon);
  const cashB = roundMoney((payB + insB) * horizon);

  return (
    <Shell
      title="Srovnání dvou nabídek za stejné období"
      assumptions="Porovnává peněžní odtok (splátka + modelové pojištění). RPSN sem nedopočítáváme — berte ji z nabídky banky."
      table={{
        headers: ["Nabídka", "Splátka", "Pojištění/měs.", `Odtok ${horizon} měs.`],
        rows: [
          ["A", formatCurrency(payA, "CZK"), formatCurrency(insA, "CZK"), formatCurrency(cashA, "CZK")],
          ["B", formatCurrency(payB, "CZK"), formatCurrency(insB, "CZK"), formatCurrency(cashB, "CZK")],
        ],
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Jistina" value={principal} onChange={setPrincipal} step={50_000} />
        <Field label="Splatnost" value={years} onChange={setYears} step={1} />
        <Field label="Horizont měs." value={horizon} onChange={setHorizon} step={1} />
        <Field label="Sazba A %" value={rateA} onChange={setRateA} step={0.01} />
        <Field label="Pojištění A" value={insA} onChange={setInsA} step={50} />
        <Field label="Sazba B %" value={rateB} onChange={setRateB} step={0.01} />
        <Field label="Pojištění B" value={insB} onChange={setInsB} step={50} />
      </div>
      <p className="text-sm font-semibold text-text-dark">
        Rozdíl odtoku A−B: {formatCurrency(cashA - cashB, "CZK")}
      </p>
    </Shell>
  );
}

function RefinanceCompareViz() {
  const [principal, setPrincipal] = useState(3_500_000);
  const [years, setYears] = useState(25);
  const [currentRate, setCurrentRate] = useState(5.5);
  const [newRate, setNewRate] = useState(4.8);
  const [switchCost, setSwitchCost] = useState(15_000);
  const [horizon, setHorizon] = useState(36);
  const cmp = refinanceHorizonCompare({
    remainingPrincipalCzk: principal,
    currentRatePercent: currentRate,
    newRatePercent: newRate,
    remainingYears: years,
    switchCostCzk: switchCost,
    horizonMonths: horizon,
  });

  return (
    <Shell
      title="Ponechat / refinancovat (stejný horizont)"
      assumptions="Náhrada za předčasné splacení zde není „přesný poplatek banky“ — zadejte vlastní odhad nákladů změny. Zákonný strop ≠ konečná částka."
      table={{
        headers: ["Varianta", "Splátka", `Odtok ${horizon} měs.`],
        rows: [
          ["Ponechat", formatCurrency(cmp.currentPaymentCzk, "CZK"), formatCurrency(cmp.currentCashOutCzk, "CZK")],
          [
            "Refinancovat (+ náklady)",
            formatCurrency(cmp.newPaymentCzk, "CZK"),
            formatCurrency(cmp.newCashOutIncludingSwitchCzk, "CZK"),
          ],
        ],
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Zůstatek" value={principal} onChange={setPrincipal} step={50_000} />
        <Field label="Zbývající roky" value={years} onChange={setYears} step={1} />
        <Field label="Současná sazba %" value={currentRate} onChange={setCurrentRate} step={0.1} />
        <Field label="Nová sazba %" value={newRate} onChange={setNewRate} step={0.1} />
        <Field label="Náklady změny" value={switchCost} onChange={setSwitchCost} step={1000} />
        <Field label="Horizont měs." value={horizon} onChange={setHorizon} step={1} />
      </div>
      <p className="text-sm font-semibold text-text-dark">
        Rozdíl refinancovat − ponechat: {formatCurrency(cmp.cashDeltaCzk, "CZK")}
      </p>
    </Shell>
  );
}

function ReserveRunwayViz() {
  const [reserve, setReserve] = useState(150_000);
  const [income, setIncome] = useState(55_000);
  const [reduced, setReduced] = useState(25_000);
  const [mortgage, setMortgage] = useState(18_000);
  const [living, setLiving] = useState(20_000);
  const shortfall = Math.max(0, mortgage + living - reduced);
  const months = reserveRunwayMonths({
    reserveCzk: reserve,
    monthlyShortfallCzk: shortfall,
  });

  return (
    <Shell
      title="Rezerva při dočasném poklesu příjmu"
      assumptions="Bez automatického pojistného plnění. Pokud pojištění dostanete, jde o smluvní nárok — zde se nepočítá, dokud ho nezadáte do rezervy."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Rezerva" value={reserve} onChange={setReserve} />
        <Field label="Běžný příjem" value={income} onChange={setIncome} />
        <Field label="Snížený příjem" value={reduced} onChange={setReduced} />
        <Field label="Splátka hypotéky" value={mortgage} onChange={setMortgage} />
        <Field label="Nutné výdaje" value={living} onChange={setLiving} />
      </div>
      <p className="text-sm text-text-dark">
        Měsíční schodek:{" "}
        <strong className="tabular-nums">{formatCurrency(shortfall, "CZK")}</strong>
        . Orientační výdrž rezervy:{" "}
        <strong>
          {months == null ? "schodek není" : `${months} měs.`}
        </strong>
      </p>
    </Shell>
  );
}

function DivorceOptionsViz() {
  const cards = [
    {
      title: "Převzetí jedním",
      consent: "Souhlas banky + nové posouzení bonity",
      money: "Jeden dlužník nese celou splátku",
      risk: "Vyvázání není automatické",
    },
    {
      title: "Prodej nemovitosti",
      consent: "Souhlas vlastníků a často banky",
      money: "Z výnosu se splatí zůstatek",
      risk: "Tržní cena, daňové a transakční náklady",
    },
    {
      title: "Dočasné společné pokračování",
      consent: "Dohoda o platbách mezi dlužníky",
      money: "Solidární závazek vůči bance trvá",
      risk: "Jeden neplatí → banka může vymáhat oba",
    },
  ];
  return (
    <Shell
      title="Variantní karty řešení"
      assumptions="Vyvázání spoludlužníka banka vždy posuzuje znovu. Právní vypořádání SJM ≠ automatická změna úvěrové smlouvy."
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <article key={c.title} className="rounded-xl border border-border bg-white p-4 text-sm">
            <h5 className="font-heading text-base font-bold text-text-dark">{c.title}</h5>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="font-semibold text-deep-teal">Souhlas: </span>
                {c.consent}
              </li>
              <li>
                <span className="font-semibold text-deep-teal">Finance: </span>
                {c.money}
              </li>
              <li>
                <span className="font-semibold text-deep-teal">Riziko: </span>
                {c.risk}
              </li>
            </ul>
          </article>
        ))}
      </div>
    </Shell>
  );
}

function TaxDeductionViz() {
  const [interest, setInterest] = useState(120_000);
  const [cap, setCap] = useState(150_000);
  const [rate, setRate] = useState(15);
  const [canUse, setCanUse] = useState(true);
  const model = mortgageInterestDeductionModel({
    annualInterestPaidCzk: interest,
    deductibleCapCzk: cap,
    marginalTaxRatePercent: rate,
    canUtilizeDeduction: canUse,
  });

  return (
    <Shell
      title="Model odpočtu úroků"
      assumptions="Není daňové rozhodnutí. Limit a nárok závisí na datu úvěru, účelu a možnosti odpočet skutečně uplatnit. Mezní sazbu nastavte podle své situace."
      table={{
        headers: ["Položka", "Částka"],
        rows: [
          ["Zaplacené úroky", formatCurrency(interest, "CZK")],
          ["Uplatnitelný odpočet", formatCurrency(model.applicableDeductionCzk, "CZK")],
          ["Modelové snížení daně", formatCurrency(model.modelledTaxReliefCzk, "CZK")],
          ["Neuplatněné úroky", formatCurrency(model.unusedInterestCzk, "CZK")],
        ],
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Úroky za rok" value={interest} onChange={setInterest} />
        <Field label="Strop odpočtu" value={cap} onChange={setCap} />
        <Field label="Mezní sazba %" value={rate} onChange={setRate} step={1} max={35} />
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-text-dark">
          <input
            type="checkbox"
            checked={canUse}
            onChange={(e) => setCanUse(e.target.checked)}
            className="h-4 w-4"
          />
          Mohu odpočet využít
        </label>
      </div>
    </Shell>
  );
}

export function PracticeViz({ vizId }: { vizId: string }) {
  switch (vizId) {
    case "purchase-flow":
      return <PurchaseFlowViz />;
    case "budget-split":
      return <BudgetSplitViz />;
    case "estimate-gap":
      return <EstimateGapViz />;
    case "income-switcher":
      return <IncomeSwitcherViz />;
    case "rejection-flow":
      return <RejectionFlowViz />;
    case "payment-split":
      return <PaymentSplitViz />;
    case "offer-compare":
      return <OfferCompareViz />;
    case "refinance-compare":
      return <RefinanceCompareViz />;
    case "reserve-runway":
      return <ReserveRunwayViz />;
    case "divorce-options":
      return <DivorceOptionsViz />;
    case "tax-deduction":
      return <TaxDeductionViz />;
    default:
      return null;
  }
}
