import type { Metadata } from "next";
import { PracticalSituationsHub } from "@/components/practical-situations/PracticalSituationsHub";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Praktické hypoteční situace",
  description:
    "Rozcestník konkrétních situací: cizinci, společná hypotéka, odhad, rodina, firma, pronájem a financování přes hranice.",
  path: routes.pruvodce.praktickeSituace,
});

export default function Page() {
  return <PracticalSituationsHub />;
}
