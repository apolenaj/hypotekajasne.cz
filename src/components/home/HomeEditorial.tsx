import Image from "next/image";
import Link from "next/link";
import { ARTICLE_METAS, getArticlePath } from "@/lib/magazine";
import { routes } from "@/lib/routes";

const PREFERRED = ["hypoteky", "refinancovani", "investicni-hypoteky", "cr"] as const;

function pickArticles() {
  const sorted = [...ARTICLE_METAS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
  const preferred = sorted.filter((article) =>
    article.clusters.some((cluster) =>
      PREFERRED.includes(cluster as (typeof PREFERRED)[number])
    )
  );
  const picked = preferred.slice(0, 4);
  if (picked.length >= 3) return picked;
  for (const article of sorted) {
    if (picked.some((item) => item.slug === article.slug)) continue;
    picked.push(article);
    if (picked.length === 4) break;
  }
  return picked.slice(0, 4);
}

export function HomeEditorial() {
  const articles = pickArticles();
  return (
    <section aria-labelledby="home-articles-heading" className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="home-articles-heading"
            className="font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Nejnovější články a průvodci
          </h2>
          <Link
            href={routes.clanky}
            className="text-sm font-semibold text-deep-teal hover:underline"
          >
            Zobrazit všechny články →
          </Link>
        </div>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link href={getArticlePath(article.slug)} className="group block">
                <span className="relative block h-40 overflow-hidden rounded-[16px]">
                  <Image
                    src={article.hero.src}
                    alt={article.hero.alt}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="mt-3 block text-xs font-semibold uppercase tracking-wide text-deep-teal">
                  {article.category}
                </span>
                <span className="mt-1 block font-heading text-lg font-bold leading-snug text-text-dark group-hover:text-deep-teal">
                  {article.title}
                </span>
                <span className="mt-2 block text-xs text-gray-500">
                  {article.readingMinutes} min čtení · {article.publishedAt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
