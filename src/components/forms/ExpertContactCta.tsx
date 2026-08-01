"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { ExpertContactDialog } from "@/components/forms/ExpertContactDialog";
import { CTA_CS } from "@/lib/ux/cta";
import { cn } from "@/lib/utils";

type ExpertContactCtaProps = {
  /** compact = jen tlačítko; card = výrazná karta s copy */
  variant?: "card" | "button";
  contextNote?: string;
  metadata?: Record<string, unknown>;
  className?: string;
};

export function ExpertContactCta({
  variant = "card",
  contextNote,
  metadata,
  className,
}: ExpertContactCtaProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "card" ? (
        <div
          className={cn(
            "rounded-2xl border border-emerald-800/20 bg-gradient-to-br from-emerald-900 to-deep-teal p-4 text-white shadow-sm sm:p-5",
            className
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
            Expert na míru
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-50/95">
            {CTA_CS.expertContactLead}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900 sm:w-auto"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            {CTA_CS.expertContact}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-sm font-bold text-white transition hover:bg-emerald-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto",
            className
          )}
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
          {CTA_CS.expertContact}
        </button>
      )}

      <ExpertContactDialog
        open={open}
        onOpenChange={setOpen}
        contextNote={contextNote}
        metadata={metadata}
      />
    </>
  );
}
