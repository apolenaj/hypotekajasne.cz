"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  /** Auto-dismiss ms; 0 = stay until closed */
  durationMs?: number;
  className?: string;
};

/** Jednoduchý success toast bez externí knihovny. */
export function Toast({
  open,
  onClose,
  message,
  durationMs = 4500,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!open || durationMs <= 0) return;
    const id = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(id);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-lg ring-1 ring-emerald-900/5",
        "animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none",
        className
      )}
    >
      <CheckCircle2
        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
        aria-hidden
      />
      <p className="flex-1 text-sm font-medium leading-snug text-text-dark">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-slate-50 hover:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
        aria-label="Zavřít oznámení"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
