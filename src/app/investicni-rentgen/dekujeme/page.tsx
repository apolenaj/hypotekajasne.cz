import type { Metadata } from "next";
import { Suspense } from "react";
import { RentgenThankYouClient } from "@/components/property-rentgen/RentgenThankYouClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Děkujeme za objednávku",
  description:
    "Potvrzení platby Investičního rentgenu. Stav objednávky a odkaz ke stažení výstupu.",
  path: "/investicni-rentgen/dekujeme",
  noIndex: true,
});

export default function RentgenDekujemePage() {
  return (
    <main className="min-h-[70vh] bg-[#f5f7f6]">
      <Suspense
        fallback={
          <p className="px-4 py-14 text-sm text-muted-foreground">
            Načítám stav platby…
          </p>
        }
      >
        <RentgenThankYouClient />
      </Suspense>
    </main>
  );
}
