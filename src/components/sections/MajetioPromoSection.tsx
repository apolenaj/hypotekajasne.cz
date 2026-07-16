"use client";

import { ArrowUpRight, BarChart3, Gauge, ShieldCheck } from "lucide-react";

export function MajetioPromoSection() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#063d38] via-[#0b5c52] to-[#127a6a] p-8 shadow-2xl shadow-emerald-900/25 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="text-white">
              <span className="inline-flex rounded-full border border-emerald-300/40 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-sm">
                Sesterský projekt
              </span>
              <h2 className="mt-5 font-heading text-3xl font-black leading-tight sm:text-4xl lg:text-[2.6rem]">
                Hledáte už konkrétní nemovitost s investičním skóre? Objevte
                Majetio.cz
              </h2>
              <p className="mt-5 text-base leading-relaxed text-emerald-50/90 sm:text-lg">
                Hypotéka Jasně vám ukáže cestu, zajistí financování a provede
                vás celým procesem. Pokud ale hledáte konkrétní investiční
                příležitosti, od toho je tu náš partnerský portál Majetio.cz.
              </p>
              <p className="mt-4 text-base leading-relaxed text-emerald-50/90 sm:text-lg">
                Na Majetio najdete prověřené nemovitosti ze všech 8 trhů, u
                kterých náš algoritmus rovnou analyzoval výnos, rizika a udělil
                jim investiční skóre 0–100. Žádné skryté háčky, jen tvrdá data.
              </p>
              <a
                href="https://majetio.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-deep-teal shadow-lg transition hover:bg-emerald-50"
              >
                Přejít na portál Majetio.cz
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-emerald-400/10 blur-2xl" />
              <div className="relative grid gap-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                        <Gauge className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/80">
                          Investiční skóre
                        </p>
                        <p className="text-sm font-medium text-white/90">
                          Algoritmické hodnocení 0–100
                        </p>
                      </div>
                    </div>
                    <p className="font-heading text-4xl font-black text-white">
                      87
                    </p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/20">
                    <div className="h-full w-[87%] rounded-full bg-emerald-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                    <BarChart3 className="mb-3 h-5 w-5 text-emerald-200" />
                    <p className="text-xs text-emerald-100/80">Čistý výnos</p>
                    <p className="mt-1 text-xl font-black text-white">9.4 %</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                    <ShieldCheck className="mb-3 h-5 w-5 text-emerald-200" />
                    <p className="text-xs text-emerald-100/80">Rizikový index</p>
                    <p className="mt-1 text-xl font-black text-white">Nízký</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-white/25 bg-black/15 px-4 py-3 text-center text-xs font-medium text-emerald-100/85 backdrop-blur-sm">
                  Ukázka analytické vrstvy Majetio — skóre, výnos a rizika na
                  jednom místě
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
