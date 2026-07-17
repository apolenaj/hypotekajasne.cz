"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Loader2, Mail } from "lucide-react";
import { submitLead } from "@/lib/leads";
import { routes } from "@/lib/routes";
import {
  articleCategories,
  getArticlesByCategory,
  getFeaturedArticle,
  type Article,
  type ArticleCategory,
} from "@/lib/articles-data";

function ArticleDetail({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center text-emerald-700 font-bold hover:underline transition-all"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Zpět na přehled magazínu
      </button>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium mb-4">
        <span className="text-emerald-600 font-bold">{article.category}</span>
        <span>•</span>
        <span>{article.date}</span>
        <span>•</span>
        <span>{article.readTime}</span>
      </div>

      <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
        {article.title}
      </h1>

      <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-md">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 896px"
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg prose-emerald text-gray-700 max-w-none mb-16">
        <p className="text-xl font-bold mb-8 text-gray-900 leading-relaxed border-l-4 border-emerald-500 pl-6 not-prose">
          {article.excerpt}
        </p>

        <div
          className="article-rich-text"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200 not-prose">
          <p className="text-gray-500 italic text-sm">
            Upozornění: Tento článek slouží jako expertní analýza trhu platná
            ke dni vydání a nepředstavuje závaznou finanční radu pro vaši
            konkrétní životní situaci.
          </p>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Chcete probrat svou investiční strategii?
          </h3>
          <p className="text-emerald-800">
            Naši experti vám pomohou převést teorii z článku do praxe.
          </p>
        </div>
        <Link
          href={routes.kalkulacky.root}
          onClick={onBack}
          className="bg-emerald-900 text-white px-8 py-3 rounded-full font-bold whitespace-nowrap hover:bg-emerald-800 transition-colors shadow-md"
        >
          Spočítat hypotéku
        </Link>
      </div>
    </div>
  );
}

function FeaturedArticleCard({
  article,
  onSelect,
}: {
  article: Article;
  onSelect: (article: Article) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(article)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(article);
        }
      }}
      className="mb-16 group cursor-pointer relative rounded-3xl overflow-hidden shadow-xl border border-gray-100"
    >
      <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-gray-900/50 transition-colors z-10" />
      <Image
        src={article.image}
        alt={article.title}
        width={1200}
        height={500}
        className="w-full h-[420px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
        sizes="(max-width: 768px) 100vw, 1200px"
        priority
      />
      <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full md:w-3/4">
        <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
          {article.category}
        </span>
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {article.title}
        </h2>
        <p className="text-lg text-gray-200 mb-6 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-300 font-medium">
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </article>
  );
}

function ArticleCard({
  article,
  onSelect,
}: {
  article: Article;
  onSelect: (article: Article) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(article)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(article);
        }
      }}
      className="group cursor-pointer flex flex-col"
    >
      <div className="rounded-2xl overflow-hidden mb-5 h-56 relative shadow-sm ring-1 ring-gray-900/5">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800">
          {article.category}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-3">
        <span>{article.date}</span>
        <span>•</span>
        <span>{article.readTime}</span>
      </div>
      <h3 className="font-heading text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-emerald-700 transition-colors">
        {article.title}
      </h3>
      <p className="text-gray-600 line-clamp-2 leading-relaxed">
        {article.excerpt}
      </p>
    </article>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);

    const result = await submitLead({
      name: "Newsletter",
      email: email.trim(),
      source: "newsletter",
      notes: "Přihlášení k newsletteru z magazínu článků",
      metadata: { channel: "articles_newsletter" },
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="bg-emerald-900 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-800 opacity-50 blur-3xl" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-800/80 text-emerald-100 mb-6">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-white mb-4">
          Získejte investiční analýzy přímo do e-mailu
        </h2>
        <p className="text-emerald-100 mb-8 text-lg leading-relaxed">
          Žádný spam. Pouze tvrdá data, tržní trendy a neveřejné příležitosti,
          které čtou profesionálové. Odesíláme 1× měsíčně.
        </p>
        {submitted ? (
          <p className="text-white font-semibold bg-emerald-800/60 rounded-xl px-6 py-4">
            Děkujeme! První analýza je na cestě do vaší schránky.
          </p>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Váš pracovní e-mail"
                className="flex-1 px-6 py-4 rounded-xl border-none focus:ring-4 focus:ring-emerald-500/50 outline-none text-gray-900 font-medium"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-white text-emerald-900 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Odesílám…" : "Odebírat analýzy"}
              </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export function ArticlesView() {
  const [activeCategory, setActiveCategory] = useState<
    ArticleCategory | "Vše"
  >("Vše");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const featuredArticle = getFeaturedArticle();
  const regularArticles = getArticlesByCategory(activeCategory);

  const showFeatured =
    featuredArticle &&
    (activeCategory === "Vše" ||
      activeCategory === featuredArticle.category);

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  useEffect(() => {
    if (selectedArticle) {
      document.getElementById("clanky")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedArticle]);

  return (
    <section
      id="clanky"
      className="relative py-20 lg:py-28 overflow-hidden scroll-mt-28"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/40 to-white" />

      <div className="container relative mx-auto px-4 lg:px-8 max-w-7xl">
        {selectedArticle ? (
          <ArticleDetail article={selectedArticle} onBack={handleBack} />
        ) : (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-deep-teal/10 px-4 py-1.5 text-sm font-semibold text-deep-teal mb-4">
                  <BookOpen className="h-4 w-4" />
                  Investiční magazín
                </div>
                <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                  Analýzy a tržní trendy
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Hloubkové analýzy, trendy na trhu a expertní pohledy na
                  financování nemovitostí.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {articleCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      activeCategory === cat
                        ? "bg-emerald-900 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {showFeatured && featuredArticle && (
              <FeaturedArticleCard
                article={featuredArticle}
                onSelect={handleSelectArticle}
              />
            )}

            {regularArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {regularArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSelect={handleSelectArticle}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground mb-20 py-12">
                V této kategorii zatím nejsou další články.
              </p>
            )}

            <NewsletterSection />
          </>
        )}
      </div>
    </section>
  );
}
