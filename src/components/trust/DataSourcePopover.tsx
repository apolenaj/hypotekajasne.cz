"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { ConfidenceIndicator } from "@/components/trust/ConfidenceIndicator";
import {
  formatCzechDate,
  formatCzechDateTime,
  resolveEffectiveStatus,
} from "@/lib/data/freshness";
import { statusDescription } from "@/lib/data/display";
import type { ProvenanceFields } from "@/lib/data/provenance";
import {
  METHODOLOGY_BLURBS,
  type MethodologyTopic,
} from "@/lib/data/provenance";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type DataSourcePopoverProps = {
  record: ProvenanceFields;
  methodologyTopic?: MethodologyTopic;
  label?: string;
  className?: string;
  children?: React.ReactNode;
};

export function DataSourcePopover({
  record,
  methodologyTopic = "general",
  label = "Zdroj",
  className,
  children,
}: DataSourcePopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const freshness = resolveEffectiveStatus(record);
  const status = freshness.effectiveStatus;

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 320;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - width / 2),
      window.innerWidth - width - 12
    );
    setPos({ top: Math.min(rect.bottom + 8, window.innerHeight - 24), left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? titleId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-deep-teal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-1"
      >
        {children ?? (
          <>
            <Info className="h-3.5 w-3.5" aria-hidden />
            {label}
          </>
        )}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={titleId}
            role="dialog"
            aria-label="Původ dat"
            style={{ top: pos.top, left: pos.left, width: 320 }}
            className="fixed z-[60] max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-border bg-white p-4 shadow-xl shadow-slate-900/10"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-text-dark">
                Původ dat
              </p>
              <DataStatusBadge status={status} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {statusDescription(status)}
            </p>

            <dl className="mt-3 space-y-2.5 text-xs">
              <div>
                <dt className="text-muted-foreground">Zdroj</dt>
                <dd className="font-medium text-text-dark">
                  {record.source}
                  {record.sourceUrl ? (
                    <>
                      {" · "}
                      <a
                        href={record.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-deep-teal underline-offset-2 hover:underline"
                      >
                        Otevřít
                      </a>
                    </>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Poslední načtení</dt>
                <dd className="tabular-nums font-medium text-text-dark">
                  {formatCzechDateTime(record.lastFetchedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Poslední manuální ověření
                </dt>
                <dd className="tabular-nums font-medium text-text-dark">
                  {formatCzechDate(record.lastVerifiedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Metodika</dt>
                <dd className="leading-relaxed text-text-dark">
                  {METHODOLOGY_BLURBS[methodologyTopic]}
                </dd>
              </div>
              {(record.notes || freshness.isStaleByAge) && (
                <div>
                  <dt className="text-muted-foreground">Omezení</dt>
                  <dd className="leading-relaxed text-text-dark">
                    {freshness.isStaleByAge
                      ? "Překročen freshness threshold — status automaticky STALE. "
                      : null}
                    {record.notes}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-3 border-t border-border pt-3">
              <ConfidenceIndicator
                confidence={record.confidence}
                status={status}
              />
            </div>

            <Link
              href={routes.metodika}
              className="mt-3 inline-flex text-xs font-semibold text-deep-teal underline-offset-2 hover:underline"
              onClick={() => setOpen(false)}
            >
              Celá metodika →
            </Link>
          </div>,
          document.body
        )}
    </span>
  );
}
