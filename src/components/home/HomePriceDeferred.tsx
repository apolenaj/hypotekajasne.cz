"use client";

import { useState, type ComponentType } from "react";
import { DeferClientMount } from "@/components/perf/DeferClientMount";

function Placeholder() {
  return (
    <div className="h-[28rem] rounded-[18px] border border-gray-200 bg-white" />
  );
}

export function HomePriceDeferred() {
  const [Chart, setChart] = useState<ComponentType | null>(null);
  return (
    <DeferClientMount
      placeholder={<Placeholder />}
      rootMargin="320px 0px"
      onMount={() => {
        if (Chart) return;
        void import("@/components/home/HomePriceChart").then((mod) => {
          setChart(() => mod.HomePriceChart);
        });
      }}
    >
      {Chart ? <Chart /> : <Placeholder />}
    </DeferClientMount>
  );
}
