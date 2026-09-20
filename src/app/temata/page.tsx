import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { getStaticPageSeo } from "@/lib/seo/pages";
import {
  SEO_LANDING_HUB,
  SEO_LANDINGS,
  getLandingPath,
} from "@/lib/seo/landings";
import { formatDate } from "@/lib/i18n/format";
import { scenarioRoutes } from "@/lib/scenarios/sources";

export const metadata = getStaticPageSeo(SEO_LANDING_HUB.path);

const EXTRA_SCENARIOS = [
  {
    href: scenarioRoutes.companyTopic,
    h1: "Hypotéka na firmu",
    lead: "Financování nemovitosti přes s.r.o. a další firmy — odděleně od hypotéky OSVČ.",
    updatedAt: "2026-09-20",
  },
  {
    href: scenarioRoutes.rentTopic,
    h1: "Budoucí příjem z nájmu",
    lead: "Jak může plánovaný nebo existující nájem vstoupit do posouzení.",
    updatedAt: "2026-09-20",
  },
  {
    href: scenarioRoutes.constructionTopic,
    h1: "Výstavba a novostavba",
    lead: "Od pozemku a projektu po čerpání a dokončení.",
    updatedAt: "2026-09-20",
  },
] as const;

export default function TemataHubPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <Breadcrumbs
            items={crumbs({ name: "Témata", path: SEO_LANDING_HUB.path })}
          />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Průvodce
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
          Témata hypoték
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Kurátorované průvodce s autorem, datem aktualizace a zdroji. Země mají
          jeden souvislý profil v průvodci investora.
        </p>

        <ul className="mt-10 space-y-4">
          {EXTRA_SCENARIOS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-xl border border-deep-teal/25 bg-[#f7f8f7] px-5 py-4 transition-colors hover:border-deep-teal/50"
              >
                <h2 className="font-heading text-lg font-semibold text-text-dark">
                  {l.h1}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{l.lead}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Aktualizace {formatDate(l.updatedAt, "cs", "long")}
                </p>
              </Link>
            </li>
          ))}
          {SEO_LANDINGS.map((l) => (
            <li key={l.slug}>
              <Link
                href={getLandingPath(l.slug)}
                className="block rounded-xl border border-border px-5 py-4 transition-colors hover:border-deep-teal/40"
              >
                <h2 className="font-heading text-lg font-semibold text-text-dark">
                  {l.h1}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{l.lead}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Aktualizace {formatDate(l.updatedAt, "cs", "long")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
