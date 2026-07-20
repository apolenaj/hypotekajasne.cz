"use client";

import { ArrowUpRight } from "lucide-react";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function MajetioPromoSection() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#063d38] via-[#0b5c52] to-[#127a6a] p-8 shadow-2xl shadow-emerald-900/25 sm:p-10 lg:p-14">
          <div className="max-w-2xl text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-emerald-300/40 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-100">
                Majetio
              </span>
              <FeatureStatusBadge status="BETA" />
            </div>
            <h2 className="mt-5 font-heading text-3xl font-black leading-tight sm:text-4xl">
              Od kvalifikace k výběru nemovitosti
            </h2>
            <p className="mt-5 text-base leading-relaxed text-emerald-50/90 sm:text-lg">
              Hypotéka Jasně připraví Finanční pas (rozpočet, účel, profil).
              Majetio slouží k vyhledání a analýze konkrétních nabídek — bez
              marketingových počtů „stovek nemovitostí“, dokud data nejsou
              ověřená.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={routes.navrhNaMiru}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold text-deep-teal"
              >
                Nejdřív připravenost
              </Link>
              <a
                href="https://majetio.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-bold text-white"
              >
                Majetio
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
