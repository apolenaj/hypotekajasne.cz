import Link from "next/link";
import {
  BookOpen,
  Building2,
  Calculator,
  FileSearch,
  Layers,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { routes } from "@/lib/routes";

const TOOLS = [
  {
    href: routes.kalkulacky.root,
    label: "Hypoteční kalkulačka",
    hint: "Splátka, LTV, stresové scénáře",
    icon: Calculator,
  },
  {
    href: routes.investicniRentgen,
    label: "Investiční rentgen",
    hint: "Analýza konkrétní nemovitosti",
    icon: FileSearch,
  },
  {
    href: routes.financniPas,
    label: "Finanční pas",
    hint: "Rozpočet a předání partnerovi",
    icon: Layers,
  },
  {
    href: routes.refinanceRadar,
    label: "Radar refinancování",
    hint: "Fixace a srovnání splátek",
    icon: Building2,
  },
] as const;

const STEPS = [
  {
    n: "1",
    title: "Zjistíte limity",
    text: "Orientační úvěr a splátka podle příjmu a aktuálních sazeb.",
  },
  {
    n: "2",
    title: "Porovnáte trhy",
    text: "Vlastnictví, financování a rizika — s datovým statusem.",
  },
  {
    n: "3",
    title: "Uděláte další krok",
    text: "Nástroje, akademie nebo předání licencovanému partnerovi.",
  },
] as const;

/**
 * Spodní bloky homepage — nástroje, jak to funguje, Majetio, akademie, důvěra.
 * Kompaktní, ne dlouhý generický landing.
 */
export function HomePlatformSections() {
  return (
    <>
      <section
        aria-labelledby="home-tools-heading"
        className="border-b border-border bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Hlavní nástroje
          </p>
          <h2
            id="home-tools-heading"
            className="mt-2 font-heading text-2xl font-bold text-text-dark"
          >
            Co zde můžete udělat
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="flex h-full gap-3 rounded-xl border border-border bg-[#f7f8f7] p-4 transition-colors hover:border-deep-teal/40 hover:bg-white"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-deep-teal/10 text-deep-teal">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold text-text-dark">
                        {t.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {t.hint}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="home-how-heading"
        className="border-b border-border bg-[#f7f8f7]"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Jak funguje Hypotéka Jasně
          </p>
          <h2
            id="home-how-heading"
            className="mt-2 font-heading text-2xl font-bold text-text-dark"
          >
            Tři kroky, žádný marketingový mlýn
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-xl border border-border bg-white p-5"
              >
                <span className="font-heading text-2xl font-bold text-muted-gold">
                  {s.n}
                </span>
                <h3 className="mt-2 font-semibold text-text-dark">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="home-ecosystem-heading"
        className="border-b border-border bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
          <div className="rounded-2xl border border-border bg-[#f7f8f7] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Majetio
            </p>
            <h2
              id="home-ecosystem-heading"
              className="mt-2 font-heading text-xl font-bold text-text-dark"
            >
              Od rozpočtu k nemovitosti
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              HypotékaJasně připraví limity a profil. Majetio navazuje vyhledáním a
              hloubkovou analýzou — bez falešných „stovek nemovitostí“.
            </p>
            <Link
              href={routes.oMajetio}
              className="mt-4 inline-flex text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
            >
              O Majetio →
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-[#f7f8f7] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Akademie
            </p>
            <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-bold text-text-dark">
              <BookOpen className="h-5 w-5 text-deep-teal" aria-hidden />
              Pojmy bez žargonu
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              LTV, RPSN, DSTI a cesty podle situace — srozumitelně a s odkazy do
              nástrojů.
            </p>
            <Link
              href={routes.akademie}
              className="mt-4 inline-flex text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
            >
              Vzdělávací centrum →
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-trust-heading"
        className="bg-deep-teal text-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:py-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
              Důvěra a metodika
            </p>
            <h2
              id="home-trust-heading"
              className="mt-2 font-heading text-2xl font-bold"
            >
              Nejsme banka ani poradce
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Každé číslo má status (aktuální data / ověřeno / modelový výpočet).
              Chybějící údaj nevymýšlíme. Individuální zprostředkování dělá
              licencovaný partner.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.metodika}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            >
              <Scale className="h-4 w-4" aria-hidden />
              Metodika
            </Link>
            <Link
              href={routes.duvera}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-muted-gold px-4 text-sm font-semibold text-text-dark hover:bg-muted-gold-light"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Centrum důvěry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
