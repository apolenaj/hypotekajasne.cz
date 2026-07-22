"use client";

import {
  getPartnerClaimLabels,
  type PartnerVerification,
} from "@/lib/partners/verification";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<
  PartnerVerification["verificationStatus"],
  string
> = {
  VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-950",
  PENDING: "border-amber-200 bg-amber-50 text-amber-950",
  UNVERIFIED: "border-slate-200 bg-slate-50 text-slate-800",
};

/**
 * Nikdy nezobrazí silnější claim, než odpovídá verificationStatus.
 */
export function PartnerVerificationBadge({
  verification,
  className,
  showRegistryLink = true,
}: {
  verification: PartnerVerification;
  className?: string;
  showRegistryLink?: boolean;
}) {
  const labels = getPartnerClaimLabels(verification);
  const { verificationStatus, registryUrl, regulator, verifiedAt, name } =
    verification;

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 text-sm",
        STATUS_STYLE[verificationStatus],
        className
      )}
      role="status"
    >
      <p className="font-semibold">{labels.badgeLabel}</p>
      {verificationStatus === "VERIFIED" && name ? (
        <p className="mt-0.5 text-xs opacity-90">{name}</p>
      ) : null}
      {verificationStatus === "VERIFIED" && regulator ? (
        <p className="mt-1 text-[11px] opacity-80">
          Dohled / registr: {regulator}
          {verifiedAt ? ` · ověřeno ${verifiedAt}` : null}
        </p>
      ) : null}
      {verificationStatus === "VERIFIED" &&
      showRegistryLink &&
      registryUrl ? (
        <a
          href={registryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block text-xs font-semibold underline underline-offset-2"
        >
          Otevřít veřejný registr
        </a>
      ) : null}
      {verificationStatus === "PENDING" ? (
        <p className="mt-1 text-[11px] leading-snug opacity-90">
          Registrační údaje partnera zveřejníme až po dokončení ověření. Do té
          doby nepřisuzujeme status „ověřený“ ani „licencovaný“.
        </p>
      ) : null}
      {verificationStatus === "UNVERIFIED" ? (
        <p className="mt-1 text-[11px] leading-snug opacity-90">
          Identita partnera není zveřejněna. Nepoužíváme tvrzení „prověřený“ /
          „licencovaný“ o konkrétním partnerovi.
        </p>
      ) : null}
    </div>
  );
}
