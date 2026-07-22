import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { t } from "@/lib/i18n/messages";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Hypotéka Jasně — English overview",
  description:
    "Czech mortgage and property decision platform. Human-edited English overview only — we do not publish machine translations of the full site.",
  path: "/en",
  locale: "en",
  alternatePath: { cs: "/", en: "/en" },
});

/**
 * Curated EN hub — not a machine-translated mirror of the Czech site.
 * Organization/WebSite JSON-LD lives in root layout only (no duplicate graph).
 */
export default function EnglishHubPage() {
  const copy = t("en").enHub;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <Breadcrumbs
          items={crumbs({ name: "English", path: "/en" })}
        />

        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Locale · en
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {copy.lead}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {copy.note}
        </p>

        <section className="mt-10" aria-labelledby="en-what-heading">
          <h2 id="en-what-heading" className="font-heading text-xl font-semibold text-text-dark">
            What this platform is
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Information and modelling tools for Czech mortgages and selected
              foreign property markets.
            </li>
            <li>
              Not a bank and not a licensed credit intermediary — see Trust
              Center on the Czech site.
            </li>
            <li>
              Calculators and scores are models, not binding bank offers.
            </li>
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="en-next-heading">
          <h2 id="en-next-heading" className="font-heading text-xl font-semibold text-text-dark">
            Next step
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The full product surface (academy, magazine, readiness wizard) is
            maintained in Czech. English article/academy mirrors will be added
            only with human editing — never bulk MT.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-deep-teal px-5 py-2.5 text-sm font-bold text-white"
          >
            {copy.ctaCs}
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Related:{" "}
            <Link href={routes.duvera} className="text-deep-teal underline">
              Trust & methodology (CS)
            </Link>
            {" · "}
            <Link href={routes.metodika} className="text-deep-teal underline">
              Methodology (CS)
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
