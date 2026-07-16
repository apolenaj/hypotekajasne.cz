"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

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
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2",
          "rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/10 overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-900/5 bg-slate-50/70 px-6 py-5">
          <div>
            {title && (
              <p className="font-heading text-xl sm:text-2xl font-bold text-text-dark leading-tight">
                {title}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Detail financování a praktický postup
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-gray-900/10 text-muted-foreground hover:text-text-dark hover:bg-slate-50 transition-colors"
            aria-label="Zavřít dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>,
    document.body
  );
}

