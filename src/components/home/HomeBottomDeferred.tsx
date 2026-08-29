"use client";

import { useState, type ComponentType } from "react";
import { DeferClientMount } from "@/components/perf/DeferClientMount";

type HomeBottomDeferredProps = {
  journeyMetadata: Record<string, unknown>;
};

/** Situace + lead formulář — načtení až pod foldem. */
export function HomeBottomDeferred({ journeyMetadata }: HomeBottomDeferredProps) {
  const [BottomBlock, setBottomBlock] = useState<ComponentType<{
    journeyMetadata: Record<string, unknown>;
  }> | null>(null);

  return (
    <DeferClientMount
      rootMargin="240px 0px"
      onMount={() => {
        if (BottomBlock) return;
        void import("@/components/home/HomeBottomBlock").then((m) => {
          setBottomBlock(() => m.HomeBottomBlock);
        });
      }}
    >
      {BottomBlock ? <BottomBlock journeyMetadata={journeyMetadata} /> : null}
    </DeferClientMount>
  );
}
