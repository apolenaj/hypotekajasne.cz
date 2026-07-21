import { routes } from "@/lib/routes";
import { unifiedDestinations } from "@/lib/unified-destinations";

export interface InvestorPath {
  id: string;
  title: string;
  desc: string;
  icon: "capital" | "yield" | "risk" | "sea";
  markets: string[];
  accent: string;
  tagClass: string;
}

export const investorPaths: InvestorPath[] = [
  {
    id: "low-capital",
    title: "Nižší vstupní kapitál",
    desc: "Trhy s nižším orientačním prahem (např. leasehold struktury) nebo projekty se splátkovým kalendářem — vždy ověřte právní formu.",
    icon: "capital",
    markets: ["Bali (Indonésie)", "SAE (Dubaj)", "Saúdská Arábie"],
    accent: "from-amber-500/15 to-orange-500/5",
    tagClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
  {
    id: "high-yield",
    title: "Vyšší potenciální výnos",
    desc: "Lokality s častěji uváděným vyšším hrubým výnosem; čistý cash-flow závisí na obsazenosti, daních a správě.",
    icon: "yield",
    markets: ["Bali (Indonésie)", "SAE (Dubaj)", "Španělsko"],
    accent: "from-emerald-500/15 to-teal-500/5",
    tagClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  {
    id: "low-risk",
    title: "Nižší relativní riziko",
    desc: "Trhy s bližším právním rámcem EU / ČR. Riziko není nulové — vždy platí lokální právní a technickou prověrku.",
    icon: "risk",
    markets: ["Česká republika", "Itálie", "Slovensko"],
    accent: "from-sky-500/15 to-blue-500/5",
    tagClass: "bg-sky-50 text-sky-900 border-sky-200",
  },
  {
    id: "sea-rent",
    title: "Moře & sezónní pronájem",
    desc: "Kombinace vlastní rekreace a pronájmu mimo sezónu; výnos je silně sezónní.",
    icon: "sea",
    markets: ["Chorvatsko", "Španělsko", "Itálie"],
    accent: "from-cyan-500/15 to-indigo-500/5",
    tagClass: "bg-cyan-50 text-cyan-900 border-cyan-200",
  },
];

export function getPathMarketDetails(marketName: string) {
  return unifiedDestinations.find((d) => d.country === marketName);
}

export function getRentgenHref(country: string, city?: string): string {
  const params = new URLSearchParams({ country });
  if (city) params.set("city", city);
  return `${routes.investicniRentgenModelar}?${params.toString()}`;
}

/** Default city for Investiční rentgen prefill (matches LOCATIONS_DATA). */
export const pathDefaultCities: Record<string, string> = {
  "Česká republika": "Praha",
  Slovensko: "Bratislava",
  Chorvatsko: "Záhřeb",
  Španělsko: "Madrid",
  Itálie: "Řím",
  "SAE (Dubaj)": "Dubaj",
  "Saúdská Arábie": "Rijád",
  "Bali (Indonésie)": "Denpasar",
};
