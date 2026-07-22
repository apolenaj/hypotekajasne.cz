import Link from "next/link";
import { MagazineNewsletterCta } from "@/components/magazine/MagazineNewsletterCta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import {
  getNextArticle,
  getPerson,
  getRelatedArticles,
  getArticlePath,
  type MagazineArticle,
} from "@/lib/magazine";
import { routes } from "@/lib/routes";
import { getClusterLabel } from "@/lib/magazine/clusters";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  articleJsonLd,
  personJsonLd,
  type JsonLd,
} from "@/lib/seo/json-ld";
import { formatDate as formatDateLocale } from "@/lib/i18n/format";
import { MAGAZINE_UI_CS } from "@/lib/i18n/ui-cs";

function formatDate(iso: string): string {
  return formatDateLocale(iso, "cs", "long");
}

function PersonBox({
  title,
  personId,
}: {
  title: string;
  personId: string;
}) {
  const p = getPerson(personId);
  return (
    <div className="rounded-xl border border-border bg-[#f7f8f7] p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-deep-teal">
        {title}
      </p>
      <p className="mt-1 font-semibold text-text-dark">{p.name}</p>
      <p className="text-xs text-muted-foreground">{p.role}</p>
      <p className="mt-2 text-sm text-muted-foreground">{p.bio}</p>
      {p.credentials ? (
        <p className="mt-1 text-xs text-muted-foreground">{p.credentials}</p>
      ) : null}
    </div>
  );
}

export function MagazineArticleView({ article }: { article: MagazineArticle }) {
  const author = getPerson(article.authorId);
  const reviewer = article.reviewerId
    ? getPerson(article.reviewerId)
    : null;
  const toc = article.body.filter(
    (b): b is Extract<typeof b, { type: "h2" }> => b.type === "h2"
  );
  const related = getRelatedArticles(article);
  const next = getNextArticle(article.slug);
  const path = getArticlePath(article.slug);

  const jsonLd: JsonLd[] = [
    articleJsonLd({
      headline: article.title,
      description: article.description,
      path,
      imageUrl: article.hero.src,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
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

  return (
    <article className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <Breadcrumbs
            items={crumbs(
              { name: "Magazín", path: routes.clanky },
              { name: article.title, path }
            )}
          />
        </div>
      </div>
      <JsonLdScript data={jsonLd} />

      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            {article.category}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {article.description}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {MAGAZINE_UI_CS.author}: {author.name}
            {reviewer ? (
              <>
                {" "}
                · {MAGAZINE_UI_CS.expertReview}: {reviewer.name}
              </>
            ) : null}
            <br />
            {MAGAZINE_UI_CS.published} {formatDate(article.publishedAt)} ·{" "}
            {MAGAZINE_UI_CS.updated} {formatDate(article.updatedAt)} ·{" "}
            {MAGAZINE_UI_CS.factCheck} {formatDate(article.factCheckedAt)} ·{" "}
            {article.readingMinutes} {MAGAZINE_UI_CS.readingMinutes}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.clusters.map((c) => (
              <Link
                key={c}
                href={`${routes.clanky}?cluster=${c}`}
                className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:border-deep-teal/40"
              >
                {getClusterLabel(c)}
              </Link>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.hero.src}
          alt={article.hero.alt}
          width={1200}
          height={630}
          className="mx-auto max-h-[420px] w-full max-w-5xl object-cover"
        />
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_240px] lg:px-8">
        <div>
          <div className="prose-magazine space-y-4 text-base leading-relaxed text-text-dark">
            {article.body.map((block, i) => {
              if (block.type === "p") {
                return (
                  <p key={i} className="text-muted-foreground">
                    {block.text}
                  </p>
                );
              }
              if (block.type === "h2") {
                return (
                  <h2
                    key={block.id}
                    id={block.id}
                    className="scroll-mt-24 pt-4 font-heading text-xl font-bold text-text-dark"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "ul") {
                return (
                  <ul
                    key={i}
                    className="list-disc space-y-2 pl-5 text-muted-foreground"
                  >
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={i}
                  className={
                    block.tone === "warn"
                      ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                      : "rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
                  }
                >
                  {block.text}
                </p>
              );
            })}
          </div>

          <section className="mt-12 border-t border-border pt-8">
            <h2 className="font-heading text-lg font-bold text-text-dark">
              {MAGAZINE_UI_CS.sources}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {article.sources.map((s) => (
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

          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            <PersonBox
              title={MAGAZINE_UI_CS.author}
              personId={article.authorId}
            />
            {article.reviewerId ? (
              <PersonBox
                title={MAGAZINE_UI_CS.expertReview}
                personId={article.reviewerId}
              />
            ) : null}
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-lg font-bold text-text-dark">
              {MAGAZINE_UI_CS.relatedCalculators}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {article.relatedTools.map((t) => (
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

          {related.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-heading text-lg font-bold text-text-dark">
                {MAGAZINE_UI_CS.relatedArticles}
              </h2>
              <ul className="mt-3 space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={getArticlePath(r.slug)}
                      className="font-semibold text-deep-teal hover:underline"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {next && next.slug !== article.slug ? (
            <section className="mt-10 rounded-xl border border-border p-5">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {MAGAZINE_UI_CS.nextArticle}
              </p>
              <Link
                href={getArticlePath(next.slug)}
                className="mt-1 block font-heading text-lg font-bold text-deep-teal hover:underline"
              >
                {next.title} →
              </Link>
            </section>
          ) : null}

          <div className="mt-12">
            <MagazineNewsletterCta />
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {MAGAZINE_UI_CS.contents}
            </p>
            <nav className="mt-2 space-y-1 text-sm">
              {toc.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className="block text-muted-foreground hover:text-deep-teal"
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {MAGAZINE_UI_CS.topics}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {article.financialTopics.map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
