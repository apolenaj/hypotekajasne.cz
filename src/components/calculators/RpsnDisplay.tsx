"use client";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const RPSN_TOOLTIP =
  "RPSN (Roční procentní sazba nákladů) ukazuje celkové náklady na úvěr za jeden rok. Zahrnuje nejen samotný úrok, ale i všechny související poplatky (za odhad nemovitosti, zpracování úvěru, vedení účtu atd.). Číslo je orientační a přesná hodnota závisí na finální výši úvěru.";

type RpsnDisplayProps = {
  rpsn: number | null | undefined;
  className?: string;
  /** Menší typografie v úzkých kartách nabídek */
  compact?: boolean;
};

export function RpsnDisplay({
  rpsn,
  className,
  compact = false,
}: RpsnDisplayProps) {
  if (rpsn == null || !Number.isFinite(rpsn)) {
    return (
      <div
        className={cn(
          "text-gray-500",
          compact ? "text-[11px] leading-snug" : "text-sm",
          className
        )}
      >
        RPSN: Na vyžádání
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-gray-500",
        compact ? "text-[11px] leading-snug" : "text-sm",
        className
      )}
    >
      <span className="min-w-0">
        RPSN: {rpsn.toFixed(2)}&nbsp;%
      </span>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal/30"
          aria-label="Co je RPSN?"
        >
          <HelpCircle className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] bg-gray-900 px-3.5 py-2.5 text-left text-xs leading-relaxed text-white shadow-lg"
        >
          {RPSN_TOOLTIP}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
