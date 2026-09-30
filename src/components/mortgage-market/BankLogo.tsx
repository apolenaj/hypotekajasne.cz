"use client";

import { useState } from "react";
import {
  BANK_LOGO_BOX_PX,
  getPartnerBankLogoAsset,
  type BankLogoSize,
} from "@/lib/mortgage-market/bank-logos";
import { cn } from "@/lib/utils";

type BankLogoProps = {
  /** Partner slug or known bank display/scrape name. */
  slugOrName: string;
  /** Visible bank name — used for alt when logo replaces text. */
  name: string;
  size?: BankLogoSize;
  /**
   * When true (default), logo sits next to a visible name → empty alt.
   * When false, logo replaces the name → alt = name.
   */
  decorative?: boolean;
  className?: string;
};

/**
 * Reserved-size bank logo with contain fit and text fallback on load error.
 */
export function BankLogo({
  slugOrName,
  name,
  size = "card",
  decorative = true,
  className,
}: BankLogoProps) {
  const asset = getPartnerBankLogoAsset(slugOrName);
  const box = BANK_LOGO_BOX_PX[size];
  const [failed, setFailed] = useState(false);

  if (!asset || failed) {
    return null;
  }

  const maxW = Math.round(box.width * asset.opticalScale);
  const maxH = Math.round(box.height * asset.opticalScale);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-start overflow-hidden",
        className
      )}
      style={{ width: box.width, height: box.height }}
      aria-hidden={decorative ? true : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG; avoid next/image rasterization */}
      <img
        src={asset.src}
        alt={decorative ? "" : name}
        width={box.width}
        height={box.height}
        decoding="async"
        className="object-contain object-left"
        style={{
          width: "auto",
          height: "auto",
          maxWidth: maxW,
          maxHeight: maxH,
        }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
