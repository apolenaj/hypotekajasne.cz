"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { CTA_CS } from "@/lib/ux/cta";
import { cn } from "@/lib/utils";

/**
 * Progressive disclosure: Simple → Explain → (optional) Advanced.
 * Default closed — detail až po kliknutí.
 */
export function ExplainDisclosure({
  summary = CTA_CS.howCalculated,
  children,
  advanced,
  advancedSummary = CTA_CS.showAdvanced,
  defaultOpen = false,
  className,
}: {
  summary?: string;
  children: ReactNode;
  /** Optional second level under the first disclosure. */
  advanced?: ReactNode;
  advancedSummary?: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const panelId = useId();
  const advancedId = useId();

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-white",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-inset"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{summary}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="space-y-4 border-t border-border px-4 py-4"
        >
          {children}
          {advanced ? (
            <div className="rounded-lg border border-border bg-[#f7f8f7]">
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-inset"
                aria-expanded={advancedOpen}
                aria-controls={advancedId}
              >
                <span>
                  {advancedOpen ? CTA_CS.hideAdvanced : advancedSummary}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    advancedOpen && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>
              {advancedOpen ? (
                <div id={advancedId} className="border-t border-border px-3 py-3">
                  {advanced}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
