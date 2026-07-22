import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Simple layer of progressive disclosure — one number, one sentence.
 * Details belong in ExplainDisclosure below.
 */
export function SimpleResultHero({
  eyebrow,
  label,
  value,
  hint,
  badge,
  className,
}: {
  eyebrow?: string;
  label: string;
  value: ReactNode;
  hint?: string;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-5 sm:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            {eyebrow}
          </p>
        ) : null}
        {badge}
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold tabular-nums tracking-tight text-deep-teal sm:text-4xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
