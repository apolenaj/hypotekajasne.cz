import type { Metadata } from "next";
import Link from "next/link";
import { ACADEMY_LESSONS, getAcademyLessonPath } from "@/lib/academy";
import { AcademyPathsHub } from "@/components/academy/AcademyPathsHub";
import { PRACTICE_GUIDES, practiceGuidePath, practiceHubPath } from "@/lib/academy/practice";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { courseListJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = buildPageMetadata({
  title: "Hypoteční akademie",
  description:
    "Vzdělávací centrum: Hypotéky v praxi i pojmy LTV, RPSN, DSTI, DTI, fixace — s příklady a mini kalkulačkami.",
  path: routes.akademie,
});

export default function AkademieHubPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs({ name: "Akademie", path: routes.akademie })}
          />
        </div>
      </div>
      <JsonLdScript
        data={courseListJsonLd({
          name: "Hypoteční akademie",
          description:
            "Praktické průvodce a lekce hypotečních pojmů s příklady, FAQ a mini kalkulačkami.",
          path: routes.akademie,
          courses: [
            ...PRACTICE_GUIDES.map((g) => ({
              name: g.title,
              path: practiceGuidePath(g.slug),
              description: g.cardBlurb,
            })),
            ...ACADEMY_LESSONS.map((l) => ({
              name: l.title,
              path: getAcademyLessonPath(l.slug),
              description: l.description,
            })),
          ],
        })}
      />
      <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
            Vzdělávací centrum
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Hypoteční akademie
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            Dvě cesty ke stejnému cíli: praktické odpovědi k vaší situaci a
            srozumitelné vysvětlení pojmů, které uslyšíte v bance.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <section
          aria-labelledby="practice-heading"
          className="rounded-2xl border border-deep-teal/25 bg-gradient-to-br from-[#f7f8f7] to-[#eef5f2] p-6 sm:p-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Hypotéky v praxi
          </p>
          <h2
            id="practice-heading"
            className="mt-2 font-heading text-2xl font-bold text-text-dark sm:text-3xl"
          >
            Řešení konkrétních situací
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            První hypotéka, dostupnost, vlastní peníze, příjmy OSVČ, registry,
            RPSN, refinancování, pojištění, rozvod i daně — s příklady a
            výpočty.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {PRACTICE_GUIDES.slice(0, 4).map((g) => (
              <li key={g.slug}>
                <Link
                  href={practiceGuidePath(g.slug)}
                  className="block rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-dark transition hover:border-deep-teal/40"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={practiceHubPath()}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
          >
            Otevřít Hypotéky v praxi
          </Link>
        </section>

        <section aria-labelledby="lessons-heading" className="mt-14">
          <h2
            id="lessons-heading"
            className="font-heading text-2xl font-bold text-text-dark"
          >
            Pojmy a základy
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            LTV, RPSN, fixace, jistina a další lekce — s definicí, příkladem a
            pohledem banky.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACADEMY_LESSONS.map((l) => (
              <li key={l.slug}>
                <Link
                  href={getAcademyLessonPath(l.slug)}
                  className="block h-full rounded-2xl border border-border bg-[#f7f8f7] p-5 transition hover:border-deep-teal/40 hover:bg-white"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                    Lekce
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-bold text-text-dark">
                    {l.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {l.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-sm text-muted-foreground">
          Starší odkaz na Hypoteční akademii přesměrovává sem. FAQ o fungování
          platformy zůstává na stránce{" "}
          <Link href={routes.faq} className="font-medium text-deep-teal hover:underline">
            Časté otázky
          </Link>
          .
        </p>

        <div className="mt-16 border-t border-border pt-12">
          <AcademyPathsHub />
        </div>
      </div>
    </div>
  );
}
