import Link from "next/link";
import { Home } from "lucide-react";
import { SITE_BRAND, SITE_DOMAIN_LABEL } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  href?: string;
  showIcon?: boolean;
  showDomain?: boolean;
  /** Compact: HJ on xs, full wordmark from sm */
  compact?: boolean;
  /** Extra classes on the home link. Header passes shrink-0 so the wordmark cannot collapse. */
  rootClassName?: string;
  className?: string;
  onClick?: () => void;
};

/**
 * Wordmark „Hypotéka Jasně“ — .cz / doména jen sekundárně (menší typografie).
 */
export function BrandWordmark({
  href = "/",
  showIcon = true,
  showDomain = false,
  compact = false,
  rootClassName,
  className,
  onClick,
}: BrandWordmarkProps) {
  const mark = (
    <span
      className={cn(
        "inline-flex min-w-0 items-baseline gap-1 font-heading font-bold text-deep-teal",
        className
      )}
    >
      {compact ? (
        <>
          <span className="sm:hidden">HJ</span>
          <span className="hidden sm:inline">{SITE_BRAND}</span>
        </>
      ) : (
        <span>{SITE_BRAND}</span>
      )}
      {showDomain ? (
        <span className="text-[0.65em] font-semibold tracking-tight text-deep-teal/55">
          {SITE_DOMAIN_LABEL}
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return (
      <span className="inline-flex items-center gap-2">
        {showIcon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-deep-teal text-white">
            <Home className="h-5 w-5" aria-hidden />
          </span>
        ) : null}
        {mark}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2",
        rootClassName
      )}
      aria-label={`${SITE_BRAND} — domů`}
    >
      {showIcon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-deep-teal text-white">
          <Home className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
      {mark}
    </Link>
  );
}
