"use client";

import {
  BarChart3,
  Building2,
  PiggyBank,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { getBuyVsRentDeepAnalysis } from "@/lib/buy-vs-rent-data";
import {
  DEFAULT_THUMB_RULE,
  type DeepAnalysisIcon,
} from "@/lib/buy-vs-rent-deep-analysis";
import type { CountryId } from "@/lib/calculators";

const iconMap: Record<DeepAnalysisIcon, LucideIcon> = {
  PiggyBank,
  TrendingUp,
  ShieldAlert,
  Building: Building2,
};

interface ExpertAnalysisArticleProps {
  countryId: CountryId;
}

export function ExpertAnalysisArticle({ countryId }: ExpertAnalysisArticleProps) {
  const data = getBuyVsRentDeepAnalysis(countryId);

  return (
    <article className="mt-12 bg-white border-t border-gray-200 pt-12">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
          <BarChart3 className="w-4 h-4" />
          Hloubková analýza expertů
        </div>

        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
          {data.title}
        </h2>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">{data.intro}</p>

        <div className="space-y-10">
          {data.sections.map((section, idx) => {
            const Icon = iconMap[section.icon];

            return (
              <div
                key={section.title}
                className="flex flex-col md:flex-row gap-5"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xl border border-emerald-100">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon
                      className="h-5 w-5 text-emerald-700 shrink-0"
                      aria-hidden
                    />
                    <h3 className="text-xl font-bold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-justify">
                    {section.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-2">
            Pravidlo palce pro investory
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {data.thumbRule ?? DEFAULT_THUMB_RULE}
          </p>
        </div>
      </div>
    </article>
  );
}
