"use client";

import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeSituationSelector } from "@/components/home/HomeSituationSelector";

export function HomeBottomBlock({
  journeyMetadata,
}: {
  journeyMetadata: Record<string, unknown>;
}) {
  return (
    <>
      <HomeSituationSelector />
      <HomeFinalCta journeyMetadata={journeyMetadata} />
    </>
  );
}
