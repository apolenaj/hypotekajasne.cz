"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X } from "lucide-react";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { METHODOLOGY_BLURBS, type MethodologyTopic } from "@/lib/data/provenance";
import { statusBadgeLabel, statusDescription } from "@/lib/data/display";
import type { DataStatus } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const STATUS_ORDER: DataStatus[] = [
  "LIVE",
  "VERIFIED",
  "MODELLED",
  "PARTNER_QUOTE",
  "STALE",
];

type MethodologyDrawerProps = {
  topic?: MethodologyTopic;
  triggerLabel?: string;
  className?: string;
};

export function MethodologyDrawer({
  topic = "general",
  triggerLabel = "Metodika",
  className,
}: MethodologyDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-deep-teal transition-colors hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
          className
        )}
      >
        <BookOpen className="h-3.5 w-3.5" aria-hidden />
        {triggerLabel}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[70]">
            <button
              type="button"
              aria-label="Zavřít metodiku"
              className="absolute inset-0 bg-slate-950/40"
              onClick={() => setOpen(false)}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Metodika dat"
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            >
              <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="font-heading text-lg font-bold text-text-dark">
                    Metodika dat
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Model vs skutečná nabídka — transparentní platforma
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-text-dark"
                  aria-label="Zavřít"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 text-sm">
                <section>
                  <h3 className="font-semibold text-text-dark">Statusy</h3>
                  <ul className="mt-3 space-y-2">
                    {STATUS_ORDER.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <DataStatusBadge status={s} className="mt-0.5 shrink-0" />
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          <span className="font-medium text-text-dark">
                            {statusBadgeLabel(s)}.
                          </span>{" "}
                          {statusDescription(s)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-text-dark">
                    K tomuto údaji
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {METHODOLOGY_BLURBS[topic]}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-text-dark">
                    Model ≠ nabídka banky
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Čísla se statusem MODEL jsou orientační. Individuální sazbu,
                    RPSN a schválení určuje banka. LIVE sazby jsou veřejné
                    lístky / scrapované hodnoty — stále ne závazná smlouva.
                  </p>
                </section>
              </div>

              <footer className="border-t border-border px-5 py-4">
                <Link
                  href={routes.metodika}
                  className="inline-flex text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Otevřít veřejnou stránku /metodika →
                </Link>
              </footer>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
