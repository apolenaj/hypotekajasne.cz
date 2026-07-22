"use client";

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Scale, X } from "lucide-react";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { useFocusTrap } from "@/lib/a11y/focus-trap";
import { formatCzechDate } from "@/lib/data/freshness";
import {
  evidencePrimaryUrlLabel,
  formatValidityPeriod,
  type SourceEvidence,
} from "@/lib/sources/source-evidence";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return formatCzechDate(iso);
  } catch {
    return iso;
  }
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-text-dark">{children}</dd>
    </div>
  );
}

/**
 * Claim-level evidence drawer (PROMPT 12).
 * Otevře se kliknutím na status badge (např. Ověřeno).
 */
export function SourceEvidenceDrawer({
  evidence,
  open,
  onOpenChange,
}: {
  evidence: SourceEvidence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(open, panelRef, {
    onEscape: () => onOpenChange(false),
    initialFocusRef: closeRef,
  });

  if (!open || !evidence || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Zavřít evidenci zdroje"
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => onOpenChange(false)}
        tabIndex={-1}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-evidence-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200 motion-reduce:animate-none"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              <Scale className="h-3.5 w-3.5" aria-hidden />
              Evidence tvrzení
            </p>
            <h2
              id="source-evidence-title"
              className="mt-1 font-heading text-lg font-bold text-text-dark"
            >
              Zdroj a ověření
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Preferujeme primární autoritu. Bez ověřené URL nevydáváme status
              Ověřeno.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          <dl>
            <Row label="Tvrzení">{evidence.statement}</Row>
            <Row label="Hodnota">
              {evidence.value ?? (
                <span className="text-muted-foreground">Neuvedeno</span>
              )}
            </Row>
            <Row label="Jurisdikce">{evidence.jurisdictionLabel}</Row>
            <Row label="Zdroj">{evidence.sourceName}</Row>
            <Row label="Konkrétní URL">
              {evidence.sourceUrl ? (
                <a
                  href={evidence.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1 break-all font-medium text-deep-teal underline-offset-2 hover:underline"
                >
                  {evidence.sourceUrl}
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                </a>
              ) : (
                <span className="text-amber-900">
                  {evidencePrimaryUrlLabel(evidence)}
                </span>
              )}
            </Row>
            <Row label="Datum ověření">{fmtDate(evidence.verifiedAt)}</Row>
            <Row label="Platnost">
              {formatValidityPeriod(evidence.validFrom, evidence.validTo)}
            </Row>
            <Row label="Status">
              <div className="flex flex-wrap items-center gap-2">
                <DataStatusBadge status={evidence.dataStatus} size="md" />
                <span className="text-xs text-muted-foreground">
                  {evidence.statusLabel}
                  {evidence.id ? ` · ${evidence.id}` : null}
                </span>
              </div>
            </Row>
            <Row label="Poznámka">
              {evidence.notes ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </Row>
          </dl>
        </div>

        <footer className="shrink-0 border-t border-border px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.zdroje}
              className="inline-flex h-11 min-h-11 items-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
              onClick={() => onOpenChange(false)}
            >
              Registr zdrojů
            </Link>
            <Link
              href={routes.metodika}
              className="inline-flex h-11 min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
              onClick={() => onOpenChange(false)}
            >
              Metodika
            </Link>
          </div>
        </footer>
      </aside>
    </div>,
    document.body
  );
}

/**
 * Klikací status badge — otevírá SourceEvidenceDrawer.
 */
export function SourceEvidenceBadgeButton({
  evidence,
  className,
  size = "sm",
}: {
  evidence: SourceEvidence;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-1",
          className
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Zobrazit evidenci tvrzení"
      >
        <DataStatusBadge
          status={evidence.dataStatus}
          size={size}
          showTitle={false}
        />
        <span className="sr-only"> — otevřít evidenci zdroje</span>
      </button>
      <SourceEvidenceDrawer
        evidence={evidence}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
