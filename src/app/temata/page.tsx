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

export const metadata = getStaticPageSeo(SEO_LANDING_HUB.path);

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
          SEO architektura
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
          Témata hypoték
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Kurátorované průvodce s autorem, aktualizací a zdroji. Nevytváříme
          stovky thin programmatic stránek — země mají jeden kvalitní dossier
          v průvodci investora.
        </p>

        <ul className="mt-10 space-y-4">
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
