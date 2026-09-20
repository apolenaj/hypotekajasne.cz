"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { routes } from "@/lib/routes";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import { analysisPackageFromQuery } from "@/lib/property-rentgen/package-query";

function StickyInner({ live }: { live: boolean }) {
  const searchParams = useSearchParams();
  const [hidden, setHidden] = useState(true);
  const isPremium =
    analysisPackageFromQuery(searchParams.get("balicek")) === "premium";

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

  const href = isPremium
    ? `${routes.investicniRentgen}?balicek=4990#premium-objednavka`
    : `${routes.investicniRentgen}?balicek=999#premium-objednavka`;
  const title = isPremium ? "Individuální rozbor" : "Investiční rentgen";
  const price = isPremium ? formatAnalysisPrice() : formatDigitalRentgenPrice();
  const cta = isPremium
    ? `Koupit rozbor – ${price}`
    : `Získat Rentgen – ${price}`;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Rychlá objednávka"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-dark">{title}</p>
          <p className="text-xs text-muted-foreground">
            {price} · jednorázově
          </p>
        </div>
        <Link
          href={href}
          className={
            isPremium
              ? "shrink-0 rounded-xl bg-deep-teal px-3 py-2.5 text-xs font-bold text-white"
              : "shrink-0 rounded-xl bg-muted-gold px-3 py-2.5 text-xs font-bold text-text-dark"
          }
        >
          {cta}
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
    </div>
  );
}

/** Dismissible sticky CTA for mobile — only when checkout is commercially live. */
export function RentgenStickyMobileCta({ live }: { live: boolean }) {
  return (
    <Suspense fallback={null}>
      <StickyInner live={live} />
    </Suspense>
  );
}
