"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Globe2,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/lib/routes";

const pillars = [
  {
    icon: BarChart3,
    title: "Data místo emocí",
    description:
      "Neřídíme se pocity z pěkných fotek. Naše doporučení stojí na makroekonomických analýzách, break-even modelech a transparentních předpokladech.",
  },
  {
    icon: Code2,
    title: "Technologický náskok",
    description:
      "Jsme technologická firma ve financích. Automatizace a chytré nástroje zrychlují scorování, kalkulace i předání poptávky ověřenému specialistovi.",
  },
  {
    icon: Globe2,
    title: "Procesní dokonalost",
    description:
      "Od rezervace přes due diligence až po předání klíčů aplikujeme striktní procesy, které snižují rizika u domácích i zahraničních nákupů.",
  },
];

const team = [
  {
    name: "Bc. Josef Apolenář BSc., MBA",
    initials: "JA",
    role: "Zakladatel & CEO",
    accent: "from-deep-teal to-deep-teal-light",
    badge: "Vize & technologie",
    badgeIcon: GraduationCap,
    bio: "Josef stojí za vizí a technologickým rozvojem celé platformy. Své vzdělání v oboru Computing Technologies na Roehampton University v Londýně naplno úročí při vývoji našeho datového ekosystému. Navíc díky studiu psychologie pro manažery a titulu MBA v oblasti moderního byznysu dbá na to, aby složitý svět financí a datových analýz byl pro klienty maximálně srozumitelný. Jeho cílem je zbavit hypoteční trh nepřehlednosti a nahradit ji čistými, na datech postavenými fakty.",
  },
  {
    name: "Michal Heinzke",
    initials: "MH",
    role: "Expert na financování a hypotéky",
    accent: "from-emerald-800 to-emerald-600",
    badge: "11 let praxe na trhu",
    badgeIcon: ShieldCheck,
    bio: "Michal přináší do projektu 11 let praxe z reálného trhu hypoték, úvěrů a pojištění. Zná do detailu metodiky jednotlivých bank, dokáže najít řešení i pro nestandardní příjmy a přesně ví, na co si dát při schvalování úvěru pozor. Pro klienty platformy je zárukou, že každý datový model a výpočet na webu má oporu v realitě a že jejich následné financování i zajištění proběhne hladce a bez zbytečných průtahů.",
  },
] as const;

function ProfilePhotoPlaceholder({
  initials,
  accent,
  name,
}: {
  initials: string;
  accent: string;
  name: string;
}) {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100"
      role="img"
      aria-label={`Fotografie: ${name} (placeholder)`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-90`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(0,0,0,0.15)_100%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading text-6xl font-bold tracking-tight text-white/90 md:text-7xl">
          {initials}
        </span>
      </div>
      <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-sm uppercase">
        Fotografie brzy
      </div>
    </div>
  );
}

export function AboutUsView() {
  return (
    <section
      id="o-nas"
      className="scroll-mt-28 animate-in fade-in bg-white duration-500"
    >
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 z-0 bg-deep-teal" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <span className="mb-6 block text-sm font-bold tracking-widest text-emerald-200/90 uppercase">
            O nás
          </span>
          <h1 className="font-heading mb-8 text-4xl leading-tight font-extrabold text-white md:text-6xl">
            Lidé, kteří stojí
            <br />
            za HypotékaJasně.cz
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed font-light text-emerald-50/90 md:text-xl">
            Spojujeme technologickou vizi s jedenáctiletou praxí z hypotečního
            trhu — aby byla data srozumitelná a financování reálně schválitelné.
          </p>
        </div>
      </div>

      {/* Team profiles */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-slate-50 to-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold tracking-widest text-deep-teal uppercase">
              Tým
            </p>
            <h2 className="font-heading text-3xl font-extrabold text-gray-900 md:text-4xl">
              Zakladatel a expert na financování
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Dva pilíře důvěryhodnosti: produktová vize postavená na datech a
              realita bankovního schvalování z terénu.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            {team.map((person) => (
              <Card
                key={person.name}
                className="gap-0 rounded-3xl border-0 bg-white py-0 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5"
              >
                <CardHeader className="gap-0 p-0">
                  <div className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] md:grid-cols-[13rem_1fr]">
                    <div className="p-5 pb-0 sm:p-6 sm:pr-0 sm:pb-6">
                      <ProfilePhotoPlaceholder
                        initials={person.initials}
                        accent={person.accent}
                        name={person.name}
                      />
                    </div>
                    <div className="flex flex-col justify-center px-6 pt-5 pb-2 sm:py-6 sm:pl-6 sm:pr-8">
                      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-deep-teal/8 px-3 py-1 text-xs font-semibold text-deep-teal">
                        <person.badgeIcon className="h-3.5 w-3.5" />
                        {person.badge}
                      </span>
                      <CardTitle className="font-heading text-xl leading-snug font-bold text-gray-900 md:text-2xl">
                        {person.name}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm font-semibold text-emerald-800">
                        {person.role}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pt-2 pb-7 sm:px-8 sm:pb-8">
                  <p className="text-[15px] leading-relaxed text-gray-600">
                    {person.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-12 flex max-w-3xl items-start gap-3 rounded-2xl border border-dashed border-deep-teal/25 bg-deep-teal/5 px-5 py-4 md:px-6 md:py-5">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-deep-teal" />
            <p className="text-sm leading-relaxed text-gray-700 md:text-base">
              Náš tým nezávislých analytiků a partnerů se neustále rozrůstá —
              abychom pokryli více trhů, více produktů a rychlejší reakci pro
              každého klienta.
            </p>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-gray-900">
            Na čem stavíme
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="py-2">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-deep-teal/10 text-deep-teal">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading mb-3 text-xl font-bold text-gray-900">
                {pillar.title}
              </h3>
              <p className="leading-relaxed text-gray-600">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vision */}
      <div className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-heading mb-6 text-3xl font-extrabold text-gray-900">
            Naše vize
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            Budujeme ekosystém, ve kterém se klient nemusí ztrácet v byrokracii,
            ale soustředí se na rozhodnutí podložená daty — ve spojení{" "}
            <strong className="font-semibold text-gray-900">
              HypotékaJasně.cz
            </strong>{" "}
            a{" "}
            <strong className="font-semibold text-gray-900">Majetio.cz</strong>.
          </p>
          <p className="leading-relaxed text-gray-600">
            Dobré rozhodnutí vychází z jasných předpokladů a vědomí rizik — ne z
            marketingových slibů. Jsme tu, abychom vám pomohli model sestavit a
            ověřit.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-10 text-center shadow-sm md:p-16">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-800" />
          </div>
          <h3 className="font-heading mb-4 text-3xl font-bold text-emerald-900">
            Chcete probrat svůj záměr s expertem?
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-emerald-800">
            Nechte si spočítat možnosti a navázat konzultaci — bez závazku a s
            důrazem na srozumitelná data.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-8 py-4 font-bold text-white shadow-lg transition-colors hover:bg-emerald-800"
            >
              Návrh na míru
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={routes.kontakt}
              className="rounded-full border border-emerald-200 bg-white px-8 py-4 font-bold text-emerald-900 transition-colors hover:bg-gray-50"
            >
              Kontaktovat tým
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
