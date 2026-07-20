import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Calculator,
  GraduationCap,
  Search,
  Shield,
} from "lucide-react";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { ECOSYSTEM_FEATURES } from "@/lib/majetio";
import { routes } from "@/lib/routes";

const MAJETIO_URL = "https://majetio.cz";

const OWNER_LABEL: Record<string, string> = {
  "hypoteka-jasne": "Hypotéka Jasně",
  majetio: "Majetio",
  shared: "Společné",
};

export function AboutMajetioView() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-deep-teal/10 bg-gradient-to-br from-[#0b3d3a] via-deep-teal to-[#1a6b5f] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #c9a84c 0%, transparent 45%), radial-gradient(circle at 80% 60%, #fff 0%, transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
            Hypotéka Jasně × Majetio
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Finance a nemovitosti — dvě role, jeden tok
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            <strong className="font-semibold text-white">Hypotéka Jasně</strong>{" "}
            pomáhá s financemi a rozhodováním.{" "}
            <strong className="font-semibold text-white">Majetio</strong> slouží
            k vyhledání, analýze a koupi nemovitosti. Spojuje je Finanční pas —
            bez zbytečných osobních údajů a bez vymyšlených počtů nabídek.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex items-center justify-center rounded-lg bg-muted-gold px-6 py-3 text-sm font-bold text-[#0b3d3a] transition-opacity hover:opacity-95"
            >
              Začít Hypoteční připraveností
            </Link>
            <Link
              href={routes.investicniRentgen}
              className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              Investiční rentgen
            </Link>
            <a
              href={MAJETIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Otevřít Majetio
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="font-heading text-2xl font-bold text-text-dark sm:text-3xl">
          Kdo co dělá
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Jedna platforma na finance, druhá na nemovitosti — aby bylo jasné, kde
          jste a co je další krok.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-[#f7f8f7] p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Hypotéka Jasně
            </p>
            <h3 className="mt-2 font-heading text-xl font-bold text-text-dark">
              Finance a rozhodování
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Hypoteční připravenost a orientační limity
              </li>
              <li className="flex gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Finanční pas pro další krok
              </li>
              <li className="flex gap-2">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Edukace, kalkulačky a výběr trhu
              </li>
              <li className="flex gap-2">
                <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Investiční rentgen — náhled i prémiová analýza
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={routes.navrhNaMiru}
                className="text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
              >
                Hypoteční připravenost →
              </Link>
              <Link
                href={routes.financniPas}
                className="text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
              >
                Finanční pas →
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-deep-teal/20 bg-gradient-to-br from-deep-teal to-[#0f6b5f] p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                Majetio
              </p>
              <FeatureStatusBadge status="BETA" className="border-white/20 bg-white/15 text-white" />
            </div>
            <h3 className="mt-2 font-heading text-xl font-bold">
              Vyhledání, analýza a koupě
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-emerald-50">
              <li className="flex gap-2">
                <Search className="mt-0.5 h-4 w-4 shrink-0" />
                Prohlížení nabídek podle rozpočtu (Beta)
              </li>
              <li className="flex gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                Analýza konkrétní nemovitosti
              </li>
              <li className="flex gap-2">
                <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" />
                Podpora při koupi a transakci
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-emerald-100/85">
              Neuvádíme „stovky nemovitostí denně“ ani živé skóre bez ověřených
              dat. Co ještě není hotové, označujeme jako Beta nebo Připravujeme.
            </p>
            <a
              href={MAJETIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white underline-offset-4 hover:underline"
            >
              Přejít na Majetio
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-[#f4f6f5] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-text-dark sm:text-3xl">
            Finanční pas jako most
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Po Hypoteční připravenosti předáme Majetio jen potřebné parametry
            rozpočtu a účelu — bez zbytečných osobních údajů. Majetio pak může
            nabídnout nemovitosti v rámci vašich limitů.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex items-center justify-center rounded-lg bg-deep-teal px-5 py-2.5 text-sm font-bold text-white"
            >
              Zobrazit nemovitosti dle rozpočtu
            </Link>
            <Link
              href={routes.financniPas}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-bold text-text-dark"
            >
              Otevřít Finanční pas
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Nejdřív dokončete připravenost — odtud vede funkční předání do
            Majetio. Samostatný katalog bez rozpočtu:{" "}
            <a
              href={MAJETIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              majetio.cz
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="font-heading text-2xl font-bold text-text-dark sm:text-3xl">
          Stav funkcí
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Dostupné · Beta · Připravujeme — podle skutečného stavu, ne podle
          marketingu.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {ECOSYSTEM_FEATURES.map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-text-dark">{f.name}</p>
                <FeatureStatusBadge status={f.status} />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {f.description}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {OWNER_LABEL[f.owner] ?? f.owner}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-xl border border-border bg-[#f7f8f7] px-4 py-3 text-xs text-muted-foreground">
          Widgety na detailu nemovitosti v Majetio („Mohu si to dovolit?“,
          kalkulace financování) a jednotné přihlášení:{" "}
          <strong className="font-semibold text-text-dark">
            funkce bude dostupná
          </strong>{" "}
          — připravujeme.
        </p>
      </section>

      <section className="bg-deep-teal py-12 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Začněte rozhodováním, pokračujte nemovitostí
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Hypotéka Jasně → Finanční pas → Majetio. Nebo rovnou analýza
            konkrétní nabídky v Investičním rentgenu.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex rounded-lg bg-muted-gold px-6 py-3 text-sm font-bold text-[#0b3d3a]"
            >
              Hypoteční připravenost
            </Link>
            <Link
              href={routes.investicniRentgen}
              className="inline-flex rounded-lg border border-white/35 px-6 py-3 text-sm font-bold text-white"
            >
              Analyzovat nemovitost
            </Link>
            <a
              href={MAJETIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/35 px-6 py-3 text-sm font-bold text-white"
            >
              Majetio
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
