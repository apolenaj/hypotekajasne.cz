"use client";

import { HomeFinalCta } from "@/components/home/HomeFinalCta";

export function HomeBottomBlock({
  journeyMetadata,
}: {
  journeyMetadata: Record<string, unknown>;
}) {
  return <HomeFinalCta journeyMetadata={journeyMetadata} />;
}
