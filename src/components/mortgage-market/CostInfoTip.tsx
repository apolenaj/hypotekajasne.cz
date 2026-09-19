"use client";

import type { CSSProperties, ReactNode } from "react";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CostInfoTipProps = {
  label: string;
  text: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function CostInfoTip({
  label,
  text,
  children,
  className,
  style,
}: CostInfoTipProps) {
  const iconOnly = children == null;

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        closeOnClick={false}
        aria-label={label}
        style={style}
        className={cn(
          iconOnly
            ? "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-deep-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal"
            : "block h-full min-w-0 border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-deep-teal",
          className
        )}
      >
        {children ?? <Info className="size-3.5" strokeWidth={2} aria-hidden />}
      </TooltipTrigger>
      <TooltipContent className="max-w-[18rem] px-3 py-2 text-left text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
