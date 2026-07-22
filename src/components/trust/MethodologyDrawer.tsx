"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X } from "lucide-react";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { useFocusTrap } from "@/lib/a11y/focus-trap";
import { METHODOLOGY_BLURBS, type MethodologyTopic } from "@/lib/data/provenance";
import { statusBadgeLabel, statusDescription } from "@/lib/data/display";
import { PUBLIC_STATUS_ORDER } from "@/lib/data/public-methodology";
import type { DataStatus } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(open, panelRef, {
    onEscape: () => setOpen(false),
    initialFocusRef: closeRef,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-deep-teal transition-colors hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
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
              tabIndex={-1}
            />
            <aside
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Metodika dat"
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200 motion-reduce:animate-none"
            >
              <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="font-heading text-lg font-bold text-text-dark">
                    Metodika dat
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    LIVE · VERIFIED · MODEL · NEEDS UPDATE · PARTNER OFFER
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                  aria-label="Zavřít"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </header>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 text-sm">
                <section>
                  <h3 className="font-semibold text-text-dark">Statusy</h3>
                  <ul className="mt-3 space-y-2">
                    {PUBLIC_STATUS_ORDER.map((s: DataStatus) => (
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
                    Čísla označená jako MODEL jsou orientační. Individuální
                    sazbu, RPSN a schválení určuje banka. LIVE sazby bereme z
                    veřejných bankovních zdrojů — stále nejde o závaznou
                    smlouvu.
                  </p>
                </section>
              </div>

              <footer className="border-t border-border px-5 py-4">
                <Link
                  href={routes.metodika}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Otevřít stránku Metodika →
                </Link>
              </footer>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
