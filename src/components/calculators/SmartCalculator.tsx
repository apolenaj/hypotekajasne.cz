"use client";

import { Info, Sparkles, TrendingUp } from "lucide-react";
import { AdvancedCalculator } from "@/components/calculators/AdvancedCalculator";
import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SmartCalculatorProps {
  country: CountryId;
}

export function SmartCalculator({ country }: SmartCalculatorProps) {
  const config = countryConfigs[country];
  const roiTooltip =
    "Return on Investment (Návratnost investice): Odhadovaný roční procentuální výnos z pronájmu po odečtení hypotéčních splátek. Nezahrnuje daně, opravy ani provozní náklady.";

  return (
    <TooltipProvider delay={150}>
      <div className="relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Chytrá kalkulačka
            </div>
            <h3 className="font-heading text-2xl lg:text-3xl font-bold text-text-dark mb-2 flex items-center gap-2">
              <span>Pokročilá kalkulačka splátek a ROI</span>
              <Tooltip>
                <TooltipTrigger
                  className="inline-flex items-center"
                  aria-label="Co je ROI?"
                >
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">{roiTooltip}</TooltipContent>
              </Tooltip>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Spočítejte měsíční splátku, odhadovaný příjem z nájmu a cash-on-cash ROI
              pro trh{" "}
              <span className="font-semibold text-deep-teal">{config.label}</span>.
              Výpočet probíhá v reálném čase podle zadaných parametrů.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-deep-teal to-emerald-700 px-5 py-4 text-white shadow-lg shadow-emerald-900/20 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Referenční výnos
                </p>
                <Tooltip>
                  <TooltipTrigger
                    className="inline-flex items-center"
                    aria-label="Co je ROI?"
                  >
                    <Info className="w-4 h-4 text-white/70 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">{roiTooltip}</TooltipContent>
                </Tooltip>
              </div>
              <p className="text-lg font-bold">
                {(config.defaultRentalYield * 100).toFixed(1)} % p.a.
              </p>
            </div>
          </div>
        </div>

        <AdvancedCalculator key={country} country={country} />
      </div>
    </TooltipProvider>
  );
}
