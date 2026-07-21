import {
  calculateAnnuityPayment,
  countryConfigs,
  type CountryId,
  type CurrencyCode,
} from "@/lib/calculators";
import { destinationCards } from "@/lib/mock-data";
import {
  buyVsRentDeepAnalysis,
} from "@/lib/buy-vs-rent-deep-analysis";

export { buyVsRentDeepAnalysis } from "@/lib/buy-vs-rent-deep-analysis";

export type WinnerTone = "buy" | "rent" | "mixed";

export interface BuyVsRentCountryData {
  buyPros: string[];
  buyCons: string[];
  rentPros: string[];
  rentCons: string[];
  analysis: string;
  winner: string;
  winnerTone: WinnerTone;
  breakEvenYears: number;
}

export interface BreakEvenChartPoint {
  rok: string;
  koupě: number;
  nájem: number;
}

export const buyVsRentData: Record<string, BuyVsRentCountryData> = {
  "Česká republika": {
    buyPros: [
      "Budování vlastního kapitálu",
      "Ochrana proti inflaci",
      "Daňová stabilita",
    ],
    buyCons: [
      "Vysoký úrok hypotéky",
      "Náklady na údržbu",
      "Nízká likvidita",
    ],
    rentPros: [
      "Finanční flexibilita",
      "Žádné starosti s opravami",
      "Rychlá změna lokality",
    ],
    rentCons: [
      "Kapitál zůstává u pronajímatele — budujete si vlastní equity méně přímo",
      "Riziko růstu nájmu",
      "Absence rozhodovací pravomoci",
    ],
    analysis:
      "V ČR je zlomový bod (break-even) cca 7–9 let. Pokud plánujete v nemovitosti bydlet kratší dobu, nájem vychází finančně výhodněji díky vysokým nákladům na pořízení (daň, provize).",
    winner: "Koupě (při horizontu 10+ let)",
    winnerTone: "buy",
    breakEvenYears: 8,
  },
  "SAE (Dubaj)": {
    buyPros: [
      "Žádné daně z příjmu",
      "Vysoké zhodnocení kapitálu",
      "Lifestyle v luxusu",
    ],
    buyCons: [
      "Vysoké servisní poplatky",
      "Nízký rental yield v poměru k ceně",
      "Riziko přetlaku nabídky",
    ],
    rentPros: [
      "Flexibilita pro expaty",
      "Žádné poplatky za údržbu",
      "Možnost měnit čtvrť podle práce",
    ],
    rentCons: [
      "Peníze vynaložené na nájem jsou čistý náklad",
      "Vysoké roční nájmy",
      "Nutnost placení v šecích (často i ročně dopředu)",
    ],
    analysis:
      "Dubaj je trh pro investory. Pokud nejste rezident s dlouhodobými plány, nájem je bezpečnější. Koupě dává smysl pouze jako investiční aktivum pro růst ceny (capital appreciation).",
    winner: "Nájem (pro mobilitu) / Koupě (pro investici)",
    winnerTone: "mixed",
    breakEvenYears: 12,
  },
  "Španělsko": {
    buyPros: [
      "Stabilní poptávka po druhém domově",
      "Nižší úrokové sazby v EUR",
      "Možnost krátkodobého pronájmu na pobřeží",
    ],
    buyCons: [
      "ITP daň 6–10 % podle regionu",
      "Složitá byrokracie pro cizince (NIE)",
      "Sezónní výkyvy obsazenosti",
    ],
    rentPros: [
      "Žádné starosti s údržbou vily",
      "Možnost testovat lokalitu před koupí",
      "Nižší počáteční kapitálová náročnost",
    ],
    rentCons: [
      "Roční smlouvy s omezenou flexibilitou",
      "Nájem roste s inflací v turistických oblastech",
      "Žádné budování equity",
    ],
    analysis:
      "Na španělském pobřeží je break-even typicky 9–11 let. Pro rekreační užívání 4–6 týdnů ročně vychází nájem ekonomicky lépe než vlastnictví s poplatky ITP a správou na dálku.",
    winner: "Nájem (krátkodobé užívání) / Koupě (10+ let)",
    winnerTone: "mixed",
    breakEvenYears: 10,
  },
  "Itálie": {
    buyPros: [
      "Přístup k historickým nemovitostem",
      "Silný dlouhodobý růst v turistických centrech",
      "Možnost rekonstrukce a zhodnocení",
    ],
    buyCons: [
      "Vysoké náklady na rekonstrukci starších domů",
      "Složitá legislativa (vincolo, stavební povolení)",
      "Nižší likvidita mimo top destinace",
    ],
    rentPros: [
      "Vyzkoušení regionu bez velkého vkladu",
      "Žádné daně z vlastnictví IMU",
      "Flexibilita mezi městy (Řím, Florencie, pobřeží)",
    ],
    rentCons: [
      "Omezená nabídka dlouhodobých pronájmů v centrech",
      "Roční nájmy v turistických zónách rostou rychle",
      "Nulová návratnost vložených prostředků",
    ],
    analysis:
      "Itálie je trh pro dlouhodobé investory. Bod zvratu se pohybuje kolem 10–12 let kvůli vyšším transakčním nákladům a často nutné renovaci. Krátkodobý pobyt nebo testování lokality směřuje k nájmu.",
    winner: "Koupě (při renovaci a horizontu 12+ let)",
    winnerTone: "buy",
    breakEvenYears: 11,
  },
  "Chorvatsko": {
    buyPros: [
      "Silný trh krátkodobých pronájmů",
      "Nižší vstupní ceny než v západní Evropě",
      "Euro jako měna od 2023",
    ],
    buyCons: [
      "Sezónní závislost příjmů (červen–září)",
      "Regulace Airbnb v centrech měst",
      "Nutnost správy na dálku mimo sezónu",
    ],
    rentPros: [
      "Ideální pro letní dovolenou bez fixních nákladů",
      "Žádné starosti mimo sezónu",
      "Možnost měnit ostrov každý rok",
    ],
    rentCons: [
      "V hlavní sezóně vysoké ceny",
      "Omezená dostupnost v červenci/srpnu",
      "Peníze za nájem jsou nevratné",
    ],
    analysis:
      "Chorvatsko je ideální pro investory s pronájmem v sezóně — break-even kolem 7–9 let při silném obsazení. Pro rodinu využívající nemovitost 2–3 měsíce ročně je nájem finančně racionálnější.",
    winner: "Koupě (investiční pronájem) / Nájem (osobní užívání)",
    winnerTone: "mixed",
    breakEvenYears: 8,
  },
  "Bali (Indonésie)": {
    buyPros: [
      "Extrémně vysoký ROI z pronájmu (10–15 %)",
      "Nízké vstupní ceny vil",
      "Silná poptávka po luxusním ubytování",
    ],
    buyCons: [
      "Leasehold (30 let), ne plné vlastnictví",
      "Lokální hypotéky pro cizince prakticky nedostupné",
      "Legislativní rizika a nutnost PT PMA struktury",
    ],
    rentPros: [
      "Žádný kapitálový vklad ani právní riziko",
      "Možnost měnit lokaci (Ubud, Canggu, Uluwatu)",
      "Ideální pro digitální nomády",
    ],
    rentCons: [
      "Roční nájmy vil v top lokalitách jsou vysoké",
      "Platby často ročně dopředu",
      "Žádný podíl na růstu hodnoty",
    ],
    analysis:
      "Bali je investiční trh s hotovostní koupí — break-even z pronájmu může být jen 5–7 let. Pro osobní pobyt bez investičního záměru je dlouhodobý nájem bezpečnější kvůli leasehold legislativě.",
    winner: "Koupě (investice s cash-flow) / Nájem (dlouhodobý pobyt)",
    winnerTone: "mixed",
    breakEvenYears: 6,
  },
  "Saúdská Arábie": {
    buyPros: [
      "Giga-projekty (NEOM, Riyadh) s vysokým potenciálem",
      "Rostoucí trh s expat komunitou",
      "Stabilní měna (SAR navázaná na USD)",
    ],
    buyCons: [
      "Trh v počáteční fázi — vysoká nejistota",
      "Omezená historie pro ověření výnosů",
      "Specifická kultura a regulace vlastnictví",
    ],
    rentPros: [
      "Flexibilita při krátkých pracovních kontraktech",
      "Žádné riziko předčasného vstupu do trhu",
      "Servis a údržbu řeší pronajímatel",
    ],
    rentCons: [
      "Vysoké nájmy v nových čtvrtích",
      "Roční platby běžné u prémiových bytů",
      "Nulový kapitálový zisk z nájmu",
    ],
    analysis:
      "Saúdská Arábie je emerging market — break-even nelze spolehlivě určit pod 10–15 let kvůli nedostatečným datům. Pro expaty na 2–3leté kontrakty je nájem rozumnější; koupě jako spekulace na růst giga-projektů.",
    winner: "Nájem (expati) / Koupě (dlouhodobá spekulace)",
    winnerTone: "mixed",
    breakEvenYears: 13,
  },
  "Slovensko": {
    buyPros: [
      "Nižší ceny než v ČR při srovnatelné kvalitě",
      "Blízkost a snadná správa z ČR",
      "Růst cen v Bratislavě a turistických regionech",
    ],
    buyCons: [
      "Menší likvidita mimo hlavní město",
      "Vyšší úroky než v západní Evropě",
      "Nutnost řešit daňové povinnosti v SR",
    ],
    rentPros: [
      "Nízké nájmy mimo Bratislavu",
      "Flexibilita pro testování trhu",
      "Žádné transakční poplatky při vstupu",
    ],
    rentCons: [
      "Omezená nabídka kvalitního nábytku",
      "Růst nájmů v Bratislavě",
      "Peníze nepracují na váš majetek",
    ],
    analysis:
      "Na Slovensku je break-even podobný ČR — cca 7–9 let. Pro investory z ČR dává koupě smysl při dlouhodobém horizontu a pronájmu; krátkodobé užívání nebo testování lokality směřuje k nájmu.",
    winner: "Koupě (při horizontu 8+ let)",
    winnerTone: "buy",
    breakEvenYears: 8,
  },
};

