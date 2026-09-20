"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import {
  formatDigitalRentgenPrice,
  rentgenPrimaryCtaLabel,
} from "@/lib/property-rentgen/pricing";

/** Dismissible sticky CTA for mobile — only when checkout is commercially live. */
export function RentgenStickyMobileCta({ live }: { live: boolean }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!live) return;
    try {
      if (sessionStorage.getItem("hj-rentgen-sticky-dismissed") === "1") {
        setHidden(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setHidden(false);
  }, [live]);

  if (!live || hidden) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Rychlá objednávka Investičního rentgenu"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-dark">
            Investiční rentgen
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDigitalRentgenPrice()} · jednorázově
          </p>
        </div>
        <Link
          href={`${routes.investicniRentgen}?balicek=999#premium-objednavka`}
          className="shrink-0 rounded-xl bg-muted-gold px-3 py-2.5 text-xs font-bold text-text-dark"
        >
          Získat Rentgen
        </Link>
        <button
          type="button"
          aria-label="Skrýt lištu"
          className="shrink-0 rounded-lg px-2 py-2 text-lg leading-none text-muted-foreground"
          onClick={() => {
            try {
              sessionStorage.setItem("hj-rentgen-sticky-dismissed", "1");
            } catch {
              /* ignore */
            }
            setHidden(true);
          }}
        >
          ×
        </button>
      </div>
      <span className="sr-only">{rentgenPrimaryCtaLabel("digital")}</span>
    </div>
  );
}
