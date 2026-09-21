"use client";

import dynamic from "next/dynamic";

const PracticeVizLazy = dynamic(
  () =>
    import("@/components/academy/practice/PracticeViz").then(
      (m) => m.PracticeViz
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl border border-dashed border-border bg-[#f7f8f7] p-4 text-sm text-muted-foreground"
        aria-hidden
      >
        Načítám vizualizaci…
      </div>
    ),
  }
);

export function PracticeVizIsland({ vizId }: { vizId: string }) {
  return <PracticeVizLazy vizId={vizId} />;
}
