import type { Metadata } from "next";
import { FutureRentPage } from "@/components/scenarios/FutureRentPage";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { scenarioRoutes } from "@/lib/scenarios/sources";

export const metadata: Metadata = buildPageMetadata({
  title: "Budoucí příjem z nájmu — započtení při hypotéce",
  description:
    "Jak může budoucí nebo existující nájem vstoupit do posouzení hypotéky. Model uznání příjmu odděleně od cash flow po nákladech.",
  path: scenarioRoutes.rentTopic,
});

export default function Page() {
  return <FutureRentPage mode="topic" />;
}
