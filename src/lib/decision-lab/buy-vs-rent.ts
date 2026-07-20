import { calculateAnnuityPayment } from "@/lib/calculators";
import { remainingLoanBalance } from "@/lib/investment-engine/math";
import type { ChartMeta } from "@/lib/decision-lab/types";

export type BuyVsRentInput = {
  purchasePrice: number;
  /** Měsíční nájem */
  monthlyRent: number;
  /** Sazba hypotéky % p.a. — null/0 = cash koupě */
  mortgageRate: number | null;
  downPayment: number;
  /** Roční maintenance jako podíl z kupní ceny */
  maintenanceRate: number;
  /** Transakční náklady jako podíl z kupní ceny (jednorázově) */
  transactionCostRate: number;
  annualPropertyGrowth: number;
  annualRentGrowth: number;
  /** Alternativní výnos vlastního kapitálu (opportunity cost) */
  alternativeEquityReturn: number;
  horizonYears: number;
  termYears: number;
};

export type BuyVsRentYearPoint = {
  year: number;
  label: string;
  buyNetWorth: number;
  rentNetWorth: number;
  buyCumulativeCashOut: number;
  rentCumulativeCashOut: number;
};

export type BuyVsRentResult = {
  series: BuyVsRentYearPoint[];
  /** První rok, kdy buy NW > rent NW; null = v horizontu nenastalo */
  buyAdvantageFromYear: number | null;
  /** První rok, kdy rent NW > buy NW od začátku dominance nájmu */
  rentAdvantageFromYear: number | null;
  verdictSentence: string;
  assumptions: string[];
  chartMeta: ChartMeta;
};

export function simulateBuyVsRent(input: BuyVsRentInput): BuyVsRentResult {
  const price = Math.max(0, input.purchasePrice);
  const down = Math.min(Math.max(0, input.downPayment), price);
  const loan = Math.max(0, price - down);
  const tx = price * Math.max(0, input.transactionCostRate);
  const initialCapitalTied = down + tx;

  const hasDebt =
    loan > 0 &&
    input.mortgageRate != null &&
    input.mortgageRate > 0 &&
    input.termYears > 0;

  const monthlyMortgage = hasDebt
    ? calculateAnnuityPayment(loan, input.mortgageRate!, input.termYears)
    : loan > 0 && input.termYears > 0
      ? loan / (input.termYears * 12)
      : 0;
  const annualDebt = monthlyMortgage * 12;
  const annualMaintenance = price * Math.max(0, input.maintenanceRate);

  const series: BuyVsRentYearPoint[] = [];
  let buyCashOut = initialCapitalTied;
  let rentCashOut = 0;
  /** Renter investuje kapitál, který by šel do akontace+tx */
  let rentPortfolio = initialCapitalTied;

  let buyAdvantageFromYear: number | null = null;
  let rentAdvantageFromYear: number | null = null;

  for (let y = 1; y <= input.horizonYears; y++) {
    const rentAnnual =
      input.monthlyRent *
      12 *
      Math.pow(1 + input.annualRentGrowth, y - 1);
    const propValue =
      price * Math.pow(1 + input.annualPropertyGrowth, y);
    const debtLeft = hasDebt
      ? remainingLoanBalance(
          loan,
          input.mortgageRate!,
          input.termYears,
          y
        )
      : loan > 0
        ? Math.max(0, loan - (loan / input.termYears) * y)
        : 0;

    const buyCarry = annualDebt + annualMaintenance;
    buyCashOut += buyCarry;
    rentCashOut += rentAnnual;

    // Opportunity: renter earns alt return on portfolio; adds/subtracts cost gap
    rentPortfolio =
      rentPortfolio * (1 + input.alternativeEquityReturn) +
      (buyCarry - rentAnnual);

    const buyNetWorth = propValue - debtLeft;
    const rentNetWorth = rentPortfolio;

    if (buyNetWorth > rentNetWorth && buyAdvantageFromYear == null) {
      buyAdvantageFromYear = y;
    }
    if (rentNetWorth > buyNetWorth && rentAdvantageFromYear == null) {
      rentAdvantageFromYear = y;
    }

    series.push({
      year: y,
      label: `Rok ${y}`,
      buyNetWorth: Math.round(buyNetWorth),
      rentNetWorth: Math.round(rentNetWorth),
      buyCumulativeCashOut: Math.round(buyCashOut),
      rentCumulativeCashOut: Math.round(rentCashOut),
    });
  }

  const verdictSentence = buildVerdict(
    buyAdvantageFromYear,
    rentAdvantageFromYear,
    input.horizonYears,
    series
  );

  return {
    series,
    buyAdvantageFromYear,
    rentAdvantageFromYear,
    verdictSentence,
    assumptions: [
      `Cena ${Math.round(price)}, akontace ${Math.round(down)}, úvěr ${Math.round(loan)}.`,
      `Sazba ${hasDebt ? `${input.mortgageRate}%` : "bez úroku / cash model"}, splatnost ${input.termYears} let.`,
      `Maintenance ${(input.maintenanceRate * 100).toFixed(1)} % p.a., transakční náklady ${(input.transactionCostRate * 100).toFixed(1)} %.`,
      `Růst ceny ${(input.annualPropertyGrowth * 100).toFixed(1)} %, růst nájmu ${(input.annualRentGrowth * 100).toFixed(1)} %.`,
      `Alternativní výnos kapitálu ${(input.alternativeEquityReturn * 100).toFixed(1)} % p.a.`,
      `Horizont ${input.horizonYears} let. Verdikt je scénářový — ne univerzální vítěz.`,
    ],
    chartMeta: {
      title: "Koupě vs. nájem — čisté jmění",
      methodology:
        "Porovnává čisté jmění kupujícího (hodnota nemovitosti − zůstatek úvěru) s portfoliem nájemce (akontace+tx investované alternativním výnosem ± rozdíl ročních nákladů). Break-even = první rok dominance dle těchto předpokladů.",
      source: "Decision Lab model (HypotékaJasně.cz)",
      sourceUrl: null,
      statusNote: "MODELLED — výsledky závisí na vstupech, ne na historické jistotě.",
    },
  };
}

function buildVerdict(
  buyFrom: number | null,
  rentFrom: number | null,
  horizon: number,
  series: BuyVsRentYearPoint[]
): string {
  if (series.length === 0) {
    return "Při těchto předpokladech nelze spočítat srovnání.";
  }
  const last = series[series.length - 1];
  if (buyFrom != null && (rentFrom == null || buyFrom <= rentFrom)) {
    return `Při těchto předpokladech vychází koupě výhodněji od roku ${buyFrom}.`;
  }
  if (rentFrom != null && (buyFrom == null || rentFrom < buyFrom)) {
    // If rent leads early but buy overtakes later
    if (buyFrom != null && buyFrom > rentFrom) {
      return `Při těchto předpokladech je nájem výhodnější do roku ${buyFrom - 1}; od roku ${buyFrom} vychází výhodněji koupě.`;
    }
    return `Při těchto předpokladech vychází nájem výhodněji od roku ${rentFrom} (v horizontu ${horizon} let).`;
  }
  if (last.buyNetWorth >= last.rentNetWorth) {
    return `Při těchto předpokladech je na konci horizontu (${horizon} let) výhodnější koupě, bez dřívějšího jednoznačného průsečíku.`;
  }
  return `Při těchto předpokladech je na konci horizontu (${horizon} let) výhodnější nájem — v horizontu nenastal rok, od kterého by koupě trvale vedla.`;
}
