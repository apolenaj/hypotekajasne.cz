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
    title: "Nejnižší potřebný kapitál",
    desc: "Trhy s nejnižším vstupním prahem (např. leasehold na Bali od 1,5 mil. Kč) nebo projekty se splátkovým kalendářem bez nutnosti hypotéky.",
    icon: "capital",
    markets: ["Bali (Indonésie)", "SAE (Dubaj)", "Saúdská Arábie"],
    accent: "from-amber-500/15 to-orange-500/5",
    tagClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
  {
    id: "high-yield",
    title: "Nejvyšší potenciální výnos",
    desc: "Lokalit s nejlepším čistým cash-flow a ROI přesahujícím 10 % p.a. díky silnému turistickému ruchu.",
    icon: "yield",
    markets: ["Bali (Indonésie)", "SAE (Dubaj)", "Španělsko"],
    accent: "from-emerald-500/15 to-teal-500/5",
    tagClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  {
    id: "low-risk",
    title: "Nejnižší riziko",
    desc: "Stabilní právní prostředí a alpské/evropské jistoty.",
    icon: "risk",
    markets: ["Česká republika", "Itálie", "Slovensko"],
    accent: "from-sky-500/15 to-blue-500/5",
    tagClass: "bg-sky-50 text-sky-900 border-sky-200",
  },
  {
    id: "sea-rent",
    title: "Kombinace: Moře & Pronájem",
    desc: "Ideální pro vlastní rekreaci v létě a pronájem mimo sezónu.",
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
  return `${routes.investicniRentgen}?${params.toString()}`;
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
