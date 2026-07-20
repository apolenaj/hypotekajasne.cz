import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  ClipboardList,
  Globe2,
  LineChart,
  Scale,
  TrendingUp,
} from "lucide-react";
import { routes } from "@/lib/routes";

const toolCards = [
  {
    href: routes.pruvodceInvestora + "/ceska-republika",
    title: "Hypotéky v ČR",
    description:
      "Domácí kalkulačka, regulace ČNB, průvodce hypotékou a investiční hub pro český trh.",
    icon: Calculator,
    accent: "bg-emerald-100 text-emerald-800",
  },
  {
    href: routes.pruvodceInvestora,
    title: "Zahraniční nemovitosti",
    description:
      "8 analyzovaných trhů — od Dubaje po Bali. Hub, financování a průvodce na míru.",
    icon: Globe2,
    accent: "bg-teal-100 text-teal-800",
  },
  {
    href: routes.kalkulacky.koupeVsNajem,
    title: "Koupě × Nájem",
    description:
      "Break-even graf a expertní analýza — kdy se vyplatí vlastnit a kdy zůstat u nájmu.",
    icon: Scale,
    accent: "bg-amber-100 text-amber-800",
  },
  {
    href: routes.kalkulacky.historickyVyvoj,
    title: "Historický vývoj",
    description:
      "Stroj času a makroekonomické grafy — jak se trhy chovaly v minulosti.",
    icon: LineChart,
    accent: "bg-blue-100 text-blue-800",
  },
  {
    href: routes.kalkulacky.potencialniVyvoj,
    title: "Potenciální vývoj",
    description:
      "20leté predikce s inflací a přepínatelnými scénáři pro každý trh.",
    icon: TrendingUp,
    accent: "bg-violet-100 text-violet-800",
  },
  {
    href: routes.clanky,
    title: "Investiční magazín",
    description:
      "Hloubkové analýzy, makroekonomika a tipy pro zahraniční investory.",
    icon: BookOpen,
    accent: "bg-rose-100 text-rose-800",
  },
  {
    href: routes.navrhNaMiru,
    title: "Hypoteční připravenost",
    description:
      "Skóre připravenosti, překážky a action plan — bez příslibu schválení bankou.",
    icon: ClipboardList,
    accent: "bg-emerald-900 text-white",
  },
  {
    href: routes.duvera,
    title: "Trust Center",
    description:
      "Kdo co dělá, jak vyděláváme, partneři a metodika — bez prázdných slibů.",
    icon: BarChart3,
    accent: "bg-gray-100 text-gray-800",
  },
];

export function HomeHub() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 block">
            Analytická platforma
          </span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark mb-4">
            Vyberte nástroj pro svůj investiční záměr
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Každý modul má vlastní URL. Data, kalkulačky a průvodce — bez
            nekonečného scrollování jedné stránky.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {toolCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${card.accent}`}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                {card.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                Otevřít
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
