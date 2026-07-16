"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import {
  getGlobalGuideData,
  getGlobalGuideRedFlags,
  type GlobalGuideArticle,
} from "@/lib/global-guide-articles-data";
import { countryConfigs, type CountryId } from "@/lib/calculators";

function GuideArticleDetail({
  article,
  onBack,
}: {
  article: GlobalGuideArticle;
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
        Zpět na přehled průvodce
      </button>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium mb-4">
        <span className="text-emerald-600 font-bold uppercase tracking-wider">
          {article.category}
        </span>
        <span>•</span>
        <span>{article.readTime}</span>
      </div>

      <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
        {article.title}
      </h1>

      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12 shadow-md">
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
      </div>
    </div>
  );
}

function GuideArticleCard({
  article,
  onSelect,
}: {
  article: GlobalGuideArticle;
  onSelect: (article: GlobalGuideArticle) => void;
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
      className="group cursor-pointer bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 z-10">
          {article.category}
        </div>
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed">
          {article.excerpt}
        </p>
        <div className="text-emerald-700 font-bold text-sm flex items-center mt-auto">
          Číst více
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </article>
  );
}

function RedFlagsSection({ countryId }: { countryId: CountryId }) {
  const redFlags = getGlobalGuideRedFlags(countryId);
  if (redFlags.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mt-14">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-amber-700" />
        </div>
        <h3 className="text-xl font-bold text-text-dark">Na co si dát pozor</h3>
      </div>

      <div className="space-y-4">
        {redFlags.map((flag) => (
          <div
            key={flag.id}
            className="flex gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/60 backdrop-blur-sm ring-1 ring-amber-200/60 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-950 mb-1">{flag.title}</p>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                {flag.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GlobalInvestmentGuideProps {
  countryId: CountryId;
}

export function GlobalInvestmentGuide({ countryId }: GlobalInvestmentGuideProps) {
  const [selectedArticle, setSelectedArticle] =
    useState<GlobalGuideArticle | null>(null);

  const countryData = getGlobalGuideData(countryId);

  useEffect(() => {
    setSelectedArticle(null);
  }, [countryId]);

  useEffect(() => {
    if (selectedArticle) {
      document.getElementById("global-investment-guide")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedArticle]);

  if (!countryData || countryData.articles.length === 0) {
    return null;
  }

  const label = countryConfigs[countryId].label;

  return (
    <section
      id="global-investment-guide"
      className="relative py-20 lg:py-28 overflow-hidden scroll-mt-28"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {selectedArticle ? (
          <GuideArticleDetail
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
          />
        ) : (
          <>
            <div className="text-center mb-12">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                {label}
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-gray-900 mt-2 mb-4">
                {countryData.title}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {countryData.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {countryData.articles.map((article) => (
                <GuideArticleCard
                  key={article.id}
                  article={article}
                  onSelect={setSelectedArticle}
                />
              ))}
            </div>

            <RedFlagsSection countryId={countryId} />
          </>
        )}
      </div>
    </section>
  );
}
