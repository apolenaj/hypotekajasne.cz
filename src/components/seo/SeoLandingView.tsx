import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { getPerson } from "@/lib/magazine/authors";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  articleJsonLd,
  faqPageJsonLd,
  personJsonLd,
  type JsonLd,
} from "@/lib/seo/json-ld";
import {
  SEO_LANDING_HUB,
  getLandingPath,
  type SeoLanding,
} from "@/lib/seo/landings";
import { formatDate as formatDateLocale } from "@/lib/i18n/format";
import { routes } from "@/lib/routes";

function formatDate(iso: string): string {
  return formatDateLocale(iso, "cs", "long");
}

function LinkList({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-heading text-lg font-bold text-text-dark">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="inline-flex rounded-full border border-deep-teal/30 bg-deep-teal/5 px-3 py-1.5 text-sm font-semibold text-deep-teal"
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SeoLandingView({ landing }: { landing: SeoLanding }) {
  const author = getPerson(landing.authorId);
  const reviewer = landing.reviewerId
    ? getPerson(landing.reviewerId)
    : null;
  const path = getLandingPath(landing.slug);

  const jsonLd: JsonLd[] = [
    articleJsonLd({
      headline: landing.h1,
      description: landing.description,
      path,
      imageUrl: "/opengraph-image",
      datePublished: landing.publishedAt,
      dateModified: landing.updatedAt,
      authorName: author.name,
      ...(reviewer ? { reviewerName: reviewer.name } : {}),
    }),
    personJsonLd({
      name: author.name,
      jobTitle: author.role,
      description: author.bio,
      url: author.url,
    }),
  ];
  if (reviewer) {
    jsonLd.push(
      personJsonLd({
        name: reviewer.name,
        jobTitle: reviewer.role,
        description: reviewer.bio,
        url: reviewer.url,
      })
    );
  }
  if (landing.faqs.length > 0) {
    jsonLd.push(faqPageJsonLd(landing.faqs));
  }

  return (
    <article className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <Breadcrumbs
            items={crumbs(
              { name: "Témata", path: SEO_LANDING_HUB.path },
              { name: landing.h1, path }
            )}
          />
        </div>
      </div>
      <JsonLdScript data={jsonLd} />

      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            Průvodce tématem
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            {landing.h1}
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {landing.lead}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-text-dark">Pro koho:</span>{" "}
            {landing.audience}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Autor: {author.name}
            {reviewer ? <> · Odborná kontrola: {reviewer.name}</> : null}
            <br />
            Publikace {formatDate(landing.publishedAt)} · Aktualizace{" "}
            {formatDate(landing.updatedAt)}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-8">
          {landing.sections.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2
                id={section.id}
                className="font-heading text-xl font-bold text-text-dark"
              >
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 40)}
                  className="mt-3 text-base leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {landing.relatedCountries && landing.relatedCountries.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-heading text-lg font-bold text-text-dark">
              Průvodce podle země
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Plné dossiery — ne duplicate thin SEO stránky.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {landing.relatedCountries.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="block rounded-lg border border-border px-4 py-3 text-sm font-semibold text-deep-teal hover:border-deep-teal/40"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {landing.faqs.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-heading text-lg font-bold text-text-dark">
              Časté otázky
            </h2>
            <dl className="mt-4 space-y-4">
              {landing.faqs.map((f) => (
                <div key={f.question}>
                  <dt className="font-semibold text-text-dark">{f.question}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {f.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-heading text-lg font-bold text-text-dark">
            Zdroje
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {landing.sources.map((s) => (
              <li key={s.label}>
                {s.url ? (
                  <Link href={s.url} className="text-deep-teal underline">
                    {s.label}
                  </Link>
                ) : (
                  s.label
                )}
                {s.note ? (
                  <span className="block text-xs">{s.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <LinkList title="Nástroje" items={landing.relatedTools} />
        <LinkList title="Související články" items={landing.relatedArticles} />
        <LinkList title="Akademie" items={landing.relatedAcademy} />

        <p className="mt-12 rounded-lg border border-border bg-[#f7f8f7] px-4 py-3 text-xs text-muted-foreground">
          Informační obsah Hypotéka Jasně — nejsme banka. Modelové výpočty
          nejsou nabídkou úvěru. Před rozhodnutím ověřte aktuální podmínky u
          odborníka.{" "}
          <Link href={routes.metodika} className="text-deep-teal underline">
            Metodika
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
