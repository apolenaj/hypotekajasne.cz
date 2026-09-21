import type { Metadata } from "next";
import { PracticeHubClient } from "@/components/academy/practice/PracticeHubClient";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PRACTICE_GUIDES, practiceHubPath } from "@/lib/academy/practice";
import { routes } from "@/lib/routes";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { findStaticPageSeo } from "@/lib/seo/pages";

const seo = findStaticPageSeo(routes.hypotekyVPraxi);

export const metadata: Metadata = buildPageMetadata({
  title: seo?.title ?? "Hypotéky v praxi",
  description:
    seo?.description ??
    "Jasné odpovědi na konkrétní hypoteční situace — od první žádosti po refinancování.",
  path: practiceHubPath(),
});

export default function HypotekyVPraxiHubPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs(
              { name: "Akademie", path: routes.akademie },
              { name: "Hypotéky v praxi", path: practiceHubPath() }
            )}
          />
        </div>
      </div>

      <header className="border-b border-border bg-gradient-to-br from-[#f7f8f7] via-white to-[#eef5f2]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-deep-teal">
            Hypoteční akademie
          </p>
          <h1 className="mt-2 max-w-3xl font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            Hypotéce porozumíte. V každé důležité situaci.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Od první žádosti přes výběr nabídky až po refinancování. Jasné
            odpovědi, praktické příklady a výpočty, které vám pomohou udělat
            další krok.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            Výpočty na těchto stránkách jsou orientační. Konkrétní podmínky a
            schválení vždy posuzuje banka podle aktuální metodiky a vašich
            dokladů.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <PracticeHubClient guides={PRACTICE_GUIDES} />
      </div>
    </div>
  );
}
