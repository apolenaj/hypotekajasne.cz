import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  Crosshair,
  Globe2,
  GraduationCap,
  Handshake,
  Shield,
} from "lucide-react";
import { routes } from "@/lib/routes";

const MAJETIO_URL = "https://majetio.cz";

const features = [
  {
    icon: Crosshair,
    title: "Konkrétní příležitosti",
    desc: "Nehledáte naslepo. Na Majetio vybíráme jen ty nemovitosti, které dávají matematický a investiční smysl.",
  },
  {
    icon: BarChart3,
    title: "Investiční skóre 0–100",
    desc: "Každá nabídka prochází naším Deal Analyzerem. Rovnou vidíte naše hodnocení ceny, výnosu a lokality.",
  },
  {
    icon: Shield,
    title: "Tvrdá data, žádné iluze",
    desc: "Ukážeme vám reálný cash-flow, náklady na správu, daně a skutečnou návratnost. Nic nezatajujeme.",
  },
] as const;

const jasneItems = [
  { icon: Calculator, text: "Výpočet úvěruschopnosti" },
  { icon: Globe2, text: "Srovnání trhů" },
  { icon: GraduationCap, text: "Akademie a slovník pojmů" },
  { icon: Handshake, text: "Zajištění hypotéky" },
] as const;

const majetioItems = [
  { icon: Building2, text: "Katalog prověřených nemovitostí" },
  { icon: Crosshair, text: "Off-plan developerské projekty" },
  { icon: BarChart3, text: "Skóring nabídek" },
  { icon: BookOpen, text: "Kontakt na lokální makléře" },
] as const;

export function AboutMajetioView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-[#063d38] via-[#0b5c52] to-[#127a6a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-24 lg:py-28">
          <span className="inline-flex rounded-full border border-emerald-300/40 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-sm">
            Sesterský projekt
          </span>
          <h1 className="mt-6 font-heading text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Hypotéka Jasně &amp; Majetio.cz: Váš kompletní realitní ekosystém
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-emerald-50/90 sm:text-xl">
            Zatímco zde vás naučíme, jak investovat a zajistíme vám financování,
            na portálu Majetio.cz pro vás denně analyzujeme stovky konkrétních
            nemovitostí.
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-black text-gray-900 sm:text-3xl">
            Co umí Majetio.cz
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tři vrstvy, které oddělují reklamu od investiční práce s daty.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-deep-teal text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Role split */}
      <section className="bg-emerald-50/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-black text-gray-900 sm:text-3xl">
              Jak si platformy dělí práci
            </h2>
            <p className="mt-3 text-muted-foreground">
              Jedna vás připraví a zafinancuje. Druhá vám ukáže konkrétní deal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-900/5">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Hypotéka Jasně
              </p>
              <h3 className="mt-2 text-xl font-black text-gray-900">
                Co děláme zde
              </h3>
              <ul className="mt-6 space-y-4">
                {jasneItems.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 text-sm text-gray-700 sm:text-base"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
              <Link
                href={routes.investicniPas}
                className="mt-8 inline-flex text-sm font-bold text-deep-teal hover:underline"
              >
                Začít Investičním pasem →
              </Link>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-deep-teal to-[#0f6b5f] p-8 text-white shadow-xl shadow-emerald-900/20">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                Majetio.cz
              </p>
              <h3 className="mt-2 text-xl font-black">Co najdete tam</h3>
              <ul className="mt-6 space-y-4">
                {majetioItems.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 text-sm text-emerald-50 sm:text-base"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
              <a
                href={MAJETIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white hover:underline"
              >
                Otevřít Majetio.cz
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-24">
        <h2 className="font-heading text-3xl font-black text-gray-900 sm:text-4xl">
          Jste připraveni najít svou vysněnou nemovitost?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Projděte katalog s investičním skóre a vraťte se sem pro financování
          a expertní vedení transakce.
        </p>
        <a
          href={MAJETIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-emerald-900 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-800"
        >
          Přejít na portál Majetio.cz
          <ArrowUpRight className="h-5 w-5" />
        </a>
      </section>
    </div>
  );
}
