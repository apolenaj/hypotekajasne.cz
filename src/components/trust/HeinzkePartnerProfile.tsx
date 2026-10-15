import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Home,
  RefreshCw,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import {
  HEINZKE_PARTNER_PUBLIC,
  type HeinzkeFocusArea,
} from "@/lib/trust/heinzke-partner-public";
import { CTA_CS, CTA_PRIMARY_CLASS, PRIMARY_PRODUCT_CTA } from "@/lib/ux/cta";
import { cn } from "@/lib/utils";

const FOCUS_ICONS: Record<HeinzkeFocusArea["icon"], LucideIcon> = {
  home: Home,
  building: Building2,
  refresh: RefreshCw,
  wallet: Wallet,
};

type HeinzkePartnerProfileProps = {
  /** Visual density for surrounding page shell. */
  variant?: "page" | "trust";
  className?: string;
  showCta?: boolean;
  /** Heading level for the person name (page already has h1/h2). */
  nameAs?: "h2" | "h3";
};

export function HeinzkePartnerProfile({
  variant = "page",
  className,
  showCta = true,
  nameAs = "h3",
}: HeinzkePartnerProfileProps) {
  const partner = HEINZKE_PARTNER_PUBLIC;
  const NameTag = nameAs;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-white shadow-sm",
        variant === "trust" ? "p-5 sm:p-6" : "p-5 sm:p-7 md:p-8",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col items-center gap-4 md:items-stretch">
          <div className="relative aspect-square w-full max-w-[18rem] overflow-hidden rounded-2xl border border-border/80 bg-slate-100 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.28)] md:max-w-none">
            <Image
              src={partner.photoUrl}
              alt={partner.photoAlt}
              width={partner.photoWidth}
              height={partner.photoHeight}
              className="h-full w-full object-cover object-[center_18%]"
              sizes="(max-width: 768px) 18rem, 18rem"
              priority={variant === "page"}
            />
          </div>
          <p className="text-center text-xs font-semibold tracking-wide text-deep-teal md:border-l-2 md:border-deep-teal/30 md:pl-3 md:text-left">
            <span className="block font-heading text-2xl font-bold tabular-nums leading-none text-text-dark">
              {partner.experienceYears}
            </span>
            <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
              let zkušeností ve financích
            </span>
          </p>
        </div>

        <div className="min-w-0">
          <NameTag className="font-heading text-2xl font-bold tracking-tight text-text-dark md:text-3xl">
            {partner.personName}
          </NameTag>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-deep-teal sm:text-base">
            {partner.roleOnPlatform}
          </p>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            {partner.summaryParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {partner.focusAreas.map((area) => {
              const Icon = FOCUS_ICONS[area.icon];
              return (
                <li
                  key={area.id}
                  className="flex min-h-[3.25rem] items-start gap-3 rounded-2xl border border-border bg-[#f7f8f7] px-3.5 py-3"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-deep-teal/10 text-deep-teal">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="pt-1 text-sm font-medium leading-snug text-text-dark">
                    {area.label}
                  </span>
                </li>
              );
            })}
          </ul>

          {showCta ? (
            <Link
              href={PRIMARY_PRODUCT_CTA.href}
              className={cn(CTA_PRIMARY_CLASS, "mt-6")}
            >
              {CTA_CS.discoverSituation}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
