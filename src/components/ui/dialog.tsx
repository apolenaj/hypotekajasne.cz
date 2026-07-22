"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/a11y/focus-trap";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Optional; omit to avoid generic financing copy on unrelated dialogs. */
  subtitle?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useFocusTrap(open, panelRef, {
    onEscape: () => onOpenChange(false),
    initialFocusRef: closeRef,
  });

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Zavřít"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        className={cn(
          "absolute left-1/2 top-1/2 flex max-h-[min(90vh,40rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col",
          "rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/10 overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-900/5 bg-slate-50/70 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            {title && (
              <p
                id={titleId}
                className="font-heading text-xl sm:text-2xl font-bold text-text-dark leading-tight break-words"
              >
                {title}
              </p>
            )}
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-gray-900/10 text-muted-foreground hover:text-text-dark hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            aria-label="Zavřít dialog"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 sm:px-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
