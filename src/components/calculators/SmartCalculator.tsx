"use client";

import { Sparkles } from "lucide-react";
import { InvestmentEnginePanel } from "@/components/calculators/InvestmentEnginePanel";
import { ModelledDomainProvenance } from "@/components/trust/ModelledDomainProvenance";
import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";
import { TooltipProvider } from "@/components/ui/tooltip";

interface SmartCalculatorProps {
  country: CountryId;
}

export function SmartCalculator({ country }: SmartCalculatorProps) {
  const config = countryConfigs[country];

  return (
    <TooltipProvider delay={150}>
      <div className="relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Investiční engine
            </div>
            <h3 className="font-heading text-2xl font-bold text-text-dark lg:text-3xl">
              Investiční kalkulace — {config.label}
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Jednotný výpočetní engine pro všechny trhy: NOI, výnos vloženého
              vlastního kapitálu, DSCR, IRR/XIRR a rozklad peněžního toku.
              Matematika je oddělená od UI. Neuvádíme „ROI z hrubého nájmu“ jako
              výnos vloženého kapitálu.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-gradient-to-br from-deep-teal to-emerald-700 px-5 py-4 text-white shadow-lg shadow-emerald-900/20">
            <p className="text-xs uppercase tracking-wider text-white/70">
              Referenční hrubý výnos (model)
            </p>
            <p className="text-lg font-bold">
              {(config.defaultRentalYield * 100).toFixed(1)} % p.a.
            </p>
            <div className="mt-1">
              <ModelledDomainProvenance
                topic="yields"
                label="Výnos"
                source={`countryConfigs.${country}.defaultRentalYield`}
                notes="Jen výchozí nájem v engine — ne live kotace."
              />
            </div>
          </div>
        </div>

        <InvestmentEnginePanel key={country} country={country} />
      </div>
    </TooltipProvider>
  );
}
