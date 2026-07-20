import type { Metadata } from "next";
import Link from "next/link";
import { ACADEMY_LESSONS, getAcademyLessonPath } from "@/lib/academy";
import { AcademyPathsHub } from "@/components/academy/AcademyPathsHub";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { courseListJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = buildPageMetadata({
  title: "Hypoteční akademie",
  description:
    "Learning hub: LTV, RPSN, DSTI, DTI, fixace a další — SSR lekce s definicemi, FAQ a mini kalkulačkami.",
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
            "SSR lekce hypotečních pojmů s příklady, FAQ a mini kalkulačkami.",
          path: routes.akademie,
          courses: ACADEMY_LESSONS.map((l) => ({
            name: l.title,
            path: getAcademyLessonPath(l.slug),
            description: l.description,
          })),
        })}
      />
      <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
            Learning hub
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Hypoteční akademie
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            Každý pojem má vlastní SEO URL. Text je server-rendered —
            „Jednoduše řečeno“, příklad, výpočet, banka/investor, chyba, quiz a
            CTA. Video/audio připravené jako infrastruktura, ne falešné soubory.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACADEMY_LESSONS.map((l) => (
            <li key={l.slug}>
              <Link
                href={getAcademyLessonPath(l.slug)}
                className="block h-full rounded-2xl border border-border bg-[#f7f8f7] p-5 transition hover:border-deep-teal/40 hover:bg-white"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                  /akademie/{l.slug}
                </p>
                <h2 className="mt-2 font-heading text-lg font-bold text-text-dark">
                  {l.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {l.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted-foreground">
          Starší adresa{" "}
          <Link href={routes.hypotecniAkademie} className="underline">
            /hypotecni-akademie
          </Link>{" "}
          přesměrovává sem.
        </p>

        <div className="mt-16 border-t border-border pt-12">
          <AcademyPathsHub />
        </div>
      </div>
    </div>
  );
}