const countryNameById = Object.fromEntries(
  destinationCards.map((card) => [card.id, card.name])
) as Record<CountryId, string>;

const TRANSACTION_FEE_RATE = 0.045;
const MAINTENANCE_RATE = 0.015;
const RENT_GROWTH_RATE = 0.03;
const CHART_YEARS = 15;

export function getBuyVsRentCountryName(countryId: CountryId): string {
  return countryNameById[countryId];
}

export function getBuyVsRentData(countryId: CountryId): BuyVsRentCountryData {
  const name = getBuyVsRentCountryName(countryId);
  return buyVsRentData[name];
}

export function generateBreakEvenChartData(
  countryId: CountryId
): BreakEvenChartPoint[] {
  const config = countryConfigs[countryId];
  const { defaultPrice: price, defaultSavings: savings, defaultTerm: term, defaultRentalYield: yieldRate } =
    config;

  // Bez ověřené lokální sazby nepočítáme falešnou anuitu — cash-heavy model
  const rate = config.defaultRate;
  const loanAmount = Math.max(0, price - savings);
  const monthlyMortgage =
    rate != null && rate > 0
      ? calculateAnnuityPayment(loanAmount, rate, term)
      : 0;
  const annualMortgage = monthlyMortgage * 12;
  const initialBuyCost = savings + price * TRANSACTION_FEE_RATE;
  const yearlyBuyCost = annualMortgage + price * MAINTENANCE_RATE;
  const baseAnnualRent = price * yieldRate;

  const data: BreakEvenChartPoint[] = [];
  let buyTotal = initialBuyCost;
  let rentTotal = 0;

  for (let year = 1; year <= CHART_YEARS; year++) {
    buyTotal += yearlyBuyCost;
    rentTotal += baseAnnualRent * Math.pow(1 + RENT_GROWTH_RATE, year - 1);
    data.push({
      rok: `Rok ${year}`,
      koupě: Math.round(buyTotal),
      nájem: Math.round(rentTotal),
    });
  }

  return data;
}

export function getBuyVsRentCurrency(countryId: CountryId): CurrencyCode {
  return countryConfigs[countryId].currency;
}

export function getBuyVsRentDeepAnalysis(countryId: CountryId) {
  const name = getBuyVsRentCountryName(countryId);
  const data = buyVsRentDeepAnalysis[name];
  if (!data) {
    throw new Error(
      `Missing buy-vs-rent deep analysis for countryId=${countryId} (name=${name}). Cross-country fallback is forbidden.`
    );
  }
  return data;
}

export const verdictStyles: Record<
  WinnerTone,
  { card: string; badge: string; text: string }
> = {
  buy: {
    card: "bg-emerald-900",
    badge: "bg-white text-emerald-900",
    text: "text-emerald-100",
  },
  rent: {
    card: "bg-rose-900",
    badge: "bg-white text-rose-900",
    text: "text-rose-100",
  },
  mixed: {
    card: "bg-slate-800",
    badge: "bg-white text-slate-800",
    text: "text-slate-200",
  },
};
