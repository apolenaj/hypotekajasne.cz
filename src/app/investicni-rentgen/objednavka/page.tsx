import type { Metadata } from "next";
import { Suspense } from "react";
import { RentgenOrderRecoveryClient } from "@/components/property-rentgen/RentgenOrderRecoveryClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Objednávka Investičního rentgenu",
  description:
    "Dokončení platby nebo kontrola stavu objednávky Investičního rentgenu.",
  path: "/investicni-rentgen/objednavka",
  noIndex: true,
});

export default function RentgenObjednavkaPage() {
  return (
    <main className="min-h-[70vh] bg-[#f5f7f6]">
      <Suspense
        fallback={
          <p className="px-4 py-14 text-sm text-muted-foreground">
            Načítám objednávku…
          </p>
        }
      >
        <RentgenOrderRecoveryClient />
      </Suspense>
    </main>
  );
}
