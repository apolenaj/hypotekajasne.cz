"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Landmark,
  Shield,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";
import {
  getPathMarketDetails,
  getRentgenHref,
  investorPaths,
  pathDefaultCities,
  type InvestorPath,
} from "@/lib/find-my-path";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const iconMap = {
  capital: Landmark,
  yield: TrendingUp,
  risk: Shield,
  sea: Waves,
} as const;

function PathCard({
  path,
  selected,
  onSelect,
}: {
  path: InvestorPath;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = iconMap[path.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl border bg-white p-7 text-left shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/30"
          : "border-gray-200 hover:border-emerald-300"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          path.accent
        )}
      />
      <div className="relative">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-deep-teal text-white shadow-md transition group-hover:scale-105">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="font-heading text-xl font-black text-gray-900 md:text-2xl">
          {path.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {path.desc}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {path.markets.map((market) => (
            <span
              key={market}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-bold",
                path.tagClass
              )}
            >
              {market}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

function PathDetailPanel({
  path,
  onClose,
}: {
  path: InvestorPath;
  onClose: () => void;
}) {
  return (
    <div
      id="najdi-mi-cestu-detail"
      className="mt-10 scroll-mt-28 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-900/5"
    >
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-deep-teal to-[#0f5c56] px-6 py-5 text-white sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
            Vybraná cesta
          </p>
          <h3 className="mt-1 font-heading text-2xl font-black">{path.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">{path.desc}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          aria-label="Zavřít detail"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
        {path.markets.map((marketName) => {
          const detail = getPathMarketDetails(marketName);
          const city = pathDefaultCities[marketName];
          return (
            <div
              key={marketName}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/80"
            >
              <div className="relative h-36 bg-deep-teal">
                {detail?.image ? (
                  <img
                    src={detail.image}
                    alt={marketName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-900">{marketName}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {detail?.desc ?? "Detail trhu v průvodci investora."}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {detail?.slug ? (
                    <Link
                      href={`${routes.pruvodceInvestora}/${detail.slug}`}
                      className="text-sm font-semibold text-deep-teal hover:underline"
                    >
                      Průvodce trhem
                    </Link>
                  ) : null}
                  <Link
                    href={getRentgenHref(marketName, city)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    Investiční rentgen 360°
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 bg-emerald-50/50 px-6 py-4 sm:px-8">
        <p className="text-sm text-emerald-900">
          Tip: Rentgen otevřeš s předvyplněnou zemí z této cesty — rovnou spočítej
          cash-flow, sněhovou kouli i S&P 500.
        </p>
      </div>
    </div>
  );
}

export function FindMyPathView() {
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const activePath =
    investorPaths.find((p) => p.id === activePathId) ?? null;

  const handleSelect = (path: InvestorPath) => {
    setActivePathId(path.id);
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section
      id="najdi-mi-cestu"
      className="relative overflow-hidden py-20 lg:py-28"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50" />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-emerald-700">
            Najdi mi cestu
          </span>
          <h2 className="font-heading text-3xl font-bold text-text-dark lg:text-5xl">
            Nevíte, kam investovat? Začněte cílem.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Vyberte situaci, která vás vystihuje — ukážeme trhy a rovnou vám
            otevřeme Investiční rentgen s předvyplněnou zemí.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {investorPaths.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              selected={activePathId === path.id}
              onSelect={() => handleSelect(path)}
            />
          ))}
        </div>

        <div ref={detailRef}>
          {activePath ? (
            <PathDetailPanel
              path={activePath}
              onClose={() => setActivePathId(null)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
