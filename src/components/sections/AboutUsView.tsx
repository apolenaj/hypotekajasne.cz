"use client";

import {
  ArrowRight,
  BarChart3,
  Code2,
  Globe2,
  ShieldCheck,
} from "lucide-react";

const pillars = [
  {
    icon: BarChart3,
    title: "Data místo emocí",
    description:
      "Neřídíme se pocity z pěkných fotek. Naše doporučení stojí na hloubkových makroekonomických analýzách, výpočtech break-even bodů a tvrdé matematice složeného úročení.",
  },
  {
    icon: Code2,
    title: "Technologický náskok",
    description:
      "Jsme technologická firma působící ve financích. Využíváme pokročilou automatizaci a chytré softwarové nástroje, aby byl proces schvalování hypoték a nákupu nemovitostí bezchybný a rychlý.",
  },
  {
    icon: Globe2,
    title: "Procesní dokonalost",
    description:
      "Nákup zahraniční nemovitosti je komplexní logistická operace. Od rezervace přes právní due-diligence až po předání klíčů aplikujeme striktní operační procesy, které eliminují rizika.",
  },
];

const stats = [
  { value: "8", label: "Analyzovaných investičních trhů" },
  { value: "360°", label: "Propojení financí a nemovitostí" },
  { value: "24 h", label: "Průměrná doba reakce specialisty" },
  { value: "100 %", label: "Transparentní procesní dohled" },
];

function scrollToConsultation() {
  document.getElementById("konzultace")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function AboutUsView() {
  return (
    <section
      id="o-nas"
      className="bg-white animate-in fade-in duration-500 scroll-mt-28"
    >
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900 z-0" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-6 block">
            Kdo jsme
          </span>
          <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight">
            Spojujeme lokální kapitál
            <br />
            s globálními příležitostmi.
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto font-light leading-relaxed">
            HypotékaJasně.cz a portál Majetio.cz nevznikly jako další běžná
            realitka. Vznikly jako odpověď na chybějící technologickou a
            analytickou platformu pro náročné investory.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mb-6">
                <pillar.icon className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                {pillar.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-950 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-emerald-200/90 leading-snug max-w-[12rem] mx-auto">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg prose-emerald max-w-none text-gray-700">
            <h3 className="font-heading text-3xl font-extrabold text-gray-900 mb-8 text-center not-prose">
              Naše vize
            </h3>
            <p className="text-xl text-gray-600 font-medium text-center mb-12 not-prose leading-relaxed">
              Budujeme ekosystém, ve kterém se klient nemusí starat o byrokracii,
              ale pouze o to nejdůležitější – o zhodnocení svého majetku.
            </p>
            <p>
              Tradiční hypoteční trh a realitní zprostředkování často trpí
              informační asymetrií. Klienti dostávají nabídky, které jsou výhodné
              spíše pro prodejce než pro ně samotné. Chtěli jsme to změnit.
              Spojením <strong>HypotékaJasně.cz</strong> (analytického a finančního
              nástroje) a <strong>Majetio.cz</strong> (prémiové nabídky prověřených
              nemovitostí) jsme vytvořili uzavřený kruh.
            </p>
            <p>
              Naše kořeny leží v hlubokém pochopení velkých operačních a
              logistických systémů. Víme, jak řídit procesy na milimetry přesně, a
              tuto kulturu efektivity jsme přenesli do světa financí. Zajišťujeme
              plynulý tok informací, bezpečné převody kapitálu a dohled nad právními
              náležitostmi ve Španělsku, Dubaji, Indonésii i v domovské České
              republice.
            </p>
            <p className="mt-8 font-bold text-gray-900 not-prose">
              Vaše bohatství není náhoda. Je to výsledek správných dat, precizního
              načasování a dokonalé exekuce. Jsme tu, abychom vám tento výsledek
              doručili.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-emerald-50 rounded-3xl p-10 md:p-16 border border-emerald-100 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-6 h-6 text-emerald-800" />
          </div>
          <h3 className="font-heading text-3xl font-bold text-emerald-900 mb-4">
            Připraveni posunout své portfolio dál?
          </h3>
          <p className="text-emerald-800 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Ať už řešíte první investiční byt v Praze, nebo diverzifikaci kapitálu
            nákupem vily na pobřeží Costa del Sol, náš tým je připraven.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://majetio.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-900 text-white font-bold py-4 px-8 rounded-full hover:bg-emerald-800 transition-colors shadow-lg"
            >
              Prohlédnout nabídky na Majetio.cz
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={scrollToConsultation}
              className="bg-white text-emerald-900 font-bold py-4 px-8 rounded-full border border-emerald-200 hover:bg-gray-50 transition-colors"
            >
              Sjednat online konzultaci
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
